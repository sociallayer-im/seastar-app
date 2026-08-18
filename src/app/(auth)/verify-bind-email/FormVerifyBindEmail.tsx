'use client'

import {useState} from 'react'
import {Dictionary} from '@/lang'
import {bindEmail, getProfileDetailByAuth, isBindEmailMerged, requestEmailCode} from '@sola/sdk'
import {CLIENT_MODE, CODE_LENGTH} from '@/app/config'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {Button} from '@/components/shadcn/Button'
import {Input} from '@/components/shadcn/Input'
import {clientRedirectToReturn, getAuth, returnTarget, setAuth} from '@/utils'
import {useRouter} from 'next/navigation'

export default function FormVerifyBindEmail({lang, email}: {lang: Dictionary, email: string}) {
    const router = useRouter()
    const [code, setCode] = useState('')
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const confirm = async () => {
        const authToken = getAuth()
        if (!authToken) {
            router.push('/signin')
            return
        }

        const loading = showLoading()
        try {
            const result = await bindEmail({
                params: {email, code: code.trim(), authToken},
                clientMode: CLIENT_MODE
            })

            if (isBindEmailMerged(result)) {
                // The address already had an account and this one was merged
                // into it. The token we authenticated with belongs to an
                // account that no longer exists, so it MUST be replaced before
                // anything else runs.
                setAuth(result.token)
                toast({title: lang['Bind Email'], description: lang['Signed in to your existing account']})
                // The surviving account is normally already registered, but an
                // email account without a username is possible — and landing
                // there would look signed-out everywhere.
                window.location.href = result.user.name ? returnTarget() : '/register'
                return
            }

            // Plain bind: this step now runs before /register, so an account
            // with no username still has that left to do.
            const profile = await getProfileDetailByAuth({params: {authToken}, clientMode: CLIENT_MODE})
            window.location.href = profile && !profile.name ? '/register' : returnTarget()
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
            className="w-full shadow-xs tracking-[0.3em] mb-4"
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
                router.push('/bind-email')
            }}>{lang['Back']}</Button>
            <Button variant="ghost" onClick={resend}>{lang['Resend Code']}</Button>
        </div>
    </div>
}
