// Minimal ABI encoding for static types (`address`, `uint256`) — enough for the
// ERC20 + PayHub calls in ./evm_payment, and small enough to read in one sitting.
// Verified byte-for-byte against viem's `encodeFunctionData` by
// scripts/verify-evm-encoding.mjs.

import {keccak_256} from 'js-sha3'

export type Hex = `0x${string}`

/** Solidity static argument types we support. */
export type AbiArg = {type: 'address'; value: string} | {type: 'uint256'; value: bigint}

const UINT256_MAX = (BigInt(1) << BigInt(256)) - BigInt(1)

/** 4-byte function selector: first 4 bytes of keccak256 of the signature. */
export function functionSelector(signature: string): Hex {
    return `0x${keccak_256(signature).slice(0, 8)}`
}

/** Left-pad a hex body (no 0x) to one 32-byte ABI word. */
function word(hexBody: string): string {
    if (hexBody.length > 64) throw new Error(`ABI value too wide: 0x${hexBody}`)
    return hexBody.padStart(64, '0')
}

function encodeAddress(value: string): string {
    const body = value.startsWith('0x') || value.startsWith('0X') ? value.slice(2) : value
    if (!/^[0-9a-fA-F]{40}$/.test(body)) throw new Error(`Invalid address: ${value}`)
    return word(body.toLowerCase())
}

function encodeUint256(value: bigint): string {
    if (value < BigInt(0)) throw new Error(`Negative value for uint256: ${value}`)
    if (value > UINT256_MAX) throw new Error(`Value exceeds uint256: ${value}`)
    return word(value.toString(16))
}

/** ABI-encode a list of static arguments into the head-only data region. */
export function encodeArgs(args: readonly AbiArg[]): string {
    return args.map((arg) => (arg.type === 'address' ? encodeAddress(arg.value) : encodeUint256(arg.value))).join('')
}

/**
 * Build calldata for a function whose parameters are all static.
 * `signature` is the canonical Solidity signature, e.g. `approve(address,uint256)`.
 */
export function encodeFunctionCall(signature: string, args: readonly AbiArg[]): Hex {
    return `${functionSelector(signature)}${encodeArgs(args)}` as Hex
}

/** Decode a single-`uint256` return value (the ERC20 `allowance` shape). */
export function decodeUint256Result(data: string): bigint {
    const body = data.startsWith('0x') || data.startsWith('0X') ? data.slice(2) : data
    if (body.length === 0) throw new Error('Empty return data')
    if (!/^[0-9a-fA-F]+$/.test(body)) throw new Error(`Invalid return data: ${data}`)
    if (body.length < 64) throw new Error(`Return data too short for uint256: ${data}`)
    return BigInt(`0x${body.slice(0, 64)}`)
}
