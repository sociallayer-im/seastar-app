'use client'

import {useState} from 'react'
import {Dictionary} from '@/lang'
import {requestEmailCode, verifyEmailCode} from '@sola/sdk'
import {CLIENT_MODE, CODE_LENGTH} from '@/app/config'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {Button} from '@/components/shadcn/Button'
import {Input} from '@/components/shadcn/Input'
import {clientCheckUserLoggedInAndRedirect, setAuth} from '@/utils'
import {useRouter} from 'next/navigation'

export default function FormVerifyEmail({lang, email}: {lang: Dictionary, email: string}) {
    const router = useRouter()
    const [code, setCode] = useState('')
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const verify = async () => {
        const loading = showLoading()
        try {
            const {token, user} = await verifyEmailCode({
                params: {email, code: code.trim()},
                clientMode: CLIENT_MODE
            })
            setAuth(token)
            // A first-time sign-in has no username yet; seed /register with the
            // local part of the address as a starting suggestion.
            await clientCheckUserLoggedInAndRedirect(token, user.name ? undefined : email.split('@')[0])
        } catch (e: unknown) {
            toast({
                title: lang['Sign In'],
                description: e instanceof Error ? e.message : 'Invalid or expired code',
                variant: 'destructive'
            })
        } finally {
            closeModal(loading)
        }
    }

    const resend = async () => {
        const loading = showLoading()
        try {
            await requestEmailCode({params: {email}, clientMode: CLIENT_MODE})
            // The backend invalidates any previous unused code, so say so —
            // otherwise people try the first one they received.
            toast({title: lang['Check your inbox'], description: `${lang['Enter the code we sent to']} ${email}`})
        } catch (e: unknown) {
            toast({
                title: lang['Sign In'],
                description: e instanceof Error ? e.message : 'Failed to send code',
                variant: 'destructive'
            })
        } finally {
            closeModal(loading)
        }
    }

    return <div className="max-w-[400px] w-full px-4 mx-auto">
        <div className="text-xl font-semibold mb-2">{lang['Check your inbox']}</div>
        <div className="text-sm text-gray-500 mb-4">
            {lang['Enter the code we sent to']} <span className="font-medium">{email}</span>
        </div>

        <Input
            variant="textCenter"
            className="w-full shadow-xs tracking-[0.3em] mb-4"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            maxLength={CODE_LENGTH}
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => {
                if (e.key === 'Enter' && code.trim().length >= CODE_LENGTH) verify()
            }}/>

        <Button variant="special" className="w-full" onClick={verify} disabled={code.trim().length < CODE_LENGTH}>
            {lang['Confirm']}
        </Button>
        <div className="flex flex-row justify-between mt-3">
            <Button variant="ghost" onClick={() => {
                router.push('/signin')
            }}>{lang['Back']}</Button>
            <Button variant="ghost" onClick={resend}>{lang['Resend Code']}</Button>
        </div>
    </div>
}
