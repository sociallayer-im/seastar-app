// Independent cross-check of the QR decoder, written separately from
// verify-qr-decoder.mjs: rotation/skew (a phone held at an angle is the normal
// case, not an edge case) and decode latency (decides main-thread vs worker).
import QRCode from 'qrcode'
import {decodeQR} from '../node_modules/.cache/qrdec/index.js'

const render = (matrix, scale, quiet) => {
    const n = matrix.size
    const side = (n + quiet * 2) * scale
    const data = new Uint8ClampedArray(side * side * 4).fill(255)
    for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
            if (!matrix.data[y * n + x]) continue
            for (let dy = 0; dy < scale; dy++) {
                for (let dx = 0; dx < scale; dx++) {
                    const px = ((y + quiet) * scale + dy) * side + ((x + quiet) * scale + dx)
                    data[px * 4] = 0; data[px * 4 + 1] = 0; data[px * 4 + 2] = 0
                }
            }
        }
    }
    return {data, width: side, height: side}
}

// Rotate about the centre with nearest-neighbour sampling, onto a white canvas
// the size of a typical downscaled camera frame.
const rotateInto = (src, angleDeg, outW, outH) => {
    const out = new Uint8ClampedArray(outW * outH * 4).fill(255)
    const a = (angleDeg * Math.PI) / 180
    const cos = Math.cos(a), sin = Math.sin(a)
    const scx = src.width / 2, scy = src.height / 2
    const ocx = outW / 2, ocy = outH / 2
    for (let y = 0; y < outH; y++) {
        for (let x = 0; x < outW; x++) {
            const dx = x - ocx, dy = y - ocy
            const sx = Math.round(dx * cos + dy * sin + scx)
            const sy = Math.round(-dx * sin + dy * cos + scy)
            if (sx < 0 || sy < 0 || sx >= src.width || sy >= src.height) continue
            const s = (sy * src.width + sx) * 4, d = (y * outW + x) * 4
            out[d] = src.data[s]; out[d + 1] = src.data[s + 1]; out[d + 2] = src.data[s + 2]
        }
    }
    return {data: out, width: outW, height: outH}
}

let pass = 0, fail = 0
const check = (name, ok, extra = '') => {
    ok ? pass++ : fail++
    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`)
}

// Real payload shapes this app actually scans (see CheckinBtn / DialogBadgeSwap)
const payloads = [
    'profile_id=3mtdpxk6ggmhv&event_id=3mtdpxk6ggmhv',
    'https://sola.day/event/detail/3mtdpxk6ggmhv',
    '社交层活动签到 signature=abc123',
]

console.log('\n1. Rotation / skew (phone held at an angle)')
for (const angle of [0, 5, 12, 25, 45, 90, 180, 270]) {
    const m = QRCode.create(payloads[0], {errorCorrectionLevel: 'M'}).modules
    const img = render(m, 6, 4)
    const rot = rotateInto(img, angle, 640, 480)
    const got = decodeQR(rot.data, rot.width, rot.height)
    check(`${String(angle).padStart(3)}° in a 640x480 frame`, got === payloads[0], got === payloads[0] ? '' : `got: ${JSON.stringify(got)}`)
}

console.log('\n2. Payload shapes at each ECC level')
for (const p of payloads) {
    for (const ecc of ['L', 'M', 'Q', 'H']) {
        const m = QRCode.create(p, {errorCorrectionLevel: ecc}).modules
        const img = render(m, 5, 4)
        const got = decodeQR(img.data, img.width, img.height)
        check(`${ecc}  ${p.slice(0, 34)}`, got === p, got === p ? '' : `got: ${JSON.stringify(got)}`)
    }
}

console.log('\n3. Small on-screen size (code far from the camera)')
for (const scale of [2, 3, 4]) {
    const m = QRCode.create(payloads[0], {errorCorrectionLevel: 'M'}).modules
    const img = render(m, scale, 4)
    const got = decodeQR(img.data, img.width, img.height)
    check(`${scale}px per module (${img.width}px wide)`, got === payloads[0])
}

console.log('\n4. Decode latency on a 640x480 frame (worker decision)')
const bench = (label, frame, iters = 30) => {
    decodeQR(frame.data, frame.width, frame.height) // warm up
    const t0 = performance.now()
    for (let i = 0; i < iters; i++) decodeQR(frame.data, frame.width, frame.height)
    const ms = (performance.now() - t0) / iters
    console.log(`  ${label}: ${ms.toFixed(1)} ms/frame`)
    return ms
}
const okFrame = rotateInto(render(QRCode.create(payloads[0], {errorCorrectionLevel: 'M'}).modules, 6, 4), 12, 640, 480)
const hitMs = bench('frame WITH a code   ', okFrame)
const emptyFrame = {data: new Uint8ClampedArray(640 * 480 * 4).fill(255), width: 640, height: 480}
for (let i = 0; i < emptyFrame.data.length; i += 4) {
    const v = 90 + Math.floor(Math.random() * 120)
    emptyFrame.data[i] = v; emptyFrame.data[i + 1] = v; emptyFrame.data[i + 2] = v
}
const missMs = bench('frame WITHOUT a code', emptyFrame)

console.log(`\n${pass}/${pass + fail} checks passed`)
console.log(`worst-case latency: ${Math.max(hitMs, missMs).toFixed(1)} ms/frame`)
process.exit(fail ? 1 : 0)
