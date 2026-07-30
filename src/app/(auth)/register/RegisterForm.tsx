'use client'

import {useEffect, useState} from 'react'
import {Dictionary} from '@/lang'
import {getProfileDetailByAuth, getProfileDetailByName, updateProfile} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {Button} from '@/components/shadcn/Button'
import {Input} from '@/components/shadcn/Input'
import {clientRedirectToReturn, getAuth} from '@/utils'

// soon's rule, verbatim: /\A[a-z0-9_]{3,30}\z/ (app/models/user.rb). Kept in
// sync deliberately — a mismatch here just means a confusing 422 from the API.
const USERNAME_RE = /^[a-z0-9_]+$/
const MIN_LENGTH = 3
const MAX_LENGTH = 30

export default function RegisterForm({lang, prefill}: {lang: Dictionary, prefill?: string}) {
    const [username, setUsername] = useState(prefill || '')
    const [error, setError] = useState('')
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const validate = (value: string): string => {
        if (!USERNAME_RE.test(value)) return lang['Contain the English-language letters a-z and the digits 0-9']
        if (value.length < MIN_LENGTH) return `${lang['Should be equal or longer than']} ${MIN_LENGTH}`
        if (value.length > MAX_LENGTH) return `${lang['Should be equal or shorter than']} ${MAX_LENGTH}`
        return ''
    }

    useEffect(() => {
        setError(username ? validate(username) : '')
        // validate closes over `lang`, which is stable for the page's lifetime.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [username])

    const submit = async () => {
        if (error || !username) return
        const authToken = getAuth()
        if (!authToken) {
            window.location.href = '/signin'
            return
        }

        const loading = showLoading()
        try {
            const name = username.trim()
            // A courtesy pre-check for a clearer message than the API's 422.
            // Not a guarantee — the backend's uniqueness constraint is what
            // actually decides, and it still reports a conflict below.
            if (await getProfileDetailByName({params: {name}, clientMode: CLIENT_MODE})) {
                setError(lang['User already exists'])
                return
            }

            await updateProfile({params: {profile: {name}, authToken}, clientMode: CLIENT_MODE})
            const profile = await getProfileDetailByAuth({params: {authToken}, clientMode: CLIENT_MODE})

            // A wallet-first account has no email yet, and email is how sign-in
            // and notifications work — send them on to bind one. Email sign-ups
            // already have theirs and are done.
            if (profile?.email) {
                clientRedirectToReturn()
            } else {
                window.location.href = '/bind-email'
            }
        } catch (e: unknown) {
            toast({
                title: lang['Confirm'],
                description: e instanceof Error ? e.message : 'Failed to set username',
                variant: 'destructive'
            })
        } finally {
            closeModal(loading)
        }
    }

    return <div className="max-w-[400px] w-full px-4 mx-auto">
        <div className="text-xl font-semibold mb-2">{lang['Set a unique Social Layer username']}</div>
        <ul className="text-sm text-gray-500 mb-4 list-disc pl-5">
            <li>{lang['Contain the English-language letters a-z and the digits 0-9']}</li>
            <li>{`${lang['Should be equal or longer than']} ${MIN_LENGTH}`}</li>
        </ul>

        <Input
            className={`w-full shadow-sm ${error ? 'border-red-400' : ''}`}
            type="text"
            name="username"
            autoFocus
            autoComplete="off"
            maxLength={MAX_LENGTH}
            value={username}
            placeholder={lang['Your username']}
            onChange={e => {
                    // Reject disallowed characters at the keystroke rather than
                    // showing an error for something we won't accept anyway.
                    const next = e.target.value.toLowerCase()
                    if (!/[^a-z0-9_]/.test(next)) setUsername(next)
                }}
            onKeyDown={e => {
                if (e.key === 'Enter') submit()
            }}/>

        <Button variant="special" className="w-full my-4" disabled={!!error || !username} onClick={submit}>
            {lang['Confirm']}
        </Button>
        <div className="text-red-400 text-sm min-h-6">{error}</div>
    </div>
}
