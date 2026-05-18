'use client'

import {useEffect} from 'react'
import {getProfileActivities, getInviteDetailByInviteId, ProfileDetail} from '@sola/sdk'
import {Dictionary} from '@/lang'
import useModal from '@/components/client/Modal/useModal'
import DialogInviteDetail from '@/components/client/DialogInviteDetail'
import useShowVoucher from '@/hooks/useShowVoucher'
import {
    addDisplayedInvite,
    addDisplayedVoucher,
    newInviteDisplayed,
    newVoucherDisplayed
} from '@/components/client/Subscription/uilts'
import {CLIENT_MODE} from '@/app/config'

export default function StartupChecks({lang, profile}: { lang: Dictionary, profile: ProfileDetail }) {
    const {openModal} = useModal()
    const {showVoucher} = useShowVoucher()

    useEffect(() => {
        const check = async () => {
            try {
                const activities = await getProfileActivities({
                    params: {profile_id: profile.id},
                    clientMode: CLIENT_MODE
                })

                if (!activities?.length) return

                const unread = activities.filter(a => !a.has_read)
                if (unread.length > 0) {
                    window.postMessage({type: 'has-unread-activities', data: unread}, window.location.origin)
                }

                for (const activity of activities) {
                    if (activity.action === 'voucher/send_badge' && activity.item_id) {
                        if (!newVoucherDisplayed(activity.item_id)) {
                            addDisplayedVoucher(activity.item_id)
                            showVoucher(activity.item_id, lang)
                        }
                    } else if (activity.action === 'group_invite/send' && activity.item_id) {
                        if (!newInviteDisplayed(activity.item_id)) {
                            addDisplayedInvite(activity.item_id)
                            const inviteDetail = await getInviteDetailByInviteId(activity.item_id)
                            if (inviteDetail) {
                                openModal({
                                    content: (close) => <DialogInviteDetail
                                        inviteDetail={inviteDetail}
                                        close={close!}
                                        lang={lang}/>
                                })
                            }
                        }
                    }
                }
            } catch (e) {
                console.error('startup checks failed', e)
            }
        }

        check()
    }, [])

    return null
}
