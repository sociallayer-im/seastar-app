'use client'

import {useState} from 'react'
import {Switch} from '@/components/shadcn/Switch'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {Membership, setAdminNotification} from '@sola/sdk'
import {getAuth} from '@/utils'
import {CLIENT_MODE} from '@/app/config'
import {Dictionary} from '@/lang'

export interface AdminNotificationToggleProps {
    lang: Dictionary
    groupId: string
    membership: Membership
}

// Whether this owner/manager is emailed when someone who isn't a group admin
// creates an event in the group. Everyone starts subscribed; this is the
// opt-out.
//
// The row it sits in is a link to the member's profile, so the click has to be
// stopped here or toggling the switch navigates away — the state update would
// be thrown out by the page change before the request even settled.
export default function AdminNotificationToggle({lang, groupId, membership}: AdminNotificationToggleProps) {
    const [enabled, setEnabled] = useState(membership.admin_notification)
    const [busy, setBusy] = useState(false)
    const {toast} = useToast()

    const handleToggle = async (next: boolean) => {
        const authToken = getAuth()
        if (!authToken) {
            toast({title: lang['Please login first'], variant: 'destructive'})
            return
        }

        // Optimistic: the switch is the only thing on screen that reflects this
        // value, so waiting on the round trip would leave it visibly stuck.
        setEnabled(next)
        setBusy(true)
        try {
            await setAdminNotification({
                params: {groupId, membershipId: membership.id, adminNotification: next, authToken},
                clientMode: CLIENT_MODE
            })
        } catch (e: unknown) {
            setEnabled(!next)
            toast({
                description: e instanceof Error ? e.message : lang['Failed to update notification setting'],
                variant: 'destructive'
            })
        } finally {
            setBusy(false)
        }
    }

    return <div
        className="flex-row-item-center ml-auto shrink-0"
        title={lang['Email me when a member submits an event']}
        onClick={e => {
            e.preventDefault()
            e.stopPropagation()
        }}>
        <i className={`mr-1 text-base ${enabled ? 'uil-bell text-[#5992ff]' : 'uil-bell-slash text-gray-400'}`}/>
        <Switch
            checked={enabled}
            disabled={busy}
            aria-label={lang['Email me when a member submits an event']}
            onCheckedChange={handleToggle}/>
    </div>
}
