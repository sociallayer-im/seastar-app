'use client'

import {useState} from "react"
import {Button, buttonVariants} from "@/components/shadcn/Button"
import type {Dictionary} from "@/lang"
import NoData from "@/components/NoData"
import {getAvatar} from "@/utils"
import {Invite, BadgeClass, ProfileDetail, Group} from '@sola/sdk'
import Image from 'next/image'
import SelectedBadgeWannaSend from '@/components/client/SelectedBadgeWannaSend'

export interface TabBadgesProps {
    group: Group
    created: BadgeClass[]
    inviting: Invite[]
    lang: Dictionary
    isManager: boolean
    isIssuer: boolean
    isMember: boolean
    currProfile?: ProfileDetail
}

export default function Tabs({created, lang, isManager, inviting, isIssuer, group, isMember, currProfile}: TabBadgesProps) {
    const [tab, setTab] = useState<'created' | 'inviting'>('created')

    return <div className="py-4">
        <div className="flex-row-item-center justify-between">
            <div className="text-sm"><strong className="text-lg">
                {created.length === 100 ? '99+' : created.length}</strong> {lang['Badges']}</div>
            <div className="flex-row-item-center">
                {(isManager || isIssuer) &&
                    <SelectedBadgeWannaSend
                        group={group}
                        lang={lang}
                        profileDetail={currProfile}>
                        <div className={`${buttonVariants({variant: 'special', size: 'sm'})} cursor-pointer text-xs sm:text-sm sm:h-9`}>
                            <i className="uil-message text-base"/>
                            {lang['Send a badge']}
                        </div>
                    </SelectedBadgeWannaSend>
                }

                {isMember && !isIssuer && !isManager && false &&
                    <Button className={`text-xs sm:text-sm sm:h-9`} size={'sm'} onClick={() => {
                        alert('Request to be Issuer')
                    }}>
                    {lang['Request to be Issuer']}
                    </Button>
                }
            </div>
        </div>

        <div className="flex flex-row-item-center pt-4">
            <Button variant={tab === 'created' ? 'outline' : 'ghost'}
                size={'sm'}
                onClick={() => setTab('created')}>
                <span className="font-normal text-sm">{lang['Created']}</span>
            </Button>
            <Button variant={tab === 'inviting' ? 'outline' : 'ghost'}
                className={'font-normal'}
                size={'sm'}
                onClick={() => setTab('inviting')}>
                <span className="font-normal text-sm">{lang['Inviting']}</span>
            </Button>
        </div>

        {((tab === 'created' && !created.length) || tab === 'inviting' && !inviting.length) && <NoData/>}

        {tab === 'created' &&
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4">
                {
                    created.map((badgeClass, i) => {
                        const title = badgeClass.badge_type === 'private' && !isManager ? '🔒' : badgeClass.title
                        const cover = badgeClass.badge_type === 'private' && !isManager ? '/images/badge_private.png' : badgeClass.image_url

                        return <a key={i} href={`/badge-class/${badgeClass.id}`}
                            className="h-[182px] bg-white shadow rounded-2xl shadow-badge p-2 cursor-pointer duration-200 hover:translate-y-[-6px]">
                            <div
                                className="bg-gray-100 flex flex-row items-center justify-center h-[130px] rounded-2xl relative overflow-auto">
                                {badgeClass.display === 'top' && <div
                                    className="bg-[#ffdc62] rounded-br-lg px-3 py-1 font-semibold absolute left-0 top-0">Top
                                </div>
                                }
                                <Image width={90} height={90}
                                       src={cover!}
                                       alt=""
                                       className="-[90px] h-[90px] rounded-full" />
                            </div>
                            <div
                                className="font-semibold overflow-hidden overflow-ellipsis whitespace-nowrap text-center p-2">
                                {title}
                            </div>
                        </a>
                    })
                }
            </div>
        }

        {tab === 'inviting' &&
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4">
                {
                    inviting.map((invite, i) => {
                        return <div key={i}
                            className="h-[182px] bg-white shadow rounded-2xl shadow-badge p-2 cursor-pointer duration-200 hover:translate-y-[-6px]">
                            <div
                                className="bg-gray-100 flex flex-row items-center justify-center h-[130px] rounded-2xl relative overflow-auto">
                                <Image width={90} height={90}
                                       src={getAvatar(invite.group.id, invite.group.image_url)}
                                       alt=""
                                       className="-[90px] h-[90px] rounded-full" />
                            </div>
                            <div
                                className="capitalize font-semibold overflow-hidden overflow-ellipsis whitespace-nowrap text-center p-2">
                                {invite.role}
                            </div>
                        </div>
                    })
                }
            </div>
        }
    </div>
}
