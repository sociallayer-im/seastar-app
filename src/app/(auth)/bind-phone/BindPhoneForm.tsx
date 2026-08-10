'use client'

import {useRef, useState} from 'react'
import {Dictionary} from '@/lang'
import {requestPhoneCode} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {Button} from '@/components/shadcn/Button'
import PhoneNumberInput, {CN_MOBILE_RE, stripPhone} from '@/components/client/PhoneNumberInput'

export default function BindPhoneForm({lang}: {lang: Dictionary}) {
    const [phone, setPhone] = useState('')
    const [error, setError] = useState('')
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
            // context: 'bind_phone' matters. The backend scopes codes by context
            // so a bind code can never be replayed as a login code — a login
            // code minted here would be a way to sign in as that number's owner.
            await requestPhoneCode({params: {phone: number, context: 'bind_phone'}, clientMode: CLIENT_MODE})
            window.location.href = `/verify-bind-phone?phone=${encodeURIComponent(number)}`
        } catch (e: unknown) {
            toast({
                title: lang['Bind Phone Number'],
                description: e instanceof Error ? e.message : 'Failed to send code',
                variant: 'destructive'
            })
        } finally {
            submitting.current = false
            closeModal(loading)
        }
    }

    return <div className="max-w-[400px] w-full px-4 mx-auto">
        <div className="text-xl font-semibold mb-2">{lang['Bind Phone Number']}</div>
        <div className="text-sm text-gray-500 mb-4">
            {lang['Please verify your mobile number to finish setting up your account.']}
        </div>

        <PhoneNumberInput
            value={phone}
            onChange={setPhone}
            onEnter={submit}
            invalid={!!error}
            autoFocus
            placeholder={lang['Phone number']}/>
        <div className="text-red-400 text-sm min-h-6 my-1">{error}</div>

        {/* No Skip, unlike /bind-email. A WeChat sign-in is a mainland user who
            has a mobile number, and this is the one step the flow requires. */}
        <Button variant="special" className="w-full" onClick={submit}>{lang['Continue']}</Button>
    </div>
}
