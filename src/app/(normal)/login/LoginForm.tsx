'use client'

import {useState} from 'react'
import {Button} from '@/components/shadcn/Button'
import {Input} from '@/components/shadcn/Input'
import {requestEmailCode, verifyEmailCode} from '@sola/sdk'
import {setAuth, clientRedirectToReturn} from '@/utils'
import {CLIENT_MODE} from '@/app/config'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {Dictionary} from '@/lang'

export default function LoginForm({lang}: { lang: Dictionary }) {
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const [codeSent, setCodeSent] = useState(false)

    const handleSendCode = async () => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast({description: 'Please enter a valid email address'})
            return
        }
        const loading = showLoading()
        try {
            await requestEmailCode({params: {email}, clientMode: CLIENT_MODE})
            setCodeSent(true)
        } catch (e: unknown) {
            toast({description: e instanceof Error ? e.message : 'Failed to send code', variant: 'destructive'})
        } finally {
            closeModal(loading)
        }
    }

    const handleVerify = async () => {
        const loading = showLoading()
        try {
            const {token} = await verifyEmailCode({params: {email, code}, clientMode: CLIENT_MODE})
            setAuth(token)
            clientRedirectToReturn()
        } catch (e: unknown) {
            toast({description: e instanceof Error ? e.message : 'Invalid or expired code', variant: 'destructive'})
        } finally {
            closeModal(loading)
        }
    }

    return <div className="flex flex-col items-center rounded-lg border p-6 shadow-sm">
        <img src="/images/balloon.png" className="w-12 mb-2" alt=""/>
        <div className="text-lg font-semibold mb-4">{lang['Sign In']}</div>

        {!codeSent
            ? <>
                <Input
                    className="w-full mb-3"
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <Button variant="special" className="w-full" onClick={handleSendCode}>
                    {'Send Code'}
                </Button>
            </>
            : <>
                <div className="text-sm text-gray-500 mb-3">
                    {`We sent a sign-in code to ${email}`}
                </div>
                <Input
                    className="w-full mb-3"
                    placeholder="6-digit code"
                    inputMode="numeric"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                />
                <Button variant="special" className="w-full" onClick={handleVerify} disabled={code.length < 4}>
                    {lang['Sign In']}
                </Button>
                <Button variant="ghost" className="w-full mt-2" onClick={() => setCodeSent(false)}>
                    {'Change email'}
                </Button>
            </>
        }
    </div>
}
