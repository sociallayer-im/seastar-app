// viem-free part of the EVM payment flow: step labels and pure helpers.
// Kept separate so DialogTicket can render without loading viem — the heavy
// executePayHubPayment in ./evm_payment is dynamically imported on pay click.

export type PaymentStep =
    | 'idle'
    | 'connecting'
    | 'switching_chain'
    | 'checking_allowance'
    | 'approving'
    | 'waiting_approve'
    | 'sending_payment'
    | 'waiting_confirm'
    | 'verifying'
    | 'done'
    | 'error'

export const PAYMENT_STEP_LABEL: Record<PaymentStep, string> = {
    idle: '',
    connecting: 'Connecting wallet...',
    switching_chain: 'Switching network...',
    checking_allowance: 'Checking allowance...',
    approving: 'Approving token spend...',
    waiting_approve: 'Waiting for approval confirmation...',
    sending_payment: 'Sending payment...',
    waiting_confirm: 'Waiting for confirmation...',
    verifying: 'Verifying payment...',
    done: 'Payment successful!',
    error: '',
}

// TSIDs are 13-char Crockford base32 strings encoding a 64-bit integer —
// decode so on-chain productId/itemId stay stable, reversible references.
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
export function tsidToBigInt(tsid: string): bigint {
    let acc = BigInt(0)
    for (const raw of tsid.toUpperCase()) {
        const idx = CROCKFORD.indexOf(raw)
        if (idx === -1) continue // skip separators/invalid chars
        acc = acc * BigInt(32) + BigInt(idx)
    }
    return acc
}

/** Returns token address for the selected chain from a payment method */
export function resolveTokenAddress(
    method: {token_address?: string | null; chain_token_addresses?: Record<string, string> | null},
    chain: string,
): string {
    return method.chain_token_addresses?.[chain] || method.token_address || ''
}
