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

function getProvider(): Eip1193Provider {
    const eth =
        typeof window !== 'undefined'
            ? (window as unknown as {ethereum?: Eip1193Provider}).ethereum
            : undefined
    if (!eth) throw new Error('No wallet found. Please install MetaMask or a compatible wallet.')
    return eth
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Poll `eth_getTransactionReceipt` until mined; throws if the tx reverted. */
async function waitForReceipt(eth: Eip1193Provider, hash: Hex): Promise<TransactionReceipt> {
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

        if (Date.now() >= deadline) {
            throw new Error(`Timed out waiting for transaction ${hash} to be confirmed.`)
        }
        await sleep(RECEIPT_POLL_INTERVAL_MS)
    }
}

async function sendTransaction(
    eth: Eip1193Provider,
    {from, to, data}: {from: Hex; to: Hex; data: Hex},
): Promise<Hex> {
    // No gas/gasPrice: let the wallet estimate, matching viem's default here.
    const hash = (await eth.request({
        method: 'eth_sendTransaction',
        params: [{from, to, data}],
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
}: {
    chain: string
    tokenAddress: string
    payHubAddress: string
    receiverAddress: string
    amount: bigint
    eventId: string
    orderNumber: bigint
    onStep: (step: PaymentStep) => void
}): Promise<{txHash: `0x${string}`; account: `0x${string}`}> {
    const eth = getProvider()

    const chainId = CHAIN_ID[chain]
    if (!chainId) throw new Error(`Unsupported chain: ${chain}`)

    // 1. Connect wallet
    onStep('connecting')
    const accounts = (await eth.request({method: 'eth_requestAccounts'})) as string[]
    const account = accounts?.[0] as Hex | undefined
    if (!account) throw new Error('No account available. Please unlock your wallet and try again.')

    // 2. Switch to correct chain
    onStep('switching_chain')
    await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{chainId: `0x${chainId.toString(16)}`}],
    })

    // 3. Check & set allowance
    onStep('checking_allowance')
    const allowanceData = encodeFunctionCall(SIG_ALLOWANCE, [
        {type: 'address', value: account},
        {type: 'address', value: payHubAddress},
    ])
    const allowanceResult = (await eth.request({
        method: 'eth_call',
        params: [{to: tokenAddress as Hex, data: allowanceData}, 'latest'],
    })) as string
    const allowance = decodeUint256Result(allowanceResult)

    if (allowance < amount) {
        onStep('approving')
        const approveTxHash = await sendTransaction(eth, {
            from: account,
            to: tokenAddress as Hex,
            data: encodeFunctionCall(SIG_APPROVE, [
                {type: 'address', value: payHubAddress},
                {type: 'uint256', value: amount},
            ]),
        })
        onStep('waiting_approve')
        await waitForReceipt(eth, approveTxHash)
    }

    // 4. Call PayHub.transfer(to, token, amount, productId, itemId)
    //    productId = event id (TSID → uint), itemId = ticket item id (TSID → uint)
    onStep('sending_payment')
    const txHash = await sendTransaction(eth, {
        from: account,
        to: payHubAddress as Hex,
        data: encodeFunctionCall(SIG_PAYHUB_TRANSFER, [
            {type: 'address', value: receiverAddress},
            {type: 'address', value: tokenAddress},
            {type: 'uint256', value: amount},
            {type: 'uint256', value: tsidToBigInt(eventId)},
            {type: 'uint256', value: orderNumber},
        ]),
    })

    onStep('waiting_confirm')
    await waitForReceipt(eth, txHash)

    return {txHash, account}
}
