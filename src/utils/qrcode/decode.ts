import {BitMatrix} from './bitmatrix'
import {rsDecode} from './reedsolomon'

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

export interface DecodedSymbol {
    text: string
    version: number
    errorCorrectionLevel: ErrorCorrectionLevel
    mask: number
}

/** Total codewords (data + EC) per version, index 1..40. ISO/IEC 18004 table 1. */
const TOTAL_CODEWORDS = [
    0,
    26, 44, 70, 100, 134, 172, 196, 242, 292, 346,
    404, 466, 532, 581, 655, 733, 815, 901, 991, 1085,
    1156, 1258, 1364, 1474, 1588, 1706, 1828, 1921, 2051, 2185,
    2323, 2465, 2611, 2761, 2876, 3034, 3196, 3362, 3532, 3706
]

/** Number of EC blocks, four entries (L, M, Q, H) per version. */
const EC_BLOCKS = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 2, 2, 4,
    1, 2, 4, 4, 2, 4, 4, 4, 2, 4, 6, 5, 2, 4, 6, 6,
    2, 5, 8, 8, 4, 5, 8, 8, 4, 5, 8, 11, 4, 8, 10, 11,
    4, 9, 12, 16, 4, 9, 16, 16, 6, 10, 12, 18, 6, 10, 17, 16,
    6, 11, 16, 19, 6, 13, 18, 21, 7, 14, 21, 25, 8, 16, 20, 25,
    8, 17, 23, 25, 9, 17, 23, 34, 9, 18, 25, 30, 10, 20, 27, 32,
    12, 21, 29, 35, 12, 23, 34, 37, 12, 25, 34, 40, 13, 26, 35, 42,
    14, 28, 38, 45, 15, 29, 40, 48, 16, 31, 43, 51, 17, 33, 45, 54,
    18, 35, 48, 57, 19, 37, 51, 60, 19, 38, 53, 63, 20, 40, 56, 66,
    21, 43, 59, 70, 22, 45, 62, 74, 24, 47, 65, 77, 25, 49, 68, 81
]

/** Total EC codewords, four entries (L, M, Q, H) per version. */
const EC_CODEWORDS = [
    7, 10, 13, 17, 10, 16, 22, 28, 15, 26, 36, 44, 20, 36, 52, 64,
    26, 48, 72, 88, 36, 64, 96, 112, 40, 72, 108, 130, 48, 88, 132, 156,
    60, 110, 160, 192, 72, 130, 192, 224, 80, 150, 224, 264, 96, 176, 260, 308,
    104, 198, 288, 352, 120, 216, 320, 384, 132, 240, 360, 432, 144, 280, 408, 480,
    168, 308, 448, 532, 180, 338, 504, 588, 196, 364, 546, 650, 224, 416, 600, 700,
    224, 442, 644, 750, 252, 476, 690, 816, 270, 504, 750, 900, 300, 560, 810, 960,
    312, 588, 870, 1050, 336, 644, 952, 1110, 360, 700, 1020, 1200, 390, 728, 1050, 1260,
    420, 784, 1140, 1350, 450, 812, 1200, 1440, 480, 868, 1290, 1530, 510, 924, 1350, 1620,
    540, 980, 1440, 1710, 570, 1036, 1530, 1800, 570, 1064, 1590, 1890, 600, 1120, 1680, 1980,
    630, 1204, 1770, 2100, 660, 1260, 1860, 2220, 720, 1316, 1950, 2310, 750, 1372, 2040, 2430
]

/** Index into the tables above. */
const EC_LEVEL_ORDER: ErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H']

interface BlockSpec {
    dataCodewords: number
    ecCodewords: number
}

/**
 * The spec tabulates only the block count and the total EC codewords; the
 * per-block split follows from them. Data codewords divide as evenly as
 * possible, with the remainder going to the trailing (longer) blocks.
 */
function getBlockSpecs(version: number, level: ErrorCorrectionLevel): BlockSpec[] | null {
    const levelIndex = EC_LEVEL_ORDER.indexOf(level)
    if (version < 1 || version > 40 || levelIndex < 0) return null

    const offset = (version - 1) * 4 + levelIndex
    const total = TOTAL_CODEWORDS[version]
    const ecTotal = EC_CODEWORDS[offset]
    const blockCount = EC_BLOCKS[offset]
    const dataTotal = total - ecTotal
    const ecPerBlock = ecTotal / blockCount
    if (!Number.isInteger(ecPerBlock)) return null

    const shortLength = Math.floor(dataTotal / blockCount)
    const longBlocks = dataTotal % blockCount

    const specs: BlockSpec[] = []
    for (let i = 0; i < blockCount; i++) {
        specs.push({
            dataCodewords: i < blockCount - longBlocks ? shortLength : shortLength + 1,
            ecCodewords: ecPerBlock
        })
    }
    return specs
}

/** Alignment pattern centre coordinates for a version (empty for version 1). */
function alignmentPatternPositions(version: number): number[] {
    if (version === 1) return []
    const posCount = Math.floor(version / 7) + 2
    const size = version * 4 + 17
    const intervals = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2
    const positions = [size - 7]
    for (let i = 1; i < posCount - 1; i++) {
        positions.push(positions[i - 1] - intervals)
    }
    positions.push(6)
    return positions.reverse()
}

/** Modules occupied by function patterns, which carry no codeword bits. */
function buildFunctionPatternMask(version: number): BitMatrix {
    const size = version * 4 + 17
    const mask = BitMatrix.createEmpty(size, size)

    // Finder patterns, separators and the format information areas.
    mask.setRegion(0, 0, 9, 9, true)
    mask.setRegion(size - 8, 0, 8, 9, true)
    mask.setRegion(0, size - 8, 9, 8, true)

    for (const [ax, ay] of alignmentCoordinates(version)) {
        mask.setRegion(ax - 2, ay - 2, 5, 5, true)
    }

    // Timing patterns.
    mask.setRegion(6, 9, 1, size - 17, true)
    mask.setRegion(9, 6, size - 17, 1, true)

    if (version > 6) {
        // Version information blocks, 6x3 and 3x6.
        mask.setRegion(size - 11, 0, 3, 6, true)
        mask.setRegion(0, size - 11, 6, 3, true)
    }

    return mask
}

function alignmentCoordinates(version: number): Array<[number, number]> {
    const positions = alignmentPatternPositions(version)
    const coords: Array<[number, number]> = []
    for (let i = 0; i < positions.length; i++) {
        for (let j = 0; j < positions.length; j++) {
            // The three corners are taken by finder patterns.
            if ((i === 0 && j === 0) || (i === 0 && j === positions.length - 1) || (i === positions.length - 1 && j === 0)) {
                continue
            }
            coords.push([positions[i], positions[j]])
        }
    }
    return coords
}

/** The eight data mask conditions; `true` means the module is inverted. */
const MASK_FUNCTIONS: Array<(row: number, column: number) => boolean> = [
    (i, j) => (i + j) % 2 === 0,
    (i) => i % 2 === 0,
    (_i, j) => j % 3 === 0,
    (i, j) => (i + j) % 3 === 0,
    (i, j) => (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0,
    (i, j) => ((i * j) % 2) + ((i * j) % 3) === 0,
    (i, j) => (((i * j) % 2) + ((i * j) % 3)) % 2 === 0,
    (i, j) => (((i + j) % 2) + ((i * j) % 3)) % 2 === 0
]

/**
 * Format information: 5 data bits (2 EC level + 3 mask) expanded to 15 by a
 * BCH(15,5) code with generator 0x537, then XORed with 0x5412 so an all-zero
 * format is impossible. We precompute all 32 valid words and pick the nearest
 * by Hamming distance, which corrects up to 3 bit errors.
 */
const FORMAT_INFO_MASK = 0x5412

const VALID_FORMAT_WORDS: number[] = (() => {
    const words: number[] = []
    for (let data = 0; data < 32; data++) {
        let bch = data << 10
        for (let i = 4; i >= 0; i--) {
            if (bch & (1 << (i + 10))) bch ^= 0x537 << i
        }
        words.push(((data << 10) | bch) ^ FORMAT_INFO_MASK)
    }
    return words
})()

/** Version information: BCH(18,6) with generator 0x1f25, no XOR mask. */
const VALID_VERSION_WORDS: number[] = (() => {
    const words: number[] = []
    for (let version = 7; version <= 40; version++) {
        let bch = version << 12
        for (let i = 5; i >= 0; i--) {
            if (bch & (1 << (i + 12))) bch ^= 0x1f25 << i
        }
        words.push((version << 12) | bch)
    }
    return words
})()

function hammingDistance(a: number, b: number): number {
    let x = a ^ b
    let count = 0
    while (x !== 0) {
        count += x & 1
        x >>>= 1
    }
    return count
}

interface FormatInformation {
    level: ErrorCorrectionLevel
    mask: number
}

function decodeFormatWord(raw: number): FormatInformation | null {
    let bestDistance = Infinity
    let bestData = -1
    for (let data = 0; data < 32; data++) {
        const distance = hammingDistance(raw, VALID_FORMAT_WORDS[data])
        if (distance < bestDistance) {
            bestDistance = distance
            bestData = data
        }
    }
    if (bestDistance > 3 || bestData < 0) return null

    // EC level bits: 01 = L, 00 = M, 11 = Q, 10 = H.
    const levelBits = (bestData >> 3) & 0x03
    const level: ErrorCorrectionLevel = levelBits === 1 ? 'L' : levelBits === 0 ? 'M' : levelBits === 3 ? 'Q' : 'H'
    return {level, mask: bestData & 0x07}
}

function readFormatInformation(matrix: BitMatrix): FormatInformation | null {
    const size = matrix.width

    // Copy 1 wraps the top-left finder, MSB first, skipping the timing row/column.
    let word1 = 0
    for (let x = 0; x <= 5; x++) word1 = (word1 << 1) | (matrix.get(x, 8) ? 1 : 0)
    word1 = (word1 << 1) | (matrix.get(7, 8) ? 1 : 0)
    word1 = (word1 << 1) | (matrix.get(8, 8) ? 1 : 0)
    word1 = (word1 << 1) | (matrix.get(8, 7) ? 1 : 0)
    for (let y = 5; y >= 0; y--) word1 = (word1 << 1) | (matrix.get(8, y) ? 1 : 0)

    const format1 = decodeFormatWord(word1)
    if (format1 !== null) return format1

    // Copy 2 is split: below the top-right finder, then right of the bottom-left.
    let word2 = 0
    for (let y = size - 1; y >= size - 7; y--) word2 = (word2 << 1) | (matrix.get(8, y) ? 1 : 0)
    for (let x = size - 8; x < size; x++) word2 = (word2 << 1) | (matrix.get(x, 8) ? 1 : 0)

    return decodeFormatWord(word2)
}

function readVersionInformation(matrix: BitMatrix): number | null {
    const size = matrix.width
    if (size < 45) return null // versions below 7 carry no version block

    // Top-right block, 3 columns wide by 6 rows tall; bit 17 first.
    let word1 = 0
    for (let y = 5; y >= 0; y--) {
        for (let x = size - 9; x >= size - 11; x--) {
            word1 = (word1 << 1) | (matrix.get(x, y) ? 1 : 0)
        }
    }
    // Bottom-left block: the transpose of the same layout.
    let word2 = 0
    for (let x = 5; x >= 0; x--) {
        for (let y = size - 9; y >= size - 11; y--) {
            word2 = (word2 << 1) | (matrix.get(x, y) ? 1 : 0)
        }
    }

    for (const word of [word1, word2]) {
        let bestDistance = Infinity
        let bestVersion = -1
        for (let i = 0; i < VALID_VERSION_WORDS.length; i++) {
            const distance = hammingDistance(word, VALID_VERSION_WORDS[i])
            if (distance < bestDistance) {
                bestDistance = distance
                bestVersion = i + 7
            }
        }
        if (bestDistance <= 3) return bestVersion
    }
    return null
}

/**
 * Read codewords in the standard order: two-module-wide columns walked from the
 * right edge leftwards, alternating upwards and downwards, right module of the
 * pair before the left, skipping function patterns. Column 6 is the vertical
 * timing pattern and is not part of any pair.
 */
function readCodewords(matrix: BitMatrix, version: number, mask: number): number[] {
    const size = matrix.width
    const functionPattern = buildFunctionPatternMask(version)
    const maskFn = MASK_FUNCTIONS[mask]

    const codewords: number[] = []
    let currentByte = 0
    let bitsRead = 0
    let readingUp = true

    for (let x = size - 1; x > 0; x -= 2) {
        if (x === 6) x--
        for (let i = 0; i < size; i++) {
            const y = readingUp ? size - 1 - i : i
            for (let dx = 0; dx < 2; dx++) {
                const xx = x - dx
                if (functionPattern.get(xx, y)) continue
                let bit = matrix.get(xx, y)
                if (maskFn(y, xx)) bit = !bit
                currentByte = (currentByte << 1) | (bit ? 1 : 0)
                bitsRead++
                if (bitsRead === 8) {
                    codewords.push(currentByte)
                    currentByte = 0
                    bitsRead = 0
                }
            }
        }
        readingUp = !readingUp
    }

    return codewords
}

/**
 * Undo the interleaving: data codewords are transmitted one per block in
 * round-robin order (short blocks dropping out once exhausted), then all EC
 * codewords in the same round-robin order.
 */
function deinterleave(codewords: number[], specs: BlockSpec[]): Array<{data: number[]; ec: number[]}> | null {
    const totalExpected = specs.reduce((sum, s) => sum + s.dataCodewords + s.ecCodewords, 0)
    if (codewords.length < totalExpected) return null

    const blocks = specs.map(() => ({data: [] as number[], ec: [] as number[]}))
    const maxData = Math.max(...specs.map((s) => s.dataCodewords))
    const maxEc = Math.max(...specs.map((s) => s.ecCodewords))

    let index = 0
    for (let i = 0; i < maxData; i++) {
        for (let b = 0; b < specs.length; b++) {
            if (i < specs[b].dataCodewords) blocks[b].data.push(codewords[index++])
        }
    }
    for (let i = 0; i < maxEc; i++) {
        for (let b = 0; b < specs.length; b++) {
            if (i < specs[b].ecCodewords) blocks[b].ec.push(codewords[index++])
        }
    }

    return blocks
}

class BitReader {
    private bitIndex = 0

    constructor(private readonly bytes: number[]) {}

    get available(): number {
        return this.bytes.length * 8 - this.bitIndex
    }

    read(count: number): number {
        if (count > this.available) throw new RangeError('QR bitstream exhausted')
        let value = 0
        for (let i = 0; i < count; i++) {
            const byte = this.bytes[this.bitIndex >> 3]
            const bit = (byte >> (7 - (this.bitIndex & 7))) & 1
            value = (value << 1) | bit
            this.bitIndex++
        }
        return value
    }
}

const ALPHANUMERIC_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:'

/** Character-count field widths by mode, for the three version groups. */
function characterCountBits(mode: number, version: number): number {
    const group = version <= 9 ? 0 : version <= 26 ? 1 : 2
    switch (mode) {
        case 1:
            return [10, 12, 14][group]
        case 2:
            return [9, 11, 13][group]
        case 4:
            return [8, 16, 16][group]
        case 8:
            return [8, 10, 12][group]
        default:
            return 0
    }
}

/** Strict UTF-8 decode; returns null on any malformed sequence. */
function decodeUtf8(bytes: number[]): string | null {
    let out = ''
    let i = 0
    while (i < bytes.length) {
        const b0 = bytes[i]
        let codePoint: number
        let extra: number
        if (b0 < 0x80) {
            codePoint = b0
            extra = 0
        } else if ((b0 & 0xe0) === 0xc0) {
            codePoint = b0 & 0x1f
            extra = 1
        } else if ((b0 & 0xf0) === 0xe0) {
            codePoint = b0 & 0x0f
            extra = 2
        } else if ((b0 & 0xf8) === 0xf0) {
            codePoint = b0 & 0x07
            extra = 3
        } else {
            return null
        }
        if (i + extra >= bytes.length) return null
        for (let k = 1; k <= extra; k++) {
            const b = bytes[i + k]
            if ((b & 0xc0) !== 0x80) return null
            codePoint = (codePoint << 6) | (b & 0x3f)
        }
        // Reject overlong forms, surrogates and out-of-range code points.
        if (extra === 1 && codePoint < 0x80) return null
        if (extra === 2 && codePoint < 0x800) return null
        if (extra === 3 && codePoint < 0x10000) return null
        if (codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff)) return null
        out += String.fromCodePoint(codePoint)
        i += extra + 1
    }
    return out
}

function decodeLatin1(bytes: number[]): string {
    let out = ''
    for (const b of bytes) out += String.fromCharCode(b)
    return out
}

/**
 * Parse the data bitstream into text. ECI designators are read (so the bit
 * offsets stay correct) and used only to choose between UTF-8 and Latin-1.
 * Kanji mode is not supported and aborts the decode rather than crashing.
 */
function parseBitstream(bytes: number[], version: number): string | null {
    const reader = new BitReader(bytes)
    let result = ''
    let latin1 = false

    try {
        while (reader.available >= 4) {
            const mode = reader.read(4)
            if (mode === 0) break // terminator

            if (mode === 7) {
                // ECI: 1, 2 or 3 bytes, flagged by the leading bits.
                const first = reader.read(8)
                let assignment: number
                if ((first & 0x80) === 0) {
                    assignment = first & 0x7f
                } else if ((first & 0xc0) === 0x80) {
                    assignment = ((first & 0x3f) << 8) | reader.read(8)
                } else if ((first & 0xe0) === 0xc0) {
                    assignment = ((first & 0x1f) << 16) | reader.read(16)
                } else {
                    return null
                }
                // 1..2 and 4..24 are single-byte charsets; 26 is UTF-8.
                latin1 = assignment !== 26 && assignment <= 24
                continue
            }

            if (mode === 5 || mode === 9) continue // FNC1, no payload of its own
            if (mode === 3) {
                reader.read(16) // structured append header
                continue
            }
            if (mode === 8) return null // Kanji: unsupported, bail out cleanly

            const countBits = characterCountBits(mode, version)
            if (countBits === 0) return null
            const count = reader.read(countBits)

            if (mode === 1) {
                let remaining = count
                while (remaining >= 3) {
                    const triple = reader.read(10)
                    if (triple > 999) return null
                    result += String(triple).padStart(3, '0')
                    remaining -= 3
                }
                if (remaining === 2) {
                    const pair = reader.read(7)
                    if (pair > 99) return null
                    result += String(pair).padStart(2, '0')
                } else if (remaining === 1) {
                    const single = reader.read(4)
                    if (single > 9) return null
                    result += String(single)
                }
            } else if (mode === 2) {
                let remaining = count
                while (remaining >= 2) {
                    const pair = reader.read(11)
                    if (pair >= 45 * 45) return null
                    result += ALPHANUMERIC_CHARS[Math.floor(pair / 45)] + ALPHANUMERIC_CHARS[pair % 45]
                    remaining -= 2
                }
                if (remaining === 1) {
                    const single = reader.read(6)
                    if (single >= 45) return null
                    result += ALPHANUMERIC_CHARS[single]
                }
            } else if (mode === 4) {
                const chunk: number[] = []
                for (let i = 0; i < count; i++) chunk.push(reader.read(8))
                const text = latin1 ? null : decodeUtf8(chunk)
                result += text ?? decodeLatin1(chunk)
            } else {
                return null
            }
        }
    } catch {
        // A truncated stream means we mis-read the symbol somewhere.
        return null
    }

    return result
}

/**
 * Decode an already-extracted module grid.
 */
export function decodeMatrix(matrix: BitMatrix): DecodedSymbol | null {
    const size = matrix.width
    if (size !== matrix.height) return null
    if (size < 21 || size > 177 || (size - 17) % 4 !== 0) return null

    let version = (size - 17) / 4
    if (version >= 7) {
        const declared = readVersionInformation(matrix)
        // Geometry is authoritative — only trust the version block if it agrees.
        if (declared !== null && declared * 4 + 17 === size) version = declared
    }

    const format = readFormatInformation(matrix)
    if (format === null) return null

    const specs = getBlockSpecs(version, format.level)
    if (specs === null) return null

    const codewords = readCodewords(matrix, version, format.mask)
    const blocks = deinterleave(codewords, specs)
    if (blocks === null) return null

    const data: number[] = []
    for (const block of blocks) {
        const corrected = rsDecode(block.data.concat(block.ec), block.ec.length)
        if (corrected === null) return null
        for (let i = 0; i < block.data.length; i++) data.push(corrected[i])
    }

    const text = parseBitstream(data, version)
    if (text === null) return null

    return {text, version, errorCorrectionLevel: format.level, mask: format.mask}
}
