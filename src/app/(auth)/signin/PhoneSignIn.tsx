'use client'

import {useRef, useState} from 'react'
import {Dictionary} from '@/lang'
import {requestPhoneCode} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import PhoneNumberInput, {CN_MOBILE_RE, stripPhone} from '@/components/client/PhoneNumberInput'
import {useRouter} from 'next/navigation'

/** SMS sign-in. Rendered only where PHONE_LOGIN is on — CN. */
export default function PhoneSignIn({lang}: {lang: Dictionary}) {
    const router = useRouter()
    const [phone, setPhone] = useState('')
    const [error, setError] = useState('')
    // A ref, not state: this guards against double-submit within a single tick
    // (Enter plus a click), where a state update wouldn't have landed yet. Worth
    // more here than on the email form — a duplicate submit is a second text
    // message, and the backend answers the second one with a 429.
    const submitting = useRef(false)
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const submit = async () => {
        const number = stripPhone(phone)
        if (!CN_MOBILE_RE.test(number)) {
            setError(lang['Invalid phone number'])
            return
        }
        setError('')
        if (submitting.current) return
        submitting.current = true

        const loading = showLoading()
        try {
            await requestPhoneCode({params: {phone: number}, clientMode: CLIENT_MODE})
            router.push(`/verify-phone?phone=${encodeURIComponent(number)}`)
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
        <PhoneNumberInput
            value={phone}
            onChange={setPhone}
            onEnter={submit}
            invalid={!!error}
            placeholder={lang['Phone number']}
            endAdornment={
                <button
                    type="button"
                    title={lang['Sign In']}
                    onClick={submit}
                    className="flex flex-row items-center gap-1 pl-2 cursor-pointer text-sm font-medium whitespace-nowrap">
                    {lang['Go']}
                    <i className="uil-arrow-right text-2xl"/>
                </button>
            }/>
        {!!error && <div className="text-red-400 text-sm my-2">{error}</div>}
    </div>
}
