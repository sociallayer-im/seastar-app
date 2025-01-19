'use client'

import {Button} from "@/components/shadcn/Button"
import NoData from "@/components/NoData"
import {getAvatar} from "@/utils"
import type {Dictionary} from "@/lang"
import {Badge} from "@/components/shadcn/Badge"
import {useMemo, useState} from "react"
import {Input} from "@/components/shadcn/Input"
import DropdownMenu from "@/components/client/DropdownMenu"
import {Group, Membership, Profile} from '@sola/sdk'
import LeaveGroupBtn from '@/app/(normal)/group/[handle]/TabMembers/LeaveGroupBtn'

export interface TabMembersProps {
    members: Membership[]
    isManager: boolean
    isMember: boolean
    isOwner:boolean
    group: Group,
    lang: Dictionary,
    currProfile?: Profile | null
}



export default function TabMembers({members, isManager, isMember, currProfile, isOwner, lang, group}: TabMembersProps) {
    const [searchKeyword, setSearchKeyword] = useState('')

    let ManagementOptions = [
        {label: lang['Member Management'], url: `/group/${group.handle}/management/member`},
    ]

    if (isOwner) {
        ManagementOptions = [
            ...ManagementOptions,
            {label: lang['Manager Management'], url: `/group/${group.handle}/management/manager`},
            {label: lang['Transfer Owner'], url: `/group/${group.handle}/management/transfer-owner`}
        ]
    }

    const memberList = useMemo(() => {
        const keyword = searchKeyword.toLowerCase().trim()
        if (!searchKeyword) return members
        return members.filter(m => {
            return m.profile.nickname?.toLowerCase().includes(keyword) ||
                m.profile.handle.toLowerCase().includes(keyword)
        })
    }, [members, searchKeyword])

    return <div className="py-4">
        <div className="flex sm:flex-row flex-col items-center sm:justify-between justify-end">
            <div className="w-full sm:flex-1 flex-row-item-center sm:mr-4 ">
                <div className="text-xs mr-2">
                    <strong className="text-sm">{members.length}</strong> {lang['Members']}
                </div>
                <Input value={searchKeyword}
                    className="flex-1 !h-9 text-sm sm:max-w-[200px]"
                    placeholder={lang['Search members...']}
                    startAdornment={<i className="uil-search"/>}
                    onChange={e => {
                        setSearchKeyword(e.target.value)
                    }}/>
            </div>

            <div className="flex-row-item-center sm:w-auto w-full justify-end">
                {isMember && !isOwner &&
                    <LeaveGroupBtn
                        lang={lang}
                        group={group}
                        profile={currProfile!}
                    />
                }

                <div className="ml-2 mt-3 sm:mt-0">
                    {isManager &&
                        <DropdownMenu
                            options={ManagementOptions}
                            valueKey={'url'}
                            renderOption={option => option.label}
                            onSelect={opt => {location.href = opt[0].url}}
                        >
                            <Button variant={'secondary'} size={'sm'} className="w-full text-xs sm:text-sm sm:h-9">
                                {lang['Management']}
                            </Button>
                        </DropdownMenu>
                    }
                </div>
            </div>
        </div>

        {memberList.length === 0 && <NoData />}

        <div className="grid grid-cols-1 gap-3 py-4">
            <a
               className="flex-row-item-center shadow rounded-lg px-6 py-4 duration-300 hover:scale-105"
               href={`/group/${group.handle}/management/invite`}>
                <i className="uil-plus-circle mr-2 text-2xl" />
                <div>{lang['Invite Member']}</div>
            </a>
            {
                memberList.map((member, i) => {
                    return <a key={i}
                              className="flex-row-item-center shadow rounded-lg px-6 py-4 duration-300 hover:scale-105"
                              href={`/profile/${member.profile.handle}`}>
                        <div className="relative mr-2">
                            <img
                                className="w-7 h-7 rounded-full"
                                src={getAvatar(member.profile.id, member.profile.image_url)} alt=""/>
                            {
                                member.role === 'owner' &&
                                <img src="/images/icon_owner.png"
                                     className="w-5 h-5 rounded-full absolute right-0 bottom-0 mr-[-4px] mb-[-4px]"
                                     alt=""/>
                            }
                        </div>
                        <div>{member.profile.nickname || member.profile.handle}</div>
                        {member.role !== 'member' &&
                            <Badge variant={"past"} className="ml-2 capitalize">{member.role}</Badge>
                        }
                        {currProfile?.handle === member.profile.handle &&
                            <Badge variant={"upcoming"} className="ml-2 capitalize">You</Badge>
                        }
                    </a>
                })
            }
        </div>
    </div>
}
