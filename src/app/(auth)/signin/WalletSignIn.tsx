'use client'

import {Dictionary} from '@/lang'
import {buildSiweMessage, getSiweNonce, signInWithWallet} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {Button} from '@/components/shadcn/Button'
import {clientCheckUserLoggedInAndRedirect, setAuth} from '@/utils'

/**
 * The subset of EIP-1193 this flow needs. Every browser wallet injects
 * window.ethereum with this shape.
 */
interface Eip1193Provider {
    request: (args: {method: string, params?: unknown[]}) => Promise<unknown>
}

/**
 * Sign-In with Ethereum against `window.ethereum` directly.
 *
 * Deliberately no wallet-discovery layer: the previous auth app pulled in wagmi
 * plus @tanstack/react-query to enumerate connectors and probe each one for
 * readiness, which for a single injected-provider flow only bought a spinner and
 * a list with one entry in it. Two RPC calls replace all of it, and this app
 * gains no dependencies.
 *
 * None of that weakens the check. Verification is entirely server-side: the
 * nonce is minted by the backend, single-use and short-lived; the SIWE `domain`
 * must be on the backend's allowlist; and siwe-rb recovers the signer from the
 * signature. A client that lies about any of it simply fails to authenticate.
 */
export default function WalletSignIn({lang}: {lang: Dictionary}) {
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const handleSignIn = async () => {
        const provider = (window as unknown as {ethereum?: Eip1193Provider}).ethereum
        if (!provider) {
            toast({
                title: lang['Sign In'],
                description: lang['No Ethereum wallet found in this browser'],
                variant: 'destructive'
            })
            return
        }

        const loading = showLoading()
        try {
            const accounts = await provider.request({method: 'eth_requestAccounts'}) as string[]
            const address = accounts?.[0]
            if (!address) throw new Error('No account selected')

            // Fetched after the account is known, and used immediately: the
            // backend expires nonces, so minting one before the (potentially
            // slow) wallet prompt risks signing a message that's already stale.
            const nonce = await getSiweNonce({clientMode: CLIENT_MODE})
            const message = buildSiweMessage({
                domain: window.location.host,
                origin: window.location.origin,
                address,
                nonce
            })

            // personal_sign takes (message, address) in that order. The message
            // is sent to the backend byte-for-byte as signed — the signature is
            // over these exact bytes.
            const signature = await provider.request({
                method: 'personal_sign',
                params: [message, address]
            }) as string

            const {token} = await signInWithWallet({params: {message, signature}, clientMode: CLIENT_MODE})
            setAuth(token)
            await clientCheckUserLoggedInAndRedirect(token)
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : 'Unknown error'
            // Declining the signature prompt is a normal choice, not an error
            // worth a toast. Wallets report it as "User rejected…" (or EIP-1193
            // code 4001, which surfaces in the message text).
            if (!/reject|denied|4001/i.test(message)) {
                toast({title: lang['Sign In'], description: message, variant: 'destructive'})
            }
        } finally {
            closeModal(loading)
        }
    }

    // Uses this app's Button rather than the standalone auth app's `btn btn-md`,
    // which were daisyUI classes — daisyUI isn't a dependency here, so those
    // produced no padding, height or alignment at all.
    return <Button
        variant="outline"
        onClick={handleSignIn}
        className="w-full justify-start gap-3 font-normal shadow-xs mb-3 sm:mb-0 [&_svg]:size-5">
        <i className="uil-wallet text-xl"/>
        {lang['Ethereum Wallet']}
    </Button>
}
