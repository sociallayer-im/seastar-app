'use client'

import {useEffect} from 'react'
import {getProfileActivities, getMyPendingInvites, ProfileDetail} from '@sola/sdk'
import {Dictionary} from '@/lang'
import useModal from '@/components/client/Modal/useModal'
import DialogInviteDetail from '@/components/client/DialogInviteDetail'
import {
    addDisplayedInvite,
    newInviteDisplayed,
} from '@/components/client/Subscription/uilts'
import {CLIENT_MODE} from '@/app/config'
import {getAuth} from '@/utils'

const PENDING_INVITES_CHECKED_KEY = 'pending_email_invites_checked'

export default function StartupChecks({lang, profile}: { lang: Dictionary, profile: ProfileDetail }) {
    const {openModal} = useModal()

    useEffect(() => {
        const check = async () => {
            try {
                const authTokenForActivities = getAuth()
                if (authTokenForActivities) {
                    const activities = await getProfileActivities({
                        params: {authToken: authTokenForActivities},
                        clientMode: CLIENT_MODE
                    })

                    if (activities?.length) {
                        const unread = activities.filter(a => !a.has_read)
                        if (unread.length > 0) {
                            window.postMessage({type: 'has-unread-activities', data: unread}, window.location.origin)
                        }
                    }
                }
                // Invite modals come from the pending-invites check below —
                // soon has no standalone invite-by-id lookup for recipients.

                if (!sessionStorage.getItem(PENDING_INVITES_CHECKED_KEY)) {
                    sessionStorage.setItem(PENDING_INVITES_CHECKED_KEY, '1')
                    const authToken = getAuth()
                    if (authToken) {
                        const pendingInvites = await getMyPendingInvites({
                            params: {authToken},
                            clientMode: CLIENT_MODE
                        })
                        for (const inviteDetail of pendingInvites) {
                            if (!newInviteDisplayed(inviteDetail.id)) {
                                addDisplayedInvite(inviteDetail.id)
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
