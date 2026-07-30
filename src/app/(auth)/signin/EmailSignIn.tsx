'use client'

import {useRef, useState} from 'react'
import {Dictionary} from '@/lang'
import {requestEmailCode} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'

// Intentionally the same permissive shape the auth app used. The backend
// re-validates with URI::MailTo::EMAIL_REGEXP and owns the real verdict; this
// only catches obvious typos before spending a round trip.
const EMAIL_RE = /^[\w.+-]+@([\w-]+\.)+[\w-]{2,63}$/

export default function EmailSignIn({lang}: {lang: Dictionary}) {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    // A ref, not state: this guards against double-submit within a single tick
    // (Enter plus a click), where a state update wouldn't have landed yet.
    const submitting = useRef(false)
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

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
            await requestEmailCode({params: {email: address}, clientMode: CLIENT_MODE})
            // Same URL the standalone auth app navigated to, so the flow (and
            // browser-back out of it) behaves exactly as before.
            window.location.href = `/verify-email?email=${encodeURIComponent(address)}`
        } catch (e: unknown) {
            toast({
                title: lang['Sign In'],
                description: e instanceof Error ? e.message : 'Failed to send code',
                variant: 'destructive'
            })
        } finally {
            submitting.current = false
            closeModal(loading)
        }
    }

    return <div className="mb-3">
        <label className={`${error ? 'border-red-400 ' : ''}input shadow flex flex-row items-center w-full bg-secondary focus-within:outline-none focus-within:border-primary pr-0`}>
            <i className="uil-envelope mr-2 text-2xl"/>
            <input
                className="flex-1 w-full bg-transparent outline-none"
                type="email"
                name="email"
                autoComplete="email"
                placeholder={lang['Email']}
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter') submit()
                }}/>
            <button
                type="button"
                title={lang['Sign In']}
                onClick={submit}
                className="flex flex-row items-center gap-1 mr-2 px-2 cursor-pointer text-sm font-medium">
                {lang['Go']}
                <i className="uil-arrow-right text-2xl"/>
            </button>
        </label>
        {!!error && <div className="text-red-400 text-sm my-2">{error}</div>}
    </div>
}
