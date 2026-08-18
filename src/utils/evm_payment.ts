import {createPublicClient, createWalletClient, custom, parseAbi} from 'viem'
import {arbitrum, base, mainnet, optimism, polygon} from 'viem/chains'
import type {Chain} from 'viem'
import {tsidToBigInt, type PaymentStep} from '@/utils/evm_payment_steps'

const CHAIN_MAP: Record<string, Chain> = {
    ethereum: mainnet,
    optimism,
    arbitrum,
    base,
    polygon,
}

const ERC20_ABI = parseAbi([
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
])

const PAYHUB_ABI = parseAbi([
    'function transfer(address to, address token, uint256 amount, uint256 productId, uint256 itemId)',
])

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eth = typeof window !== 'undefined' ? (window as any).ethereum : undefined
    if (!eth) throw new Error('No wallet found. Please install MetaMask or a compatible wallet.')

    const viemChain = CHAIN_MAP[chain]
    if (!viemChain) throw new Error(`Unsupported chain: ${chain}`)

    const walletClient = createWalletClient({chain: viemChain, transport: custom(eth)})
    const publicClient = createPublicClient({chain: viemChain, transport: custom(eth)})

    // 1. Connect wallet
    onStep('connecting')
    const [account] = await walletClient.requestAddresses()

    // 2. Switch to correct chain
    onStep('switching_chain')
    await walletClient.switchChain({id: viemChain.id})

    // 3. Check & set allowance
    onStep('checking_allowance')
    const allowance = await publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [account, payHubAddress as `0x${string}`],
    })

    if (allowance < amount) {
        onStep('approving')
        const approveTxHash = await walletClient.writeContract({
            account,
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [payHubAddress as `0x${string}`, amount],
        })
        onStep('waiting_approve')
        await publicClient.waitForTransactionReceipt({hash: approveTxHash})
    }

    // 4. Call PayHub.transfer(to, token, amount, productId, itemId)
    //    productId = event id (TSID → uint), itemId = ticket item id (TSID → uint)
    onStep('sending_payment')
    const txHash = await walletClient.writeContract({
        account,
        address: payHubAddress as `0x${string}`,
        abi: PAYHUB_ABI,
        functionName: 'transfer',
        args: [
            receiverAddress as `0x${string}`,
            tokenAddress as `0x${string}`,
            amount,
            tsidToBigInt(eventId),
            orderNumber,
        ],
    })

    onStep('waiting_confirm')
    await publicClient.waitForTransactionReceipt({hash: txHash})

    return {txHash, account}
}
