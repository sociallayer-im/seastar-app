'use client'

import {useEffect} from 'react'
import {getProfileActivities, getInviteDetailByInviteId, getMyPendingInvites, ProfileDetail} from '@sola/sdk'
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
                const activities = await getProfileActivities({
                    params: {profile_id: profile.id},
                    clientMode: CLIENT_MODE
                })

                if (activities?.length) {
                    const unread = activities.filter(a => !a.has_read)
                    if (unread.length > 0) {
                        window.postMessage({type: 'has-unread-activities', data: unread}, window.location.origin)
                    }

                    const toFetch = activities.filter(a =>
                        a.action === 'group_invite/send' && a.item_id && !newInviteDisplayed(a.item_id)
                    )
                    toFetch.forEach(a => addDisplayedInvite(a.item_id!))
                    const inviteDetails = await Promise.all(toFetch.map(a => getInviteDetailByInviteId(a.item_id!)))
                    inviteDetails.forEach(inviteDetail => {
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
                    })
                }

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
