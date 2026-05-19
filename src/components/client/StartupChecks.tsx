'use client'

import {useEffect} from 'react'
import {getProfileActivities, getInviteDetailByInviteId, ProfileDetail} from '@sola/sdk'
import {Dictionary} from '@/lang'
import useModal from '@/components/client/Modal/useModal'
import DialogInviteDetail from '@/components/client/DialogInviteDetail'
import {
    addDisplayedInvite,
    newInviteDisplayed,
} from '@/components/client/Subscription/uilts'
import {CLIENT_MODE} from '@/app/config'

export default function StartupChecks({lang, profile}: { lang: Dictionary, profile: ProfileDetail }) {
    const {openModal} = useModal()

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
                    if (activity.action === 'group_invite/send' && activity.item_id) {
                        if (!newInviteDisplayed(activity.item_id)) {
                            addDisplayedInvite(activity.item_id)
                            const inviteDetail = await getInviteDetailByInviteId(activity.item_id)
                            const isPending = inviteDetail?.status === 'sending'
                            const isNotExpired = inviteDetail?.expires_at && new Date(inviteDetail.expires_at) > new Date()
                            if (inviteDetail && isPending && isNotExpired) {
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
