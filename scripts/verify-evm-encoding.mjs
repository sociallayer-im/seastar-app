#!/usr/bin/env node
/**
 * Byte-equality proof for src/utils/evm_abi.ts against viem.
 *
 * viem is NO LONGER a dependency of this repo — it was removed once this
 * script was green. To run it again (mandatory if the encoder is ever
 * changed):
 *
 *   bun add -d viem
 *   node scripts/verify-evm-encoding.mjs
 *   bun remove viem
 *
 * It compiles src/utils/evm_abi.ts with tsc and patches the emitted relative
 * specifiers for Node's ESM loader, the same way scripts/verify-qr-decoder.mjs
 * does.
 */

import {execFileSync} from 'node:child_process'
import {mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

import {decodeFunctionResult, encodeFunctionData, getAddress, parseAbi, toFunctionSelector} from 'viem'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(repoRoot, 'node_modules/.cache/evmabi')

function compile() {
    rmSync(outDir, {recursive: true, force: true})
    mkdirSync(outDir, {recursive: true})
    execFileSync(
        'npx',
        [
            'tsc',
            'src/utils/evm_abi.ts',
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
        const patched = source
            .replace(/(from\s+['"])(\.\/[^'"]+?)(['"])/g, (m, a, spec, b) =>
                spec.endsWith('.js') ? m : `${a}${spec}.js${b}`
            )
            // js-sha3 is CJS; the bundler resolves named imports from it, Node's
            // ESM loader does not. Rewrite to the default-export form.
            .replace(
                /import\s*\{([^}]*)\}\s*from\s*['"]js-sha3['"];?/g,
                "import jsSha3Pkg from 'js-sha3'; const {$1} = jsSha3Pkg;"
            )
        writeFileSync(path, patched)
    }
    writeFileSync(resolve(outDir, 'package.json'), JSON.stringify({type: 'module'}))
}

compile()

const {encodeFunctionCall, functionSelector, decodeUint256Result} = await import(
    resolve(outDir, 'evm_abi.js')
)

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

let passed = 0
const failures = []

function check(name, fn) {
    try {
        const problem = fn()
        if (problem) failures.push(`${name}: ${problem}`)
        else passed++
    } catch (error) {
        failures.push(`${name}: threw ${error && error.stack ? error.stack.split('\n')[0] : error}`)
    }
}

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

const ABI = parseAbi([
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function transfer(address to, address token, uint256 amount, uint256 productId, uint256 itemId)'
])

const MAX_U256 = (1n << 256n) - 1n

const addresses = [
    ['zero', '0x0000000000000000000000000000000000000000'],
    ['leading zeros', '0x0000000000000000000000000000000000000001'],
    ['many leading zeros', '0x000000000000000000000000000000000000dEaD'],
    ['USDC mainnet checksummed', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
    ['USDC mainnet lowercase', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    ['USDC base checksummed', '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'],
    ['USDT mainnet', '0xdAC17F958D2ee523a2206206994597C13D831ec7'],
    ['all f', '0xffffffffffffffffffffffffffffffffffffffff'],
    ['vitalik', '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'],
    ['trailing zeros', '0x1000000000000000000000000000000000000000']
]

const amounts = [
    ['zero', 0n],
    ['one wei', 1n],
    ['two', 2n],
    ['uint256 max', MAX_U256],
    ['uint256 max - 1', MAX_U256 - 1n],
    ['1 USDC (6dp)', 1_000_000n],
    ['0.01 USDC (6dp)', 10_000n],
    ['12345.678901 USDC (6dp)', 12_345_678_901n],
    ['1 ether (18dp)', 10n ** 18n],
    ['0.000000000000000001 (18dp)', 1n],
    ['1234.56789 (18dp)', 1_234_567_890_000_000_000_000n],
    ['2^128', 1n << 128n],
    ['2^255', 1n << 255n],
    ['2^64 - 1 (tsid ceiling)', (1n << 64n) - 1n],
    ['byte boundary 255', 255n],
    ['byte boundary 256', 256n],
    ['odd-nibble 0xabc', 0xabcn]
]

// Deterministic PRNG so failures are reproducible.
let seed = 0x2f6e2b1n
function rnd(bits) {
    let out = 0n
    for (let i = 0; i < bits; i += 32) {
        seed = (seed * 6364136223846793005n + 1442695040888963407n) & ((1n << 64n) - 1n)
        out = (out << 32n) | ((seed >> 16n) & 0xffffffffn)
    }
    return out & ((1n << BigInt(bits)) - 1n)
}
function randomAddress() {
    const hex = `0x${rnd(160).toString(16).padStart(40, '0')}`
    // Alternate lowercase and EIP-55 checksummed forms. viem rejects any other
    // mixed case outright, so those cannot be compared against it; our encoder
    // accepts them (a strict superset) and lowercases before padding.
    return rnd(8) % 2n === 0n ? hex : getAddress(hex)
}

const RANDOM_CASES = 300
const randomAddresses = []
const randomAmounts = []
for (let i = 0; i < RANDOM_CASES; i++) {
    randomAddresses.push(randomAddress())
    randomAmounts.push(rnd(1 + Number(rnd(8) % 256n)))
}

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

console.log('EVM ABI encoding verification (ours vs viem)\n')

const signatures = [
    'approve(address,uint256)',
    'allowance(address,address)',
    'transfer(address,address,uint256,uint256,uint256)'
]
for (const sig of signatures) {
    check(`selector ${sig}`, () => {
        const ours = functionSelector(sig)
        const theirs = toFunctionSelector(`function ${sig}`)
        if (ours !== theirs) return `${ours} != ${theirs}`
        console.log(`  selector ${sig.padEnd(50)} ${ours}`)
        return null
    })
}
console.log('')

// ---------------------------------------------------------------------------
// approve(address,uint256)
// ---------------------------------------------------------------------------

function cmpApprove(label, spender, amount) {
    check(`approve[${label}]`, () => {
        const ours = encodeFunctionCall('approve(address,uint256)', [
            {type: 'address', value: spender},
            {type: 'uint256', value: amount}
        ])
        const theirs = encodeFunctionData({abi: ABI, functionName: 'approve', args: [spender, amount]})
        return ours === theirs ? null : `\n    ours   ${ours}\n    viem   ${theirs}`
    })
}

for (const [an, addr] of addresses) {
    for (const [vn, amt] of amounts) cmpApprove(`${an} / ${vn}`, addr, amt)
}
for (let i = 0; i < RANDOM_CASES; i++) {
    cmpApprove(`random ${i}`, randomAddresses[i], randomAmounts[i])
}

// ---------------------------------------------------------------------------
// allowance(address,address)
// ---------------------------------------------------------------------------

function cmpAllowance(label, owner, spender) {
    check(`allowance[${label}]`, () => {
        const ours = encodeFunctionCall('allowance(address,address)', [
            {type: 'address', value: owner},
            {type: 'address', value: spender}
        ])
        const theirs = encodeFunctionData({abi: ABI, functionName: 'allowance', args: [owner, spender]})
        return ours === theirs ? null : `\n    ours   ${ours}\n    viem   ${theirs}`
    })
}

for (const [an, a] of addresses) {
    for (const [bn, b] of addresses) cmpAllowance(`${an} / ${bn}`, a, b)
}
for (let i = 0; i < RANDOM_CASES; i++) {
    cmpAllowance(`random ${i}`, randomAddresses[i], randomAddresses[(i + 7) % RANDOM_CASES])
}

// ---------------------------------------------------------------------------
// transfer(address,address,uint256,uint256,uint256)  (PayHub)
// ---------------------------------------------------------------------------

function cmpTransfer(label, to, token, amount, productId, itemId) {
    check(`payhub.transfer[${label}]`, () => {
        const ours = encodeFunctionCall('transfer(address,address,uint256,uint256,uint256)', [
            {type: 'address', value: to},
            {type: 'address', value: token},
            {type: 'uint256', value: amount},
            {type: 'uint256', value: productId},
            {type: 'uint256', value: itemId}
        ])
        const theirs = encodeFunctionData({
            abi: ABI,
            functionName: 'transfer',
            args: [to, token, amount, productId, itemId]
        })
        return ours === theirs ? null : `\n    ours   ${ours}\n    viem   ${theirs}`
    })
}

for (const [an, addr] of addresses) {
    for (const [vn, amt] of amounts) {
        cmpTransfer(`${an} / ${vn}`, addr, addresses[2][1], amt, 0n, MAX_U256)
        cmpTransfer(`${an} / ${vn} / ids`, addresses[3][1], addr, amt, amt, amt)
    }
}
for (let i = 0; i < RANDOM_CASES; i++) {
    cmpTransfer(
        `random ${i}`,
        randomAddresses[i],
        randomAddresses[(i + 3) % RANDOM_CASES],
        randomAmounts[i],
        randomAmounts[(i + 1) % RANDOM_CASES],
        randomAmounts[(i + 2) % RANDOM_CASES]
    )
}

// ---------------------------------------------------------------------------
// allowance return decoding
// ---------------------------------------------------------------------------

const decodeValues = [
    0n,
    1n,
    255n,
    256n,
    10n ** 6n,
    10n ** 18n,
    (1n << 64n) - 1n,
    1n << 128n,
    1n << 255n,
    MAX_U256,
    MAX_U256 - 1n,
    ...randomAmounts.slice(0, 50)
]

for (const value of decodeValues) {
    check(`decode allowance ${value}`, () => {
        const data = `0x${value.toString(16).padStart(64, '0')}`
        const ours = decodeUint256Result(data)
        const theirs = decodeFunctionResult({abi: ABI, functionName: 'allowance', data})
        if (ours !== theirs) return `${ours} != ${theirs}`
        if (typeof ours !== 'bigint') return `not a bigint: ${typeof ours}`
        return null
    })
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

const total = passed + failures.length
console.log('')
if (failures.length > 0) {
    console.log('FAILURES:')
    for (const failure of failures.slice(0, 25)) console.log(`  - ${failure}`)
    if (failures.length > 25) console.log(`  ... and ${failures.length - 25} more`)
    console.log('')
}
console.log(`${passed}/${total} checks passed (byte-exact vs viem)`)
process.exit(failures.length > 0 ? 1 : 0)
