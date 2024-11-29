'use client'

import {MemberShipSample} from "@/app/(normal)/group/[handle]/data"
import {Button} from "@/components/shadcn/Button"
import NoData from "@/components/NoData"
import {getAvatar} from "@/utils"
import type {Dictionary} from "@/lang"
import {Badge} from "@/components/shadcn/Badge"
import {useMemo, useState} from "react"
import {Input} from "@/components/shadcn/Input"

export interface TabMembersProps {
    members: MemberShipSample[]
    isManager: boolean
    isMember: boolean
    handle: string,
    lang: Dictionary,
    currUserHandle?: string
}

export default function TabMembers({members, isManager, isMember , currUserHandle, lang}: TabMembersProps) {
    const [searchKeyword, setSearchKeyword] = useState('')

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
            <div className="flex-1 flex-row-item-center sm:mr-4">
                <div className="text-sm mr-2">
                    <strong className="text-lg">{members.length}</strong> {lang['Members']}
                </div>
                <Input value={searchKeyword}
                    className="flex-1 !h-9 text-sm"
                    placeholder={lang['Search members...']}
                    startAdornment={<i className="uil-search"/>}
                    onChange={e => {
                        setSearchKeyword(e.target.value)
                    }}/>
            </div>

            <div className="flex-row-item-center w-full sm:w-auto justify-end">
                {isMember &&
                    <Button className={`text-xs sm:text-sm sm:h-9 mt-3 sm:mt-0`} variant={'warm'} size={'sm'} >
                        {lang['Leave Group']}
                    </Button>
                }

                {isManager &&
                    <Button variant={'secondary'} size={'sm'} className="ml-2 text-xs sm:text-sm sm:h-9 mt-3 sm:mt-0">
                        {lang['Management']}
                    </Button>
                }
            </div>
        </div>

        {memberList.length === 0 && <NoData />}

        <div className="grid grid-cols-1 gap-3 py-4">
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
                        {currUserHandle === member.profile.handle &&
                            <Badge variant={"upcoming"} className="ml-2 capitalize">You</Badge>
                        }
                    </a>
                })
            }
        </div>
    </div>
}
