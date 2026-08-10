'use client'

import {useState} from 'react'
import {Dictionary} from '@/lang'
import {bindPhone, getProfileDetailByAuth, isBindEmailMerged, requestPhoneCode} from '@sola/sdk'
import {CLIENT_MODE, CODE_LENGTH} from '@/app/config'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {Button} from '@/components/shadcn/Button'
import {Input} from '@/components/shadcn/Input'
import {getAuth, onboardingTarget, returnTarget, setAuth} from '@/utils'

export default function FormVerifyBindPhone({lang, phone}: {lang: Dictionary, phone: string}) {
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
            const result = await bindPhone({
                params: {phone, code: code.trim(), authToken},
                clientMode: CLIENT_MODE
            })

            // Same response shape as bindEmail, merge included: the number
            // already had an account (an earlier SMS sign-in) and this WeChat
            // one was folded into it.
            if (isBindEmailMerged(result)) {
                // The token we authenticated with belongs to an account that no
                // longer exists, so it MUST be replaced before anything else
                // runs.
                setAuth(result.token)
                toast({title: lang['Bind Phone Number'], description: lang['Signed in to the account for this number']})
                // Re-read rather than assume: the surviving account may still
                // owe an email or a username.
                const merged = await getProfileDetailByAuth({
                    params: {authToken: result.token},
                    clientMode: CLIENT_MODE
                })
                window.location.href = onboardingTarget(merged)
                return
            }

            // Plain bind: phone is the FIRST step, so the email question and
            // the username step both still lie ahead.
            const profile = await getProfileDetailByAuth({params: {authToken}, clientMode: CLIENT_MODE})
            window.location.href = profile ? onboardingTarget(profile) : returnTarget()
        } catch (e: unknown) {
            toast({
                title: lang['Bind Phone Number'],
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
            await requestPhoneCode({params: {phone, context: 'bind_phone'}, clientMode: CLIENT_MODE})
            toast({title: lang['Check your messages'], description: `${lang['Enter the code we sent to']} ${phone}`})
        } catch (e: unknown) {
            toast({
                title: lang['Bind Phone Number'],
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
                if (e.key === 'Enter' && code.trim().length >= CODE_LENGTH) confirm()
            }}/>

        <Button variant="special" className="w-full" onClick={confirm} disabled={code.trim().length < CODE_LENGTH}>
            {lang['Confirm']}
        </Button>
        <div className="flex flex-row justify-between mt-3">
            <Button variant="ghost" onClick={() => {
                window.location.href = '/bind-phone'
            }}>{lang['Back']}</Button>
            <Button variant="ghost" onClick={resend}>{lang['Resend Code']}</Button>
        </div>
    </div>
}
