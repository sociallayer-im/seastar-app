'use client'

import {useRef, useState} from 'react'
import {Dictionary} from '@/lang'
import {getProfileDetailByAuth, requestEmailCode} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {Button} from '@/components/shadcn/Button'
import {Input} from '@/components/shadcn/Input'
import {clientRedirectToReturn, getAuth, returnTarget} from '@/utils'

const EMAIL_RE = /^[\w.+-]+@([\w-]+\.)+[\w-]{2,63}$/

export default function BindEmailForm({lang}: {lang: Dictionary}) {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const submitting = useRef(false)
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    // This step now runs BEFORE /register, so skipping it can't just go to the
    // return target: an account with no username reads as signed-out
    // everywhere, and the user would land on a page that ignores their session.
    const skip = async () => {
        const authToken = getAuth()
        if (!authToken) {
            clientRedirectToReturn()
            return
        }
        const profile = await getProfileDetailByAuth({params: {authToken}, clientMode: CLIENT_MODE})
        window.location.href = profile && !profile.name ? '/register' : returnTarget()
    }

    const submit = async () => {
        const address = email.toLowerCase().trim()
        if (!EMAIL_RE.test(address)) {
            setError(lang['Invalid email'])
            return
        }
        setError('')
        if (submitting.current) return
        submitting.current = true

        const loading = showLoading()
        try {
            // context: 'bind_email' matters. The backend scopes codes by context
            // so a bind code can never be replayed as a login code — a login
            // code minted here would be a way to take over the address.
            await requestEmailCode({params: {email: address, context: 'bind_email'}, clientMode: CLIENT_MODE})
            window.location.href = `/verify-bind-email?email=${encodeURIComponent(address)}`
        } catch (e: unknown) {
            toast({
                title: lang['Bind Email'],
                description: e instanceof Error ? e.message : 'Failed to send code',
                variant: 'destructive'
            })
        } finally {
            submitting.current = false
            closeModal(loading)
        }
    }

    return <div className="max-w-[400px] w-full px-4 mx-auto">
        <div className="text-xl font-semibold mb-2">{lang['Bind Email']}</div>
        <div className="text-sm text-gray-500 mb-4">
            {lang['Please enter your email address so that you can log in and receive important notifications via email.']}
        </div>

        <Input
            className={`w-full shadow-sm ${error ? 'border-red-400' : ''}`}
            type="email"
            name="email"
            autoComplete="email"
            autoFocus
            placeholder={lang['Your email']}
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => {
                if (e.key === 'Enter') submit()
            }}
            startAdornment={<i className="uil-envelope text-2xl text-gray-400"/>}/>
        <div className="text-red-400 text-sm min-h-6 my-1">{error}</div>

        <Button variant="special" className="w-full" onClick={submit}>{lang['Continue']}</Button>
        {/* Binding is optional — a wallet or WeChat account works without an
            email, it just can't sign in by email or receive notifications. */}
        <Button variant="ghost" className="w-full mt-2" onClick={skip}>
            {lang['Skip']}
        </Button>
    </div>
}
