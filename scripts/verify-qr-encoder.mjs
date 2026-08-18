#!/usr/bin/env node
/**
 * Equivalence verification for src/utils/qrcode/encode.ts.
 *
 * Our encoder must be a drop-in replacement for the `qrcode` package, so the
 * bar here is byte-identical output: for every input and every ECC level, our
 * module matrix must equal `QRCode.create(...).modules` exactly. That single
 * assertion transitively covers mode selection, segment optimisation, version
 * choice, terminator/padding, Reed-Solomon, interleaving, function patterns,
 * data placement and mask selection — any disagreement in any of them moves at
 * least one module.
 *
 * As a second, independent check, every symbol is also rendered to RGBA and fed
 * back through our own decoder.
 *
 * Usage:
 *   node scripts/verify-qr-encoder.mjs
 */

import {execFileSync} from 'node:child_process'
import {mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

import QRCode from 'qrcode'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(repoRoot, 'node_modules/.cache/qrenc')

const SOURCES = [
    'binarize',
    'bitmatrix',
    'decode',
    'encode',
    'extract',
    'galois',
    'index',
    'locate',
    'reedsolomon',
    'spec'
]

function compile() {
    rmSync(outDir, {recursive: true, force: true})
    mkdirSync(outDir, {recursive: true})
    execFileSync(
        'npx',
        [
            'tsc',
            ...SOURCES.map((name) => `src/utils/qrcode/${name}.ts`),
            '--outDir',
            outDir,
            '--module',
            'esnext',
            '--target',
            'es2022',
            '--moduleResolution',
            'bundler',
            '--strict',
            // TS6 refuses to mix a tsconfig with explicit files on the CLI.
            '--ignoreConfig'
        ],
        {cwd: repoRoot, stdio: 'inherit'}
    )
    rewriteSpecifiers()
}

/**
 * tsc emits extensionless relative specifiers (correct for a bundler, not
 * resolvable by Node's ESM loader), so append `.js` and mark the dir as ESM.
 */
function rewriteSpecifiers() {
    for (const file of readdirSync(outDir)) {
        if (!file.endsWith('.js')) continue
        const path = resolve(outDir, file)
        const source = readFileSync(path, 'utf8')
        const patched = source.replace(/(from\s+['"])(\.\/[^'"]+?)(['"])/g, (m, a, spec, b) =>
            spec.endsWith('.js') ? m : `${a}${spec}.js${b}`
        )
        writeFileSync(path, patched)
    }
    writeFileSync(resolve(outDir, 'package.json'), JSON.stringify({type: 'module'}))
}

compile()

const {encodeQR, encodeQRDetailed} = await import(resolve(outDir, 'encode.js'))
const {decodeQR} = await import(resolve(outDir, 'index.js'))

// ---------------------------------------------------------------------------
// Comparison helpers
// ---------------------------------------------------------------------------

/** Compare our matrix with the reference, returning a description of the first difference. */
function compareMatrix(ours, reference) {
    if (ours.width !== reference.size || ours.height !== reference.size) {
        return `size ${ours.width}x${ours.height} != reference ${reference.size}x${reference.size}`
    }
    const size = reference.size
    let differing = 0
    let first = null
    for (let i = 0; i < size * size; i++) {
        const a = ours.data[i] ? 1 : 0
        const b = reference.data[i] ? 1 : 0
        if (a !== b) {
            differing++
            if (first === null) first = [i % size, Math.floor(i / size)]
        }
    }
    if (differing > 0) {
        return `${differing}/${size * size} modules differ, first at (col ${first[0]}, row ${first[1]})`
    }
    return null
}

const QUIET_ZONE = 4

/** Render our module matrix into an RGBA buffer for the decoder. */
function render(matrix, scale) {
    const size = matrix.width
    const dim = (size + QUIET_ZONE * 2) * scale
    const data = new Uint8ClampedArray(dim * dim * 4)
    for (let py = 0; py < dim; py++) {
        for (let px = 0; px < dim; px++) {
            const mx = Math.floor(px / scale) - QUIET_ZONE
            const my = Math.floor(py / scale) - QUIET_ZONE
            const dark = mx >= 0 && mx < size && my >= 0 && my < size && matrix.data[my * size + mx] === 1
            const value = dark ? 0 : 255
            const offset = (py * dim + px) * 4
            data[offset] = value
            data[offset + 1] = value
            data[offset + 2] = value
            data[offset + 3] = 255
        }
    }
    return {data, width: dim, height: dim}
}

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

const LEVELS = ['L', 'M', 'Q', 'H']

function repeatTo(seed, n) {
    let out = ''
    while (out.length < n) out += seed
    return out.slice(0, n)
}

const payloads = [
    // Real app payloads.
    ['app check-in payload', 'profile_id=3mtdpxk6ggmhv&event_id=3mtdpxk6ggmhv'],
    ['app ticket payload', 'profile_id=3mtdpxk6ggmhv&event_id=xxx&ticket_id=99213&ts=1723680000'],
    ['app event url', 'https://sola.day/event/detail/3mtdpxk6ggmhv'],
    ['app event url cn', 'https://juluo.xyz/event/detail/3mtdpxk6ggmhv?check_in=1'],
    ['app group url', 'https://sola.day/group/sola?tab=events'],

    // Tiny inputs.
    ['single letter', 'A'],
    ['single lowercase', 'a'],
    ['single digit', '7'],
    ['single space', ' '],
    ['two chars', 'ab'],

    // Numeric-only, all three length residues mod 3.
    ['numeric 1', '5'],
    ['numeric 2', '42'],
    ['numeric 3', '123'],
    ['numeric 16', repeatTo('0123456789', 16)],
    ['numeric 17', repeatTo('0123456789', 17)],
    ['numeric 26', repeatTo('0123456789', 26)],
    ['numeric 100', repeatTo('9876543210', 100)],
    ['numeric 500', repeatTo('0123456789', 500)],
    ['numeric 1500', repeatTo('0123456789', 1500)],
    ['numeric 3000', repeatTo('0123456789', 3000)],

    // Alphanumeric-only, including the full symbol set.
    ['alphanumeric symbols', 'HELLO WORLD 123 $%*+-./:'],
    ['alphanumeric odd', 'ABC123XYZ'],
    ['alphanumeric even', 'ABCD1234'],
    ['alphanumeric full charset', '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:'],
    ['alphanumeric 200', repeatTo('SOLA DAY EVENT 2026 $%*+-./:', 200)],
    ['alphanumeric 1000', repeatTo('ABCDEFGHIJ0123456789 ', 1000)],
    ['alphanumeric 1800', repeatTo('QRCODE TEST 42 ', 1800)],

    // Mixed case and mixed-mode ASCII (exercises segment optimisation).
    ['mixed case', 'Hello World'],
    ['mixed case digits', 'Sola2026Event'],
    ['digits then letters', '1234567890ABCDEFGHIJ'],
    ['letters then digits', 'ABCDEFGHIJ1234567890'],
    ['long numeric run in url', 'https://sola.day/e/12345678901234567890'],
    ['alternating modes', 'AB12cd34EF56gh78IJ90'],
    ['punctuation heavy', 'a b\tc\nd~!@#$%^&*()_+{}|:"<>?'],
    ['json payload', JSON.stringify({profile_id: '3mtdpxk6ggmhv', event_id: 'xxx', nonce: 'a1b2c3d4'})],
    ['uppercase with lowercase tail', repeatTo('ABCDEFGHIJ', 120) + 'tail'],

    // UTF-8.
    ['utf8 chinese', '社交层活动签到'],
    ['utf8 chinese long', repeatTo('社交层活动签到通行证', 200)],
    ['utf8 mixed', 'Sola 社交层 · 活动签到 ✅'],
    ['utf8 emoji', 'check-in 🎟️🎉'],
    ['utf8 emoji only', '🎉🎟️🚀🌏'],
    ['utf8 accents', 'Café Zürich naïve résumé'],

    // Long byte-mode strings pushing the version well past 7.
    ['bytes 40', repeatTo('abcdefghij-_', 40)],
    ['bytes 120', repeatTo('abcdefghij-_', 120)],
    ['bytes 300', repeatTo('abcdefghij-_', 300)],
    ['bytes 700', repeatTo('abcdefghij-_', 700)],
    ['bytes 1200', repeatTo('abcdefghij-_', 1200)],
    ['bytes 1800', repeatTo('abcdefghij-_', 1800)],
    ['bytes 2300', repeatTo('abcdefghij-_', 2300)],
    ['bytes 2800', repeatTo('abcdefghij-_', 2800)],
    ['bytes 2953 (version 40 L limit)', repeatTo('abcdefghij-_', 2953)]
]

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

let passed = 0
const failures = []
const versionsSeen = new Set()
const masksSeen = new Set()

function check(name, fn) {
    try {
        const problem = fn()
        if (problem) failures.push(`${name}: ${problem}`)
        else passed++
    } catch (error) {
        failures.push(`${name}: threw ${error && error.stack ? error.stack.split('\n')[0] : error}`)
    }
}

function referenceOrNull(text, level) {
    try {
        return QRCode.create(text, {errorCorrectionLevel: level})
    } catch {
        return null // too big at this level; nothing to compare against
    }
}

console.log('QR encoder equivalence verification (ours vs the `qrcode` package)\n')

let compared = 0

for (const [name, text] of payloads) {
    for (const level of LEVELS) {
        const reference = referenceOrNull(text, level)
        if (reference === null) continue
        compared++

        check(`matrix "${name}" @ ${level}`, () => {
            const detailed = encodeQRDetailed(text, {errorCorrectionLevel: level})
            versionsSeen.add(detailed.version)
            masksSeen.add(detailed.mask)

            if (detailed.version !== reference.version) {
                return `version ${detailed.version} != reference ${reference.version}`
            }
            if (detailed.mask !== reference.maskPattern) {
                return `mask ${detailed.mask} != reference ${reference.maskPattern}`
            }
            return compareMatrix(detailed.matrix, reference.modules)
        })
    }
}

// Round-trip through our own decoder.
for (const [name, text] of payloads) {
    for (const level of LEVELS) {
        if (referenceOrNull(text, level) === null) continue
        check(`round-trip "${name}" @ ${level}`, () => {
            const matrix = encodeQR(text, {errorCorrectionLevel: level})
            const scale = matrix.width > 100 ? 3 : 5
            const {data, width, height} = render(matrix, scale)
            const decoded = decodeQR(data, width, height)
            if (decoded === null) return 'decoder returned null'
            if (decoded !== text) {
                return `decoded ${JSON.stringify(truncate(decoded))} != ${JSON.stringify(truncate(text))}`
            }
            return null
        })
    }
}

function truncate(s) {
    return s.length > 50 ? `${s.slice(0, 47)}...` : s
}

// A randomised sweep, to catch segmentation tie-breaks the curated list misses.
const ALPHABETS = [
    '0123456789',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:',
    'abcdefghijklmnopqrstuvwxyz',
    'aA0 $%:-./+*中文🎉'
]

let seed = 20260819
function random() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
}

let randomMismatch = null
let randomChecked = 0
for (let i = 0; i < 600; i++) {
    const alphabet = [...ALPHABETS[i % ALPHABETS.length], ...ALPHABETS[(i + 1) % ALPHABETS.length]]
    const length = 1 + Math.floor(random() * 90)
    let text = ''
    for (let c = 0; c < length; c++) text += alphabet[Math.floor(random() * alphabet.length)]

    const level = LEVELS[i % 4]
    const reference = referenceOrNull(text, level)
    if (reference === null) continue

    const detailed = encodeQRDetailed(text, {errorCorrectionLevel: level})
    versionsSeen.add(detailed.version)
    masksSeen.add(detailed.mask)
    randomChecked++

    const problem =
        detailed.version !== reference.version
            ? `version ${detailed.version} != ${reference.version}`
            : compareMatrix(detailed.matrix, reference.modules)
    if (problem && randomMismatch === null) {
        randomMismatch = `${JSON.stringify(truncate(text))} @ ${level}: ${problem}`
    }
}
check(`randomised sweep (${randomChecked} strings)`, () => randomMismatch)

// Default ECC level must be 'L', as the component relies on it.
check('default errorCorrectionLevel is L', () => {
    const text = 'profile_id=3mtdpxk6ggmhv&event_id=3mtdpxk6ggmhv'
    const problem = compareMatrix(encodeQR(text), QRCode.create(text, {errorCorrectionLevel: 'L'}).modules)
    return problem
})

check('empty input throws', () => {
    try {
        encodeQR('')
        return 'expected a throw'
    } catch {
        return null
    }
})

// Coverage assertions: the comparison above only proves what it exercised.
check('all 8 masks exercised', () =>
    masksSeen.size === 8 ? null : `only saw masks ${[...masksSeen].sort().join(', ')}`
)
for (const floor of [7, 15, 27, 40]) {
    check(`reached version >= ${floor}`, () =>
        [...versionsSeen].some((v) => v >= floor) ? null : `versions seen: ${[...versionsSeen].sort((a, b) => a - b).join(', ')}`
    )
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`matrices compared: ${compared + randomChecked}`)
console.log(`versions produced: ${[...versionsSeen].sort((a, b) => a - b).join(', ')}`)
console.log(`masks produced:    ${[...masksSeen].sort().join(', ')}`)
console.log('')
if (failures.length > 0) {
    console.log('FAILURES:')
    for (const failure of failures.slice(0, 40)) console.log(`  - ${failure}`)
    if (failures.length > 40) console.log(`  ... and ${failures.length - 40} more`)
    console.log('')
}
console.log(`${passed}/${passed + failures.length} checks passed`)
process.exit(failures.length > 0 ? 1 : 0)
