#!/usr/bin/env node
/**
 * Round-trip verification for src/utils/qrcode.
 *
 * Generates QR symbols with the `qrcode` package (already a dependency),
 * renders the module matrix into an RGBA buffer by hand, and feeds that to our
 * decoder. No image library, no browser.
 *
 * Usage:
 *   npx tsc src/utils/qrcode/*.ts --outDir /tmp/qrdec --module esnext \
 *       --target es2022 --moduleResolution bundler --strict
 *   node scripts/verify-qr-decoder.mjs
 *
 * The script compiles the TypeScript itself if the build output is missing.
 */

import {execFileSync} from 'node:child_process'
import {mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

import QRCode from 'qrcode'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(repoRoot, 'node_modules/.cache/qrdec')

function compile() {
    rmSync(outDir, {recursive: true, force: true})
    mkdirSync(outDir, {recursive: true})
    execFileSync(
        'npx',
        [
            'tsc',
            'src/utils/qrcode/binarize.ts',
            'src/utils/qrcode/bitmatrix.ts',
            'src/utils/qrcode/decode.ts',
            'src/utils/qrcode/extract.ts',
            'src/utils/qrcode/galois.ts',
            'src/utils/qrcode/index.ts',
            'src/utils/qrcode/locate.ts',
            'src/utils/qrcode/reedsolomon.ts',
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

const {decodeQR, decodeQRDetailed} = await import(resolve(outDir, 'index.js'))

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

const QUIET_ZONE = 4

/** Render a qrcode-lib module matrix into an RGBA Uint8ClampedArray. */
function render(qr, {scale = 5, invert = false, flip = []} = {}) {
    const size = qr.modules.size
    const bits = qr.modules.data
    const dim = (size + QUIET_ZONE * 2) * scale
    const data = new Uint8ClampedArray(dim * dim * 4)

    const flipped = new Set(flip.map(([x, y]) => y * size + x))

    for (let py = 0; py < dim; py++) {
        for (let px = 0; px < dim; px++) {
            const mx = Math.floor(px / scale) - QUIET_ZONE
            const my = Math.floor(py / scale) - QUIET_ZONE
            let dark = false
            if (mx >= 0 && mx < size && my >= 0 && my < size) {
                const index = my * size + mx
                dark = !!bits[index]
                if (flipped.has(index)) dark = !dark
            }
            if (invert) dark = !dark
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
// Cases
// ---------------------------------------------------------------------------

const LEVELS = ['L', 'M', 'Q', 'H']

const payloads = [
    ['short ascii', 'hello'],
    ['single char', 'A'],
    ['app check-in payload', 'profile_id=3mtdpxk6ggmhv&event_id=8c1f2a9e4b7d'],
    ['app ticket payload', 'profile_id=3mtdpxk6ggmhv&event_id=xxx&ticket_id=99213&ts=1723680000'],
    ['url', 'https://sola.day/event/detail/8c1f2a9e4b7d?check_in=1'],
    ['url cn', 'https://juluo.xyz/group/sola?tab=events'],
    ['numeric only', '01234567890123456789012345'],
    ['numeric 1 mod 3', '1234567890123456'],
    ['numeric 2 mod 3', '12345678901234567'],
    ['alphanumeric only', 'HELLO WORLD 123 $%*+-./:'],
    ['alphanumeric odd length', 'ABC123XYZ'],
    ['utf8 chinese', '社交层活动签到'],
    ['utf8 mixed', 'Sola 社交层 · 活动签到 ✅'],
    ['utf8 emoji', 'check-in 🎟️🎉'],
    ['long 300', 'x'.repeat(300)],
    ['long 800 lorem', loremOfLength(800)],
    ['long 1200 digits', digitsOfLength(1200)],
    ['long utf8 200', '社交层活动签到通行证'.repeat(20)],
    ['json payload', JSON.stringify({profile_id: '3mtdpxk6ggmhv', event_id: 'xxx', nonce: 'a1b2c3d4'})],
    ['whitespace and symbols', 'a b\tc\nd~!@#$%^&*()_+{}|:"<>?']
]

function loremOfLength(n) {
    const words = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor '
    let out = ''
    while (out.length < n) out += words
    return out.slice(0, n)
}

/** Lowercase, so the encoder must choose byte mode. */
function bytesOfLength(n) {
    let out = ''
    while (out.length < n) out += 'abcdefghijklmnopqrstuvwxyz-_'
    return out.slice(0, n)
}

function digitsOfLength(n) {
    let out = ''
    while (out.length < n) out += '0123456789'
    return out.slice(0, n)
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

let passed = 0
const failures = []

function check(name, fn) {
    try {
        const problem = fn()
        if (problem) {
            failures.push(`${name}: ${problem}`)
        } else {
            passed++
        }
    } catch (error) {
        failures.push(`${name}: threw ${error && error.stack ? error.stack.split('\n')[0] : error}`)
    }
}

function roundTrip(text, options = {}) {
    const {errorCorrectionLevel = 'M', scale = 5, invert = false, flip = []} = options
    const qr = QRCode.create(text, {errorCorrectionLevel})
    const {data, width, height} = render(qr, {scale, invert, flip})
    const decoded = decodeQR(data, width, height)
    if (decoded === null) return {ok: false, reason: 'decoder returned null', qr}
    if (decoded !== text) {
        return {
            ok: false,
            reason: `mismatch (got ${JSON.stringify(truncate(decoded))}, want ${JSON.stringify(truncate(text))})`,
            qr
        }
    }
    return {ok: true, qr}
}

function truncate(s) {
    return s.length > 60 ? `${s.slice(0, 57)}...` : s
}

console.log('QR decoder round-trip verification\n')

// 1. Payloads across all four ECC levels.
for (const [name, text] of payloads) {
    for (const level of LEVELS) {
        check(`payload "${name}" @ ${level}`, () => {
            const result = roundTrip(text, {errorCorrectionLevel: level})
            return result.ok ? null : result.reason
        })
    }
}

// 2. Module scales.
for (const scale of [3, 4, 6, 8, 11]) {
    check(`scale ${scale}px/module`, () => {
        const result = roundTrip('profile_id=3mtdpxk6ggmhv&event_id=xxx', {scale})
        return result.ok ? null : result.reason
    })
}

// 3. Inverted (light-on-dark) symbols.
for (const level of LEVELS) {
    check(`inverted colours @ ${level}`, () => {
        const result = roundTrip('社交层活动签到 inverted', {errorCorrectionLevel: level, invert: true})
        return result.ok ? null : result.reason
    })
}

// 4. Every mask pattern. The encoder picks the mask, so drive it by varying the
//    content until all eight have been seen.
const masksSeen = new Set()
for (let i = 0; i < 400 && masksSeen.size < 8; i++) {
    const text = `mask-probe-${i}-${'z'.repeat(i % 17)}`
    const qr = QRCode.create(text, {errorCorrectionLevel: 'Q'})
    const {data, width, height} = render(qr, {scale: 5})
    const detailed = decodeQRDetailed(data, width, height)
    if (detailed && detailed.text === text) masksSeen.add(detailed.mask)
}
check('all 8 mask patterns exercised', () =>
    masksSeen.size === 8 ? null : `only saw masks ${[...masksSeen].sort().join(',')}`
)

// 5. Version coverage. Lowercase content forces byte mode, so the payload
//    length drives the version up to 40 (2953 bytes at level L).
const versionsSeen = new Set()
const versionCases = [
    [10, 'L'], [40, 'L'], [90, 'L'], [160, 'L'], [260, 'L'], [400, 'L'],
    [600, 'L'], [900, 'L'], [1200, 'H'], [1300, 'L'], [1600, 'Q'], [1800, 'L'],
    [2100, 'M'], [2300, 'L'], [2500, 'L'], [2900, 'L'], [2953, 'L']
]
for (const [length, level] of versionCases) {
    const text = bytesOfLength(length)
    check(`version sweep, ${length} bytes @ ${level}`, () => {
        const qr = QRCode.create(text, {errorCorrectionLevel: level})
        const {data, width, height} = render(qr, {scale: length > 1000 ? 3 : 4})
        const detailed = decodeQRDetailed(data, width, height)
        if (!detailed) return 'decoder returned null'
        if (detailed.text !== text) return 'mismatch'
        if (detailed.version !== qr.version) return `version ${detailed.version} != encoder ${qr.version}`
        if (detailed.errorCorrectionLevel !== level) return `ecc ${detailed.errorCorrectionLevel} != ${level}`
        versionsSeen.add(detailed.version)
        return null
    })
}
for (const floor of [7, 10, 27, 40]) {
    check(`reached version >= ${floor}`, () =>
        [...versionsSeen].some((v) => v >= floor) ? null : `versions seen: ${[...versionsSeen].join(',')}`
    )
}

// 6. Reed-Solomon: corrupt data modules within the correction budget.
//    Level H corrects ~30% of codewords; flipping a handful of modules in the
//    data region must still decode.
function dataRegionModules(qr) {
    const size = qr.modules.size
    const reserved = qr.modules.reservedBit
    const coords = []
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (!reserved[y * size + x]) coords.push([x, y])
        }
    }
    return coords
}

for (const [level, flipCount] of [['H', 12], ['Q', 8], ['M', 5], ['L', 3]]) {
    check(`reed-solomon correction @ ${level} (${flipCount} modules flipped)`, () => {
        const text = 'profile_id=3mtdpxk6ggmhv&event_id=8c1f2a9e4b7d'
        const qr = QRCode.create(text, {errorCorrectionLevel: level})
        const coords = dataRegionModules(qr)
        // Spread the damage out so it lands in different codewords.
        const flip = []
        const step = Math.floor(coords.length / (flipCount + 1))
        for (let i = 1; i <= flipCount; i++) flip.push(coords[i * step])
        const {data, width, height} = render(qr, {scale: 5, flip})
        const decoded = decodeQR(data, width, height)
        if (decoded === null) return 'decoder returned null (RS failed to correct)'
        if (decoded !== text) return `mismatch: ${JSON.stringify(truncate(decoded))}`
        return null
    })
}

// 7. Sanity: damage far beyond the budget must be rejected, not mis-decoded.
check('over-budget corruption rejected (no false positive)', () => {
    const text = 'profile_id=3mtdpxk6ggmhv&event_id=8c1f2a9e4b7d'
    const qr = QRCode.create(text, {errorCorrectionLevel: 'L'})
    const coords = dataRegionModules(qr)
    const flip = coords.slice(0, Math.floor(coords.length * 0.45))
    const {data, width, height} = render(qr, {scale: 5, flip})
    const decoded = decodeQR(data, width, height)
    return decoded === null || decoded === text ? null : `returned wrong text ${JSON.stringify(truncate(decoded))}`
})

// 8. Camera-like frame: the symbol is a small, off-centre patch of a larger
//    non-square buffer with a grey background and sensor noise.
function inCameraFrame(rendered, {frameWidth = 640, frameHeight = 480, offsetX = 70, offsetY = 40, noise = 0} = {}) {
    const data = new Uint8ClampedArray(frameWidth * frameHeight * 4)
    let seed = 987654321
    const random = () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff
        return seed / 0x7fffffff
    }
    for (let y = 0; y < frameHeight; y++) {
        for (let x = 0; x < frameWidth; x++) {
            let value = 190 // dull background, not pure white
            const sx = x - offsetX
            const sy = y - offsetY
            if (sx >= 0 && sx < rendered.width && sy >= 0 && sy < rendered.height) {
                value = rendered.data[(sy * rendered.width + sx) * 4]
            }
            if (noise > 0) value += (random() * 2 - 1) * noise
            const offset = (y * frameWidth + x) * 4
            data[offset] = data[offset + 1] = data[offset + 2] = value
            data[offset + 3] = 255
        }
    }
    return {data, width: frameWidth, height: frameHeight}
}

for (const noise of [0, 20, 40]) {
    check(`640x480 camera frame, off-centre, noise +/-${noise}`, () => {
        const text = 'profile_id=3mtdpxk6ggmhv&event_id=8c1f2a9e4b7d'
        const qr = QRCode.create(text, {errorCorrectionLevel: 'M'})
        const frame = inCameraFrame(render(qr, {scale: 6}), {noise})
        const decoded = decodeQR(frame.data, frame.width, frame.height)
        if (decoded === null) return 'decoder returned null'
        return decoded === text ? null : `mismatch: ${JSON.stringify(truncate(decoded))}`
    })
}

check('camera frame, inverted light-on-dark', () => {
    const text = '社交层活动签到'
    const qr = QRCode.create(text, {errorCorrectionLevel: 'M'})
    const frame = inCameraFrame(render(qr, {scale: 6, invert: true}), {offsetX: 300, offsetY: 90, noise: 15})
    const decoded = decodeQR(frame.data, frame.width, frame.height)
    if (decoded === null) return 'decoder returned null'
    return decoded === text ? null : `mismatch: ${JSON.stringify(truncate(decoded))}`
})

// 9. Non-QR input must not crash.
check('random noise returns null', () => {
    const dim = 200
    const data = new Uint8ClampedArray(dim * dim * 4)
    let seed = 12345
    for (let i = 0; i < dim * dim; i++) {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff
        const v = seed % 2 === 0 ? 0 : 255
        data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = v
        data[i * 4 + 3] = 255
    }
    return decodeQR(data, dim, dim) === null ? null : 'expected null'
})

check('blank image returns null', () => {
    const dim = 120
    const data = new Uint8ClampedArray(dim * dim * 4).fill(255)
    return decodeQR(data, dim, dim) === null ? null : 'expected null'
})

check('undersized buffer returns null', () => {
    const data = new Uint8ClampedArray(10 * 10 * 4).fill(255)
    return decodeQR(data, 10, 10) === null ? null : 'expected null'
})

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

const total = passed + failures.length
console.log(`versions decoded: ${[...versionsSeen].sort((a, b) => a - b).join(', ')}`)
console.log(`masks decoded:    ${[...masksSeen].sort().join(', ')}`)
console.log('')
if (failures.length > 0) {
    console.log('FAILURES:')
    for (const failure of failures) console.log(`  - ${failure}`)
    console.log('')
}
console.log(`${passed}/${total} checks passed`)
process.exit(failures.length > 0 ? 1 : 0)
