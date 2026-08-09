'use client'

import {Button} from "@/components/shadcn/Button"
import NoData from "@/components/NoData"
import {cfImage, getAvatar} from "@/utils"
import type {Dictionary} from "@/lang"
import {Badge} from "@/components/shadcn/Badge"
import {useMemo, useState} from "react"
import {Input} from "@/components/shadcn/Input"
import DropdownMenu from "@/components/client/DropdownMenu"
import {Group, Membership, Profile} from '@sola/sdk'
import LeaveGroupBtn from '@/app/(normal)/group/[handle]/TabMembers/LeaveGroupBtn'
import AdminNotificationToggle from '@/app/(normal)/group/[handle]/TabMembers/AdminNotificationToggle'

export interface TabMembersProps {
    members: Membership[]
    isManager: boolean
    isMember: boolean
    isOwner:boolean
    // Parent-group admin/owner viewing a child group: no membership here, but
    // can still toggle a child member's role to/from "manager" — see
    // GroupPolicy#can_assign_manager?. Grants nothing else.
    isParentManager?: boolean
    group: Group,
    lang: Dictionary,
    currProfile?: Profile | null
}



export default function TabMembers({members, isManager, isMember, currProfile, isOwner, isParentManager, lang, group}: TabMembersProps) {
    const [searchKeyword, setSearchKeyword] = useState('')

    let ManagementOptions = isManager
        ? [{label: lang['Member Management'], url: `/group/${group.name}/management/member`}]
        : []

    if (isOwner) {
        ManagementOptions = [
            ...ManagementOptions,
            {label: lang['Manager Management'], url: `/group/${group.name}/management/manager`},
            {label: lang['Transfer Owner'], url: `/group/${group.name}/management/transfer-owner`}
        ]
    } else if (isParentManager) {
        // Scoped down: only the manager-role toggle is authorized for a
        // parent manager, so that's the only option offered here.
        ManagementOptions = [
            ...ManagementOptions,
            {label: lang['Manager Management'], url: `/group/${group.name}/management/manager`}
        ]
    }

    const showManagement = isManager || isParentManager

    // The event-submission email only goes to owners and managers, so only
    // their rows carry the switch — the backend rejects it on a plain member.
    // You can always set your own; setting someone else's needs manage rights,
    // which is what lets an owner mute a manager who asked to be muted.
    const canSetNotification = (member: Membership) =>
        (member.role === 'owner' || member.role === 'manager') &&
        (currProfile?.id === member.user.id || isManager)

    const memberList = useMemo(() => {
        const keyword = searchKeyword.toLowerCase().trim()
        if (!searchKeyword) return members
        return members.filter(m => {
            return m.user.nickname?.toLowerCase().includes(keyword) ||
                m.user.name?.toLowerCase().includes(keyword)
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
                    {showManagement &&
                        <DropdownMenu
                            align={'right'}
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
            {isManager &&
                <a
                    className="flex-row-item-center shadow rounded-lg px-6 py-4 duration-300 hover:scale-105"
                    href={`/group/${group.name}/management/invite`}>
                    <i className="uil-plus-circle mr-2 text-2xl"/>
                    <div>{lang['Invite Member']}</div>
                </a>
            }
            {
                memberList.map((member, i) => {
                    return <a key={i}
                              className="flex-row-item-center shadow rounded-lg px-6 py-4 duration-300 hover:scale-105"
                              href={`/profile/${member.user.name}`}>
                    <div className="relative mr-2">
                            <img
                                className="w-7 h-7 rounded-full"
                                src={cfImage(getAvatar(member.user.id, member.user.image_url), { width: 48, height: 48, fit: 'cover' })} alt=""/>
                            {
                                member.role === 'owner' &&
                                <img src="/images/icon_owner.png"
                                     className="w-5 h-5 rounded-full absolute right-0 bottom-0 mr-[-4px] mb-[-4px]"
                                     alt=""/>
                            }
                        </div>
                        <div>{member.user.nickname || member.user.name}</div>
                        {member.role !== 'member' &&
                            <Badge variant={"past"} className="ml-2 capitalize">{member.role}</Badge>
                        }
                        {currProfile?.name === member.user.name &&
                            <Badge variant={"upcoming"} className="ml-2 capitalize">You</Badge>
                        }
                        {canSetNotification(member) &&
                            <AdminNotificationToggle
                                lang={lang}
                                groupId={group.id}
                                membership={member}/>
                        }
                    </a>
                })
            }
        </div>
    </div>
}
