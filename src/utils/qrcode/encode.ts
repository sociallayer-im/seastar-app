/**
 * QR Code encoder, ISO/IEC 18004.
 *
 * Produces the module matrix for a string: mode-optimised segmentation, the
 * smallest version that fits, Reed-Solomon error correction, block
 * interleaving, function patterns, and the lowest-penalty of the eight data
 * masks.
 *
 * Structural tables (capacities, block splits, alignment geometry, mask
 * functions, format/version BCH words) live in `./spec` and are shared with the
 * decoder; GF(256) arithmetic comes from `./galois`.
 *
 * Modules are indexed `row * size + column` throughout, matching `BitMatrix`'s
 * `y * width + x`.
 */

import {BitMatrix} from './bitmatrix'
import {gfExp, gfMul, polyMul} from './galois'
import {
    alignmentCoordinates,
    ALPHANUMERIC_CHARS,
    buildFunctionPatternMask,
    characterCountBits,
    dataCodewordCount,
    ecBlockCount,
    ecCodewordCount,
    formatInfoBits,
    MASK_FUNCTIONS,
    MODE_ALPHANUMERIC,
    MODE_BYTE,
    MODE_NUMERIC,
    symbolSize,
    TOTAL_CODEWORDS,
    versionInfoBits
} from './spec'
import type {ErrorCorrectionLevel} from './spec'

export interface EncodeOptions {
    errorCorrectionLevel?: ErrorCorrectionLevel
}

export interface EncodedSymbol {
    matrix: BitMatrix
    version: number
    errorCorrectionLevel: ErrorCorrectionLevel
    mask: number
}

// ---------------------------------------------------------------------------
// Segmentation
// ---------------------------------------------------------------------------

/**
 * A run of characters encodable in one mode. `length` is the character count
 * for numeric/alphanumeric and the UTF-8 byte count for byte mode, because
 * that is what the character-count indicator holds.
 */
interface Segment {
    data: string
    mode: number
    length: number
}

const TEXT_ENCODER = new TextEncoder()

function utf8Bytes(text: string): Uint8Array {
    return TEXT_ENCODER.encode(text)
}

/**
 * Note the alphanumeric class excludes digits: digits always start their own
 * run, so a numeric prefix can be considered separately from the letters
 * around it. Anything outside the alphanumeric set (including lowercase and
 * every non-ASCII character) is a byte run.
 */
const NUMERIC_RUN = /[0-9]+/g
const ALPHANUMERIC_RUN = /[A-Z $%*+\-./:]+/g
const BYTE_RUN = /[^A-Z0-9 $%*+\-./:]+/g

const NUMERIC_ONLY = /^[0-9]+$/
const ALPHANUMERIC_ONLY = /^[A-Z0-9 $%*+\-./:]+$/

/** The most compact mode that can represent a whole string. */
function bestModeFor(text: string): number {
    if (NUMERIC_ONLY.test(text)) return MODE_NUMERIC
    if (ALPHANUMERIC_ONLY.test(text)) return MODE_ALPHANUMERIC
    return MODE_BYTE
}

function collectRuns(pattern: RegExp, mode: number, text: string): Array<{index: number; run: Segment}> {
    const out: Array<{index: number; run: Segment}> = []
    const regex = new RegExp(pattern.source, 'g')
    let match: RegExpExecArray | null
    while ((match = regex.exec(text)) !== null) {
        out.push({index: match.index, run: {data: match[0], mode, length: match[0].length}})
    }
    return out
}

/** Split a string into maximal single-mode runs, in order. */
function splitIntoRuns(text: string): Segment[] {
    const found = [
        ...collectRuns(NUMERIC_RUN, MODE_NUMERIC, text),
        ...collectRuns(ALPHANUMERIC_RUN, MODE_ALPHANUMERIC, text),
        ...collectRuns(BYTE_RUN, MODE_BYTE, text)
    ]
    return found.sort((a, b) => a.index - b.index).map((entry) => entry.run)
}

/** Payload bits (excluding mode indicator and character count) for a run. */
function segmentBitsLength(length: number, mode: number): number {
    switch (mode) {
        case MODE_NUMERIC:
            return 10 * Math.floor(length / 3) + (length % 3 ? (length % 3) * 3 + 1 : 0)
        case MODE_ALPHANUMERIC:
            return 11 * Math.floor(length / 2) + 6 * (length % 2)
        default:
            return length * 8
    }
}

/** Build a segment for text known to be encodable in `mode`. */
function makeSegment(data: string, mode: number): Segment {
    return {data, mode, length: mode === MODE_BYTE ? utf8Bytes(data).length : data.length}
}

/**
 * Every mode each run could be encoded in. A numeric run can also go out as
 * alphanumeric or byte, an alphanumeric run as byte; upgrading a short run to
 * its neighbour's mode is often cheaper than paying for a mode switch.
 */
function buildNodes(runs: Segment[]): Segment[][] {
    return runs.map((run) => {
        switch (run.mode) {
            case MODE_NUMERIC:
                return [
                    run,
                    {data: run.data, mode: MODE_ALPHANUMERIC, length: run.length},
                    {data: run.data, mode: MODE_BYTE, length: run.length}
                ]
            case MODE_ALPHANUMERIC:
                return [run, {data: run.data, mode: MODE_BYTE, length: run.length}]
            default:
                return [{data: run.data, mode: MODE_BYTE, length: utf8Bytes(run.data).length}]
        }
    })
}

interface GraphNode {
    node: Segment
    lastCount: number
}

interface Graph {
    map: Record<string, Record<string, number>>
    table: Record<string, GraphNode>
}

/**
 * A layered DAG whose shortest path is the cheapest segmentation. Each edge is
 * the marginal bit cost of appending the next run in a given mode: free of
 * header when it continues the previous segment's mode (and then only the
 * *incremental* payload cost, since e.g. two alphanumeric characters share an
 * 11-bit group), or payload plus a 4-bit mode indicator and a character count
 * when it starts a new segment.
 *
 * Node ids are `${groupIndex}${modeIndex}` so that the plain-object edge maps
 * enumerate in a stable, mode-ascending order — the tie-break between equal
 * cost paths depends on it.
 */
function buildGraph(nodes: Segment[][], version: number): Graph {
    const table: Record<string, GraphNode> = {}
    const map: Record<string, Record<string, number>> = {start: {}}
    let previousIds = ['start']

    for (let i = 0; i < nodes.length; i++) {
        const group = nodes[i]
        const currentIds: string[] = []

        for (let j = 0; j < group.length; j++) {
            const node = group[j]
            const key = `${i}${j}`

            currentIds.push(key)
            table[key] = {node, lastCount: 0}
            map[key] = {}

            for (const previousId of previousIds) {
                const previous = table[previousId]
                if (previous && previous.node.mode === node.mode) {
                    map[previousId][key] =
                        segmentBitsLength(previous.lastCount + node.length, node.mode) -
                        segmentBitsLength(previous.lastCount, node.mode)
                    previous.lastCount += node.length
                } else {
                    if (previous) previous.lastCount = node.length
                    map[previousId][key] =
                        segmentBitsLength(node.length, node.mode) + 4 + characterCountBits(node.mode, version)
                }
            }
        }

        previousIds = currentIds
    }

    for (const id of previousIds) map[id].end = 0

    return {map, table}
}

/**
 * Dijkstra with a naive sorted queue. The queue is re-sorted on every push with
 * a stable sort, so among equal-cost nodes the earliest inserted pops first —
 * which is what fixes the segmentation when two encodings cost the same.
 */
function shortestPath(map: Record<string, Record<string, number>>, source: string, target: string): string[] | null {
    const predecessors: Record<string, string> = {}
    const costs: Record<string, number> = {[source]: 0}
    const queue: Array<{value: string; cost: number}> = [{value: source, cost: 0}]

    while (queue.length > 0) {
        const closest = queue.shift() as {value: string; cost: number}
        const adjacent = map[closest.value] || {}

        for (const next in adjacent) {
            const candidate = closest.cost + adjacent[next]
            if (costs[next] === undefined || costs[next] > candidate) {
                costs[next] = candidate
                queue.push({value: next, cost: candidate})
                queue.sort((a, b) => a.cost - b.cost)
                predecessors[next] = closest.value
            }
        }
    }

    if (costs[target] === undefined) return null

    const path: string[] = []
    let current: string | undefined = target
    while (current) {
        path.push(current)
        current = predecessors[current]
    }
    return path.reverse()
}

/** Concatenate neighbouring segments that ended up in the same mode. */
function mergeSegments(segments: Segment[]): Segment[] {
    const merged: string[] = []
    const modes: number[] = []
    for (const segment of segments) {
        if (modes.length > 0 && modes[modes.length - 1] === segment.mode) {
            merged[merged.length - 1] += segment.data
        } else {
            merged.push(segment.data)
            modes.push(segment.mode)
        }
    }
    return merged.map((data, i) => makeSegment(data, modes[i]))
}

/** The cheapest segmentation of `text`, assuming character counts for `version`. */
function optimalSegments(text: string, version: number): Segment[] {
    const nodes = buildNodes(splitIntoRuns(text))
    const graph = buildGraph(nodes, version)
    const path = shortestPath(graph.map, 'start', 'end')
    if (path === null) return [makeSegment(text, bestModeFor(text))]

    const chosen: Segment[] = []
    for (let i = 1; i < path.length - 1; i++) chosen.push(graph.table[path[i]].node)
    return mergeSegments(chosen)
}

// ---------------------------------------------------------------------------
// Version selection
// ---------------------------------------------------------------------------

/** Storable characters (bytes, for byte mode) in a single-segment symbol. */
function capacity(version: number, level: ErrorCorrectionLevel, mode: number): number {
    const dataBits = dataCodewordCount(version, level) * 8
    const usableBits = dataBits - (characterCountBits(mode, version) + 4)
    switch (mode) {
        case MODE_NUMERIC:
            return Math.floor((usableBits / 10) * 3)
        case MODE_ALPHANUMERIC:
            return Math.floor((usableBits / 11) * 2)
        default:
            return Math.floor(usableBits / 8)
    }
}

function totalBits(segments: Segment[], version: number): number {
    let bits = 0
    for (const segment of segments) {
        bits += characterCountBits(segment.mode, version) + 4 + segmentBitsLength(segment.length, segment.mode)
    }
    return bits
}

/** Smallest version holding these segments, or null if even version 40 cannot. */
function bestVersion(segments: Segment[], level: ErrorCorrectionLevel): number | null {
    if (segments.length === 0) return 1

    if (segments.length === 1) {
        const only = segments[0]
        for (let version = 1; version <= 40; version++) {
            if (only.length <= capacity(version, level, only.mode)) return version
        }
        return null
    }

    for (let version = 1; version <= 40; version++) {
        if (totalBits(segments, version) <= dataCodewordCount(version, level) * 8) return version
    }
    return null
}

// ---------------------------------------------------------------------------
// Bitstream
// ---------------------------------------------------------------------------

class BitWriter {
    private readonly bytes: number[] = []
    private bitLength = 0

    get length(): number {
        return this.bitLength
    }

    putBit(bit: number): void {
        if (this.bitLength % 8 === 0) this.bytes.push(0)
        if (bit) this.bytes[this.bytes.length - 1] |= 0x80 >>> this.bitLength % 8
        this.bitLength++
    }

    put(value: number, bits: number): void {
        for (let i = 0; i < bits; i++) this.putBit((value >>> (bits - 1 - i)) & 1)
    }

    toBytes(): number[] {
        return this.bytes
    }
}

function writeSegment(writer: BitWriter, segment: Segment): void {
    if (segment.mode === MODE_NUMERIC) {
        let i = 0
        for (; i + 3 <= segment.data.length; i += 3) {
            writer.put(Number.parseInt(segment.data.slice(i, i + 3), 10), 10)
        }
        const remaining = segment.data.length - i
        if (remaining > 0) {
            writer.put(Number.parseInt(segment.data.slice(i), 10), remaining * 3 + 1)
        }
        return
    }

    if (segment.mode === MODE_ALPHANUMERIC) {
        let i = 0
        for (; i + 2 <= segment.data.length; i += 2) {
            const value =
                ALPHANUMERIC_CHARS.indexOf(segment.data[i]) * 45 + ALPHANUMERIC_CHARS.indexOf(segment.data[i + 1])
            writer.put(value, 11)
        }
        if (segment.data.length % 2) writer.put(ALPHANUMERIC_CHARS.indexOf(segment.data[i]), 6)
        return
    }

    for (const byte of utf8Bytes(segment.data)) writer.put(byte, 8)
}

/**
 * Mode indicators, character counts and payloads, then the terminator, byte
 * alignment and the alternating 0xEC/0x11 pad codewords that fill the symbol.
 */
function buildDataCodewords(segments: Segment[], version: number, level: ErrorCorrectionLevel): number[] {
    const writer = new BitWriter()

    for (const segment of segments) {
        writer.put(segment.mode, 4)
        writer.put(segment.length, characterCountBits(segment.mode, version))
        writeSegment(writer, segment)
    }

    const capacityBits = dataCodewordCount(version, level) * 8

    // Terminator: four zero bits, or fewer if the symbol is nearly full.
    if (writer.length + 4 <= capacityBits) writer.put(0, 4)
    while (writer.length % 8 !== 0) writer.putBit(0)

    const bytes = writer.toBytes()
    for (let i = 0; bytes.length * 8 < capacityBits; i++) {
        bytes.push(i % 2 ? 0x11 : 0xec)
    }
    return bytes
}

// ---------------------------------------------------------------------------
// Reed-Solomon
// ---------------------------------------------------------------------------

const generatorCache = new Map<number, number[]>()

/** (x - a^0)(x - a^1)...(x - a^(degree-1)), highest degree first. */
function generatorPolynomial(degree: number): number[] {
    const cached = generatorCache.get(degree)
    if (cached !== undefined) return cached

    let poly = [1]
    for (let i = 0; i < degree; i++) poly = polyMul(poly, [gfExp(i), 1])
    const descending = poly.slice().reverse()
    generatorCache.set(degree, descending)
    return descending
}

/** The `degree` EC codewords for one data block. */
function rsEncode(data: number[], degree: number): number[] {
    const generator = generatorPolynomial(degree)
    const remainder = data.concat(new Array<number>(degree).fill(0))

    for (let i = 0; i < data.length; i++) {
        const coefficient = remainder[i]
        if (coefficient === 0) continue
        for (let j = 1; j <= degree; j++) {
            remainder[i + j] ^= gfMul(generator[j], coefficient)
        }
    }

    return remainder.slice(data.length)
}

/**
 * Split the data codewords into blocks, add EC to each, then interleave: one
 * data codeword per block round-robin (short blocks dropping out once
 * exhausted), then all the EC codewords in the same order.
 */
function interleave(dataCodewords: number[], version: number, level: ErrorCorrectionLevel): number[] {
    const total = TOTAL_CODEWORDS[version]
    const dataTotal = total - ecCodewordCount(version, level)
    const blockCount = ecBlockCount(version, level)

    const shortBlocks = blockCount - (total % blockCount)
    const shortDataLength = Math.floor(dataTotal / blockCount)
    const ecLength = Math.floor(total / blockCount) - shortDataLength

    const dataBlocks: number[][] = []
    const ecBlocks: number[][] = []
    let offset = 0
    let maxDataLength = 0

    for (let b = 0; b < blockCount; b++) {
        const size = b < shortBlocks ? shortDataLength : shortDataLength + 1
        const block = dataCodewords.slice(offset, offset + size)
        dataBlocks.push(block)
        ecBlocks.push(rsEncode(block, ecLength))
        offset += size
        maxDataLength = Math.max(maxDataLength, size)
    }

    const out: number[] = []
    for (let i = 0; i < maxDataLength; i++) {
        for (let b = 0; b < blockCount; b++) {
            if (i < dataBlocks[b].length) out.push(dataBlocks[b][i])
        }
    }
    for (let i = 0; i < ecLength; i++) {
        for (let b = 0; b < blockCount; b++) out.push(ecBlocks[b][i])
    }
    return out
}

// ---------------------------------------------------------------------------
// Matrix construction
// ---------------------------------------------------------------------------

class ModuleGrid {
    readonly size: number
    readonly modules: Uint8Array
    readonly reserved: Uint8ClampedArray

    constructor(version: number) {
        this.size = symbolSize(version)
        this.modules = new Uint8Array(this.size * this.size)
        // The function-pattern mask is exactly the set of modules the data
        // mask must leave alone, so the decoder's version is reused verbatim.
        this.reserved = buildFunctionPatternMask(version).data
    }

    get(row: number, column: number): number {
        return this.modules[row * this.size + column]
    }

    set(row: number, column: number, value: number): void {
        this.modules[row * this.size + column] = value
    }

    isReserved(row: number, column: number): boolean {
        return this.reserved[row * this.size + column] === 1
    }

    toBitMatrix(): BitMatrix {
        return new BitMatrix(Uint8ClampedArray.from(this.modules), this.size, this.size)
    }
}

function setupFinderPatterns(grid: ModuleGrid): void {
    const size = grid.size
    const corners: Array<[number, number]> = [
        [0, 0],
        [size - 7, 0],
        [0, size - 7]
    ]

    for (const [row, column] of corners) {
        // -1..7 covers the separator ring as well as the 7x7 pattern.
        for (let r = -1; r <= 7; r++) {
            if (row + r < 0 || row + r >= size) continue
            for (let c = -1; c <= 7; c++) {
                if (column + c < 0 || column + c >= size) continue
                const dark =
                    (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
                    (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
                    (r >= 2 && r <= 4 && c >= 2 && c <= 4)
                grid.set(row + r, column + c, dark ? 1 : 0)
            }
        }
    }
}

function setupTimingPatterns(grid: ModuleGrid): void {
    for (let i = 8; i < grid.size - 8; i++) {
        const value = i % 2 === 0 ? 1 : 0
        grid.set(i, 6, value)
        grid.set(6, i, value)
    }
}

function setupAlignmentPatterns(grid: ModuleGrid, version: number): void {
    for (const [row, column] of alignmentCoordinates(version)) {
        for (let r = -2; r <= 2; r++) {
            for (let c = -2; c <= 2; c++) {
                const dark = r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)
                grid.set(row + r, column + c, dark ? 1 : 0)
            }
        }
    }
}

function setupVersionInfo(grid: ModuleGrid, version: number): void {
    const size = grid.size
    const bits = versionInfoBits(version)
    for (let i = 0; i < 18; i++) {
        const row = Math.floor(i / 3)
        const column = (i % 3) + size - 11
        const value = (bits >> i) & 1
        grid.set(row, column, value)
        grid.set(column, row, value)
    }
}

function setupFormatInfo(grid: ModuleGrid, level: ErrorCorrectionLevel, mask: number): void {
    const size = grid.size
    const bits = formatInfoBits(level, mask)

    for (let i = 0; i < 15; i++) {
        const value = (bits >> i) & 1

        // Copy 1, running down the left of the top-left finder...
        if (i < 6) grid.set(i, 8, value)
        else if (i < 8) grid.set(i + 1, 8, value)
        else grid.set(size - 15 + i, 8, value)

        // ...and copy 2, running left from the top-right finder.
        if (i < 8) grid.set(8, size - i - 1, value)
        else if (i < 9) grid.set(8, 15 - i, value)
        else grid.set(8, 14 - i, value)
    }

    // The dark module, always set.
    grid.set(size - 8, 8, 1)
}

/**
 * Zigzag placement: two-module-wide columns walked from the right edge
 * leftwards, alternating upwards and downwards, right module of the pair first,
 * skipping function patterns. Column 6 is the vertical timing pattern and is
 * not part of any pair. The inverse of the decoder's `readCodewords`.
 */
function setupData(grid: ModuleGrid, codewords: number[]): void {
    const size = grid.size
    let direction = -1
    let row = size - 1
    let bitIndex = 7
    let byteIndex = 0

    for (let column = size - 1; column > 0; column -= 2) {
        if (column === 6) column--

        for (;;) {
            for (let c = 0; c < 2; c++) {
                if (grid.isReserved(row, column - c)) continue

                let dark = 0
                if (byteIndex < codewords.length) {
                    dark = (codewords[byteIndex] >>> bitIndex) & 1
                }
                grid.set(row, column - c, dark)

                bitIndex--
                if (bitIndex === -1) {
                    byteIndex++
                    bitIndex = 7
                }
            }

            row += direction
            if (row < 0 || row >= size) {
                row -= direction
                direction = -direction
                break
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Masking
// ---------------------------------------------------------------------------

function applyMask(grid: ModuleGrid, mask: number): void {
    const size = grid.size
    const maskFn = MASK_FUNCTIONS[mask]
    for (let column = 0; column < size; column++) {
        for (let row = 0; row < size; row++) {
            if (grid.isReserved(row, column)) continue
            if (maskFn(row, column)) grid.set(row, column, grid.get(row, column) ^ 1)
        }
    }
}

const PENALTY_N1 = 3
const PENALTY_N2 = 3
const PENALTY_N3 = 40
const PENALTY_N4 = 10

/** Rule 1: runs of five or more same-coloured modules in a row or column. */
function penaltyRule1(grid: ModuleGrid): number {
    const size = grid.size
    let points = 0

    for (let row = 0; row < size; row++) {
        let sameCountCol = 0
        let sameCountRow = 0
        let lastCol = -1
        let lastRow = -1

        for (let column = 0; column < size; column++) {
            const horizontal = grid.get(row, column)
            if (horizontal === lastCol) {
                sameCountCol++
            } else {
                if (sameCountCol >= 5) points += PENALTY_N1 + (sameCountCol - 5)
                lastCol = horizontal
                sameCountCol = 1
            }

            const vertical = grid.get(column, row)
            if (vertical === lastRow) {
                sameCountRow++
            } else {
                if (sameCountRow >= 5) points += PENALTY_N1 + (sameCountRow - 5)
                lastRow = vertical
                sameCountRow = 1
            }
        }

        if (sameCountCol >= 5) points += PENALTY_N1 + (sameCountCol - 5)
        if (sameCountRow >= 5) points += PENALTY_N1 + (sameCountRow - 5)
    }

    return points
}

/** Rule 2: 2x2 blocks of one colour. */
function penaltyRule2(grid: ModuleGrid): number {
    const size = grid.size
    let blocks = 0
    for (let row = 0; row < size - 1; row++) {
        for (let column = 0; column < size - 1; column++) {
            const sum =
                grid.get(row, column) +
                grid.get(row, column + 1) +
                grid.get(row + 1, column) +
                grid.get(row + 1, column + 1)
            if (sum === 4 || sum === 0) blocks++
        }
    }
    return blocks * PENALTY_N2
}

/** Rule 3: the 1:1:3:1:1 finder-like pattern with a four-module light margin. */
function penaltyRule3(grid: ModuleGrid): number {
    const size = grid.size
    let found = 0

    for (let row = 0; row < size; row++) {
        let bitsCol = 0
        let bitsRow = 0
        for (let column = 0; column < size; column++) {
            bitsCol = ((bitsCol << 1) & 0x7ff) | grid.get(row, column)
            if (column >= 10 && (bitsCol === 0x5d0 || bitsCol === 0x05d)) found++

            bitsRow = ((bitsRow << 1) & 0x7ff) | grid.get(column, row)
            if (column >= 10 && (bitsRow === 0x5d0 || bitsRow === 0x05d)) found++
        }
    }

    return found * PENALTY_N3
}

/** Rule 4: deviation of the dark-module proportion from 50%, in 5% steps. */
function penaltyRule4(grid: ModuleGrid): number {
    let dark = 0
    for (let i = 0; i < grid.modules.length; i++) dark += grid.modules[i]
    const k = Math.abs(Math.ceil(((dark * 100) / grid.modules.length) / 5) - 10)
    return k * PENALTY_N4
}

/**
 * Evaluate all eight masks and keep the lowest total penalty. The format
 * information is written for each candidate first, because those modules count
 * towards the penalty even though they are never masked themselves.
 */
function chooseMask(grid: ModuleGrid, level: ErrorCorrectionLevel): number {
    let best = 0
    let lowest = Infinity

    for (let mask = 0; mask < 8; mask++) {
        setupFormatInfo(grid, level, mask)
        applyMask(grid, mask)

        const penalty = penaltyRule1(grid) + penaltyRule2(grid) + penaltyRule3(grid) + penaltyRule4(grid)

        applyMask(grid, mask) // masking is an involution, so this undoes it

        if (penalty < lowest) {
            lowest = penalty
            best = mask
        }
    }

    return best
}

// ---------------------------------------------------------------------------
// Entry points
// ---------------------------------------------------------------------------

/** Encode `text`, reporting the version, level and mask alongside the matrix. */
export function encodeQRDetailed(text: string, options: EncodeOptions = {}): EncodedSymbol {
    if (text === '') throw new Error('QR encode: no input text')

    const level = options.errorCorrectionLevel ?? 'L'

    // The character-count width depends on the version, and the version depends
    // on the segmentation, so estimate a version from the unoptimised split
    // first and re-derive the real one from the optimised segments.
    const rawSegments = splitIntoRuns(text).map((run) => makeSegment(run.data, run.mode))
    const estimated = bestVersion(rawSegments, level)
    const segments = optimalSegments(text, estimated ?? 40)

    const version = bestVersion(segments, level)
    if (version === null) throw new Error('QR encode: data too large for a QR code')

    const codewords = interleave(buildDataCodewords(segments, version, level), version, level)

    const grid = new ModuleGrid(version)
    setupFinderPatterns(grid)
    setupTimingPatterns(grid)
    setupAlignmentPatterns(grid, version)
    setupFormatInfo(grid, level, 0) // placeholder, rewritten once the mask is known
    if (version >= 7) setupVersionInfo(grid, version)
    setupData(grid, codewords)

    const mask = chooseMask(grid, level)
    applyMask(grid, mask)
    setupFormatInfo(grid, level, mask)

    return {matrix: grid.toBitMatrix(), version, errorCorrectionLevel: level, mask}
}

/**
 * Encode `text` into a module matrix, without a quiet zone. `true` is a dark
 * module.
 */
export function encodeQR(text: string, options: EncodeOptions = {}): BitMatrix {
    return encodeQRDetailed(text, options).matrix
}
