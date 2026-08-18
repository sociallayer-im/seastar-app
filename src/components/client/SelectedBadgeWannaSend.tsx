'use client'

import {Dictionary} from "@/lang"
import useModal from "@/components/client/Modal/useModal"
import {ReactNode} from "react"
import useSelectBadgeClass from "@/hooks/useSelectBadgeClass"
import {
    BadgeClass,
    getBadgeAndBadgeClassByOwnerName,
    Group,
    ProfileDetail
} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {useRouter} from 'next/navigation'

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

    const router = useRouter()
    const {showLoading, closeModal} = useModal()
    const {selectBadgeClass} = useSelectBadgeClass()

    const handleSelectedBadge = async () => {
        const loading = showLoading()
        try {
            let profileBadgeClasses: BadgeClass[] = []
            if (profileDetail) {
                profileBadgeClasses = (await getBadgeAndBadgeClassByOwnerName({
                    params: {name: profileDetail.name},
                    clientMode: CLIENT_MODE
                })).badgeClasses
            }

            let groupBadgeClasses: BadgeClass[] = []
            if (group) {
                groupBadgeClasses = (await getBadgeAndBadgeClassByOwnerName({
                    params: {name: group.name},
                    clientMode: CLIENT_MODE
                })).badgeClasses
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

                    router.push(sendBadgeUrl)
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
