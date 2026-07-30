'use client'

import {useState} from 'react'
import {Dictionary} from '@/lang'
import {bindEmail, requestEmailCode} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {Button} from '@/components/shadcn/Button'
import {Input} from '@/components/shadcn/Input'
import {clientRedirectToReturn, getAuth} from '@/utils'

export default function FormVerifyBindEmail({lang, email}: {lang: Dictionary, email: string}) {
    const [code, setCode] = useState('')
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const confirm = async () => {
        const authToken = getAuth()
        if (!authToken) {
            window.location.href = '/signin'
            return
        }

        const loading = showLoading()
        try {
            await bindEmail({
                params: {email, code: code.trim().toUpperCase(), authToken},
                clientMode: CLIENT_MODE
            })
            clientRedirectToReturn()
        } catch (e: unknown) {
            toast({
                title: lang['Bind Email'],
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
            await requestEmailCode({params: {email, context: 'bind_email'}, clientMode: CLIENT_MODE})
            toast({title: lang['Check your inbox'], description: `${lang['Enter the code we sent to']} ${email}`})
        } catch (e: unknown) {
            toast({
                title: lang['Bind Email'],
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
            className="w-full shadow-sm tracking-[0.3em] uppercase mb-4"
            inputMode="text"
            autoComplete="one-time-code"
            autoFocus
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => {
                if (e.key === 'Enter' && code.trim().length >= 6) confirm()
            }}/>

        <Button variant="special" className="w-full" onClick={confirm} disabled={code.trim().length < 6}>
            {lang['Confirm']}
        </Button>
        <div className="flex flex-row justify-between mt-3">
            <Button variant="ghost" onClick={() => {
                window.location.href = '/bind-email'
            }}>{lang['Back']}</Button>
            <Button variant="ghost" onClick={resend}>{lang['Resend Code']}</Button>
        </div>
    </div>
}
