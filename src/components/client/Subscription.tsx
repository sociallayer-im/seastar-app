'use client'

import {subscripting, SubscriptionResponse, ProfileDetail} from '@sola/sdk'
import {useEffect, useState} from 'react'
import {Dictionary} from '@/lang'
import useModal from '@/components/client/Modal/useModal'
import DialogInviteDetail from '@/components/client/DialogInviteDetail'

export default function Subscription({lang, profile} : {lang: Dictionary, profile: ProfileDetail}) {
    const [message, setMessage] = useState<SubscriptionResponse>({invites: []})
    const {openModal} = useModal()

    useEffect(() => {
        console.log('subscribe message: ', message)
        if (message.invites.length > 0) {
            message.invites.forEach((item) => {
                openModal({
                    content: (close) => <DialogInviteDetail
                        inviteDetail={message.invites[0]}
                        close={close!}
                        lang={lang} />
                })
            })
        }
    }, [message])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const client = subscripting({
                profile,
                onMessage: (message) => {
                    setMessage(message)
                }
            })
        }
    }, [])


    return null
}

