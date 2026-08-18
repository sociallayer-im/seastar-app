'use client'

import {useEffect, useState} from 'react'
import {Dictionary} from '@/lang'
import {getProfileDetailByAuth, getProfileDetailByName, updateProfile} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {Button} from '@/components/shadcn/Button'
import {Input} from '@/components/shadcn/Input'
import {clientRedirectToReturn, getAuth, HANDLE_MAX_LENGTH, HANDLE_MIN_LENGTH, toHandleInput, verifyHandle} from '@/utils'

export default function RegisterForm({lang, prefill}: {lang: Dictionary, prefill?: string}) {
    const [username, setUsername] = useState(prefill || '')
    const [error, setError] = useState('')
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    // Shared with the group-handle screen and kept in step with soon's
    // HandleName concern — a user name and a group handle are one rule now.
    const validate = (value: string): string => verifyHandle(value, lang) || ''

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

            // Registration is the LAST onboarding step — /bind-email runs before
            // this one now, because binding an already-registered address merges
            // the accounts and soon only allows that while the name is still
            // blank. Sending an account back to /bind-email from here would
            // offer a merge that can no longer happen.
            clientRedirectToReturn()
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
            <li>{lang['Contain the English-language letters a-z, the digits 0-9 and hyphens']}</li>
            <li>{`${lang['Should be equal or longer than']} ${HANDLE_MIN_LENGTH}`}</li>
        </ul>

        <Input
            className={`w-full shadow-xs ${error ? 'border-red-400' : ''}`}
            type="text"
            name="username"
            autoFocus
            autoComplete="off"
            maxLength={HANDLE_MAX_LENGTH}
            value={username}
            placeholder={lang['Your username']}
            onChange={e => {
                    // Normalised at the keystroke rather than shown as an
                    // error for something we would not accept anyway.
                    setUsername(toHandleInput(e.target.value))
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
