'use client'

import {useState} from 'react'
import {Dictionary} from '@/lang'
import {requestPhoneCode, verifyPhoneCode} from '@sola/sdk'
import {CLIENT_MODE, CODE_LENGTH} from '@/app/config'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {Button} from '@/components/shadcn/Button'
import {Input} from '@/components/shadcn/Input'
import {clientCheckUserLoggedInAndRedirect, setAuth} from '@/utils'

export default function FormVerifyPhone({lang, phone}: {lang: Dictionary, phone: string}) {
    const [code, setCode] = useState('')
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const verify = async () => {
        const loading = showLoading()
        try {
            const {token} = await verifyPhoneCode({
                params: {phone, code: code.trim()},
                clientMode: CLIENT_MODE
            })
            setAuth(token)
            // No username prefill: unlike an email there is no local part to
            // suggest one from, and a phone number is not something to put in a
            // public handle by default.
            await clientCheckUserLoggedInAndRedirect(token)
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
            await requestPhoneCode({params: {phone}, clientMode: CLIENT_MODE})
            // The backend invalidates any previous unused code, so say so —
            // otherwise people try the first one they received.
            toast({title: lang['Check your messages'], description: `${lang['Enter the code we sent to']} ${phone}`})
        } catch (e: unknown) {
            // Resending is rate-limited (one a minute, five an hour) because
            // each one costs a message, so this toast is a normal outcome
            // rather than a failure — show what the backend actually said.
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
        <div className="text-xl font-semibold mb-2">{lang['Check your messages']}</div>
        <div className="text-sm text-gray-500 mb-4">
            {lang['Enter the code we sent to']} <span className="font-medium">{phone}</span>
        </div>

        <Input
            variant="textCenter"
            className="w-full shadow-sm tracking-[0.3em] mb-4"
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
                window.location.href = '/signin'
            }}>{lang['Back']}</Button>
            <Button variant="ghost" onClick={resend}>{lang['Resend Code']}</Button>
        </div>
    </div>
}
