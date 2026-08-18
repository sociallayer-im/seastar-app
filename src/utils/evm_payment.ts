// EVM payment path over the raw EIP-1193 provider (`window.ethereum`).
// Deliberately dependency-free — viem was 236 KB shipped for what amounts to
// six JSON-RPC calls and two ABI encodings. See ./evm_abi for the encoder and
// scripts/verify-evm-encoding.mjs for the byte-equality proof against viem.

import {decodeUint256Result, encodeFunctionCall, type Hex} from '@/utils/evm_abi'
import {tsidToBigInt, type PaymentStep} from '@/utils/evm_payment_steps'

/** Minimal EIP-1193 provider surface. */
interface Eip1193Provider {
    request(args: {method: string; params?: unknown[]}): Promise<unknown>
}

/** Only the chain id is needed — viem's full chain objects were dead weight. */
const CHAIN_ID: Record<string, number> = {
    ethereum: 1,
    optimism: 10,
    arbitrum: 42161,
    base: 8453,
    polygon: 137,
}

const SIG_APPROVE = 'approve(address,uint256)'
const SIG_ALLOWANCE = 'allowance(address,address)'
const SIG_PAYHUB_TRANSFER = 'transfer(address,address,uint256,uint256,uint256)'

const RECEIPT_POLL_INTERVAL_MS = 2_000
const RECEIPT_TIMEOUT_MS = 5 * 60 * 1_000

interface TransactionReceipt {
    status?: string
    transactionHash?: string
}

/**
 * Always reject with a real `Error`.
 *
 * viem normalised every provider rejection into an Error subclass. Raw
 * providers do not: MetaMask's injected object throws real Errors, but
 * WalletConnect and several in-app-browser bridges reject with a plain
 * `{code, message}` serialised across a postMessage boundary. The UI tests
 * `e instanceof Error` before showing `e.message`, so those rejections showed
 * a bare "Payment failed" and the actual reason — user rejected, chain not
 * added, insufficient funds — was dropped.
 */
async function request(eth: Eip1193Provider, args: {method: string; params?: unknown[]}): Promise<unknown> {
    try {
        return await eth.request(args)
    } catch (e: unknown) {
        if (e instanceof Error) throw e
        const detail = e as {message?: unknown; code?: unknown} | null
        const message = typeof detail?.message === 'string' && detail.message
            ? detail.message
            : `Wallet request ${args.method} failed`
        const error = new Error(detail?.code !== undefined ? `${message} (code ${String(detail.code)})` : message)
        throw error
    }
}

function getProvider(): Eip1193Provider {
    const eth =
        typeof window !== 'undefined'
            ? (window as unknown as {ethereum?: Eip1193Provider}).ethereum
            : undefined
    if (!eth) throw new Error('No wallet found. Please install MetaMask or a compatible wallet.')
    return eth
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * The wallet published a different transaction with the same nonce, so this
 * hash will never mine — but the payment itself may well have gone through
 * under the replacement, which is why the message tells the user to check
 * rather than to pay again.
 */
class ReplacedTransactionError extends Error {
    constructor(hash: string) {
        super(
            'Your wallet replaced this transaction (a speed-up or cancel). ' +
            'Check your wallet before paying again — the payment may have gone through. ' +
            `Original transaction: ${hash}`
        )
        this.name = 'ReplacedTransactionError'
    }
}

/**
 * The nonce a just-sent transaction claimed, so a replacement can be spotted.
 * Best-effort: a wallet that will not answer simply disables that detection.
 */
async function getTransactionNonce(eth: Eip1193Provider, hash: Hex): Promise<number | null> {
    try {
        const tx = (await eth.request({
            method: 'eth_getTransactionByHash',
            params: [hash],
        })) as {nonce?: string} | null
        return tx?.nonce ? parseInt(tx.nonce, 16) : null
    } catch {
        return null
    }
}

/** Poll `eth_getTransactionReceipt` until mined; throws if the tx reverted. */
async function waitForReceipt(
    eth: Eip1193Provider,
    hash: Hex,
    replacement?: {from: Hex; nonce: number | null}
): Promise<TransactionReceipt> {
    const deadline = Date.now() + RECEIPT_TIMEOUT_MS
    for (;;) {
        // A transient RPC failure must not abort the wait: the money has already
        // left, and reporting failure for a transaction that actually succeeds
        // is worse than polling on until the deadline. viem retried internally;
        // nothing does that for us now.
        let receipt: TransactionReceipt | null = null
        try {
            receipt = (await eth.request({
                method: 'eth_getTransactionReceipt',
                params: [hash],
            })) as TransactionReceipt | null
        } catch (e: unknown) {
            console.error('[evm_payment] receipt poll failed, retrying', e)
        }

        if (receipt) {
            // Pre-Byzantium receipts have no status field; treat as success.
            if (receipt.status === '0x0' || receipt.status === '0x00') {
                throw new Error(`Transaction reverted: ${hash}`)
            }
            return receipt
        }

        // "Speed up" or "Cancel" in the wallet publishes a different
        // transaction with the same nonce, and this hash can then never mine.
        // viem watched for that and followed the replacement; we cannot, but we
        // can at least stop pretending and say so, instead of timing out five
        // minutes later on money that has already moved. Detected by the
        // account's nonce advancing past this transaction's while no receipt
        // for it exists.
        if (replacement?.nonce !== null && replacement !== undefined) {
            try {
                const countHex = (await eth.request({
                    method: 'eth_getTransactionCount',
                    params: [replacement.from, 'latest'],
                })) as string
                if (parseInt(countHex, 16) > replacement.nonce) {
                    throw new ReplacedTransactionError(hash)
                }
            } catch (e: unknown) {
                if (e instanceof ReplacedTransactionError) throw e
                // Any other failure here is only a lost optimisation.
            }
        }

        if (Date.now() >= deadline) {
            throw new Error(`Timed out waiting for transaction ${hash} to be confirmed.`)
        }
        await sleep(RECEIPT_POLL_INTERVAL_MS)
    }
}

/**
 * Refuse to sign anything unless the wallet is actually on the intended chain.
 *
 * viem did this before every send (`getChainId` + `assertCurrentChain`, because
 * the clients were constructed with a `chain`), and dropping it was the one
 * dangerous part of removing viem: several mobile wallets resolve
 * `wallet_switchEthereumChain` optimistically, before the network has really
 * changed. USDC and USDT exist on all five chains we accept, so an allowance
 * read on the wrong chain succeeds and returns 0, and the approve and transfer
 * that follow are signed on a chain where PayHub may not exist — the tokens
 * leave and the backend, which verifies against the order's own chain, can
 * never match the hash.
 */
async function assertChain(eth: Eip1193Provider, expectedChainId: number, chain: string): Promise<void> {
    const current = (await request(eth, {method: 'eth_chainId'})) as string
    if (parseInt(String(current), 16) !== expectedChainId) {
        throw new Error(
            `Your wallet is on the wrong network. Please switch to ${chain} (chain ${expectedChainId}) and try again.`
        )
    }
}

async function sendTransaction(
    eth: Eip1193Provider,
    {from, to, data, chainId, chain}: {from: Hex; to: Hex; data: Hex; chainId: number; chain: string},
): Promise<Hex> {
    // Re-checked per send, not once after the switch: the wallet can move to
    // another network while the user waits for the approve to confirm.
    await assertChain(eth, chainId, chain)

    // No gas/gasPrice: let the wallet estimate, matching viem's default here.
    // chainId is passed explicitly so the wallet rejects the transaction itself
    // if it disagrees with us about the current network.
    const hash = (await request(eth, {
        method: 'eth_sendTransaction',
        params: [{from, to, data, chainId: `0x${chainId.toString(16)}`}],
    })) as string
    if (typeof hash !== 'string' || !hash.startsWith('0x')) {
        throw new Error('Wallet returned an invalid transaction hash.')
    }
    return hash as Hex
}

export async function executePayHubPayment({
    chain,
    tokenAddress,
    payHubAddress,
    receiverAddress,
    amount,
    eventId,
    orderNumber,
    onStep,
    onTxHash,
    onAccount,
}: {
    chain: string
    tokenAddress: string
    payHubAddress: string
    receiverAddress: string
    amount: bigint
    eventId: string
    orderNumber: bigint
    onStep: (step: PaymentStep) => void
    /**
     * Called the moment the wallet returns the payment hash, before waiting for
     * it to confirm. Everything after this point can fail with the money
     * already gone, so the caller needs the hash then — not on return.
     */
    onTxHash?: (hash: `0x${string}`) => void
    /** The connected account, as soon as it is known. */
    onAccount?: (account: `0x${string}`) => void
}): Promise<{txHash: `0x${string}`; account: `0x${string}`}> {
    const eth = getProvider()

    const chainId = CHAIN_ID[chain]
    if (!chainId) throw new Error(`Unsupported chain: ${chain}`)

    // 1. Connect wallet
    onStep('connecting')
    const accounts = (await request(eth, {method: 'eth_requestAccounts'})) as string[]
    const account = accounts?.[0] as Hex | undefined
    if (!account) throw new Error('No account available. Please unlock your wallet and try again.')
    onAccount?.(account)

    // 2. Switch to correct chain
    onStep('switching_chain')
    await request(eth, {
        method: 'wallet_switchEthereumChain',
        params: [{chainId: `0x${chainId.toString(16)}`}],
    })
    await assertChain(eth, chainId, chain)

    // 3. Check & set allowance
    onStep('checking_allowance')
    const allowanceData = encodeFunctionCall(SIG_ALLOWANCE, [
        {type: 'address', value: account},
        {type: 'address', value: payHubAddress},
    ])
    const allowanceResult = (await request(eth, {
        method: 'eth_call',
        params: [{to: tokenAddress as Hex, data: allowanceData}, 'latest'],
    })) as string
    let allowance: bigint
    try {
        allowance = decodeUint256Result(allowanceResult)
    } catch {
        // Empty return data means there is no contract at that address on this
        // network — almost always the wrong chain or a misconfigured token.
        throw new Error(
            `Could not read the token contract on ${chain}. ` +
            'The payment is not configured correctly for this network; please contact the organizer.'
        )
    }

    if (allowance < amount) {
        onStep('approving')
        const approveTxHash = await sendTransaction(eth, {
            from: account,
            chainId,
            chain,
            to: tokenAddress as Hex,
            data: encodeFunctionCall(SIG_APPROVE, [
                {type: 'address', value: payHubAddress},
                {type: 'uint256', value: amount},
            ]),
        })
        onStep('waiting_approve')
        await waitForReceipt(eth, approveTxHash, {
            from: account,
            nonce: await getTransactionNonce(eth, approveTxHash),
        })
    }

    // 4. Call PayHub.transfer(to, token, amount, productId, itemId)
    //    productId = event id (TSID → uint), itemId = ticket item id (TSID → uint)
    onStep('sending_payment')
    const txHash = await sendTransaction(eth, {
        from: account,
        chainId,
        chain,
        to: payHubAddress as Hex,
        data: encodeFunctionCall(SIG_PAYHUB_TRANSFER, [
            {type: 'address', value: receiverAddress},
            {type: 'address', value: tokenAddress},
            {type: 'uint256', value: amount},
            {type: 'uint256', value: tsidToBigInt(eventId)},
            {type: 'uint256', value: orderNumber},
        ]),
    })

    onTxHash?.(txHash)

    onStep('waiting_confirm')
    await waitForReceipt(eth, txHash, {
        from: account,
        nonce: await getTransactionNonce(eth, txHash),
    })

    return {txHash, account}
}
