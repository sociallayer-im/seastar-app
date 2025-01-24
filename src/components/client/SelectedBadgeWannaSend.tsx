'use client'

import {Dictionary} from "@/lang"
import useModal from "@/components/client/Modal/useModal"
import {ReactNode} from "react"
import useSelectBadgeClass from "@/hooks/useSelectBadgeClass"
import {
    BadgeClass,
    getBadgeAndBadgeClassByOwnerHandle, getBadgeClassAndInviteByHandle,
    Group,
    ProfileDetail
} from '@sola/sdk'

export interface SelectedBadgeWannaSendProps {
    children?: ReactNode
    lang: Dictionary
    toProfileHandle?: string
    profileDetail?: ProfileDetail
    returnPage?: string
    group?: Group
    className?: string
}

export default function SelectedBadgeWannaSend({
                                                   lang,
                                                   profileDetail,
                                                   group,
                                                   children,
                                                   toProfileHandle,
                                                   returnPage,
                                                   className
                                               }: SelectedBadgeWannaSendProps) {

    const {showLoading, closeModal} = useModal()
    const {selectBadgeClass} = useSelectBadgeClass()

    const handleSelectedBadge = async () => {
        const loading = showLoading()
        try {
            let profileBadgeClasses: BadgeClass[] = []
            if (profileDetail) {
                profileBadgeClasses = (await getBadgeAndBadgeClassByOwnerHandle(profileDetail.handle)).badgeClasses
            }

            let groupBadgeClasses: BadgeClass[] = []
            if (group) {
                groupBadgeClasses = (await getBadgeClassAndInviteByHandle(group.handle)).badgeClasses
            }

            selectBadgeClass({
                lang,
                profileBadgeClasses,
                groupBadgeClasses,
                toProfileHandle,
                returnPage,
                group,
                onSelect: (b) => {
                    let sendBadgeUrl = `/badge-class/${b.id}/send-badge`
                    if (toProfileHandle) {
                        sendBadgeUrl = sendBadgeUrl + `?to=${toProfileHandle}`
                    }

                    window.location.href = sendBadgeUrl
                }
            })
        } catch (e: unknown) {
            console.error(e)
        } finally {
            closeModal(loading)
        }
    }


    return <div onClick={handleSelectedBadge} className={className}>
        {children}
    </div>
}
