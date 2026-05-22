'use client'

import {setAdminNotification} from '@sola/sdk'
import {getAuth} from '@/utils'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {CLIENT_MODE} from '@/app/config'
import {useState} from 'react'

export interface AdminNotificationToggleProps {
    groupId: number,
    currentValue: boolean,
}

export default function AdminNotificationToggle({groupId, currentValue}: AdminNotificationToggleProps) {
    const {toast} = useToast()
    const [enabled, setEnabled] = useState(currentValue)
    const [loading, setLoading] = useState(false)

    const toggle = async () => {
        const authToken = getAuth()
        if (!authToken) {
            toast({description: 'You are not logged in', variant: 'destructive'})
            return
        }

        setLoading(true)
        try {
            await setAdminNotification({
                params: {groupId, adminNotification: !enabled, authToken},
                clientMode: CLIENT_MODE
            })
            setEnabled(prev => !prev)
        } catch (e: unknown) {
            toast({
                description: e instanceof Error ? e.message : 'An error occurred',
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    return <button
        onClick={toggle}
        disabled={loading}
        title="Receive event approval notifications"
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
        <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-4' : 'translate-x-0'}`}/>
    </button>
}
