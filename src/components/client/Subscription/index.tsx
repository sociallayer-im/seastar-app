'use client'

import {
    SubscriptionClient,
    SubscriptionInviteResponse,
    ProfileDetail,
    SubscriptionVoucherResponse, SubscriptionActivityResponse
} from '@sola/sdk'
import {useEffect, useState} from 'react'
import {Dictionary} from '@/lang'
import useModal from '@/components/client/Modal/useModal'
import DialogInviteDetail from '@/components/client/DialogInviteDetail'
import {
    addDisplayedInvite,
    addDisplayedVoucher,
    newInviteDisplayed,
    newVoucherDisplayed
} from '@/components/client/Subscription/uilts'
import useShowVoucher from '@/hooks/useShowVoucher'
import {CLIENT_MODE} from '@/app/config'

export default function Subscription({lang, profile}: { lang: Dictionary, profile: ProfileDetail }) {
    const [invitesMsg, setInvitesMsg] = useState<SubscriptionInviteResponse>({invites: []})
    const [vouchersMsg, setVouchersMsg] = useState<SubscriptionVoucherResponse>({vouchers: []})
    const [activityMsg, setActivityMsg] = useState<SubscriptionActivityResponse>({activities: []})
    const {openModal} = useModal()
    const {showVoucher} = useShowVoucher()

    useEffect(() => {
        console.log('subscribe invites message: ', invitesMsg)
        if (invitesMsg.invites.length > 0) {
            invitesMsg.invites.forEach((item) => {
                if (!newInviteDisplayed(item.id)) {
                    addDisplayedInvite(item.id)
                    openModal({
                        content: (close) => <DialogInviteDetail
                            inviteDetail={item}
                            close={close!}
                            lang={lang}/>
                    })
                }
            })
        }
    }, [invitesMsg])


    useEffect(() => {
        console.log('subscribe vouchers message: ', vouchersMsg)
        if (vouchersMsg.vouchers.length > 0) {
            vouchersMsg.vouchers.forEach((item) => {
                if (!newVoucherDisplayed(item.id)) {
                    addDisplayedVoucher(item.id)
                    showVoucher(item.id, lang)
                }
            })
        }
    }, [vouchersMsg])

    useEffect(() => {
        console.log('subscribe vouchers message: ', vouchersMsg)
        if (vouchersMsg.vouchers.length > 0) {
            vouchersMsg.vouchers.forEach((item) => {
                if (!newVoucherDisplayed(item.id)) {
                    addDisplayedVoucher(item.id)
                    showVoucher(item.id, lang)
                }
            })
        }
    }, [vouchersMsg])

    useEffect(() => {
        console.log('subscribe activity message: ', activityMsg)
        if (activityMsg.activities.length > 0) {
            window.postMessage({type: 'has-unread-activities', data: activityMsg.activities}, window.location.origin)
        }
    }, [activityMsg])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const client = new SubscriptionClient(CLIENT_MODE)
            client.subscriptingInvite({
                profile,
                onMessage: (message) => {
                    setInvitesMsg(message)
                }
            })
            client.subscriptingVoucher({
                profile,
                onMessage: (message) => {
                    setVouchersMsg(message)
                }
            })
            client.subscriptingActivity({
                profile,
                onMessage: (message) => {
                    setActivityMsg(message)
                }
            })
        }
    }, [])


    return null
}

