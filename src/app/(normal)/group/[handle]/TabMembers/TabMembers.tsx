'use client'

import {Button} from "@/components/shadcn/Button"
import NoData from "@/components/NoData"
import {cfImage, getAvatar} from "@/utils"
import type {Dictionary} from "@/lang"
import {Badge} from "@/components/shadcn/Badge"
import {useMemo, useState} from "react"
import {Input} from "@/components/shadcn/Input"
import DropdownMenu from "@/components/client/DropdownMenu"
import {Group, Membership, Profile, Team, TeamRef} from '@sola/sdk'
import useModal from '@/components/client/Modal/useModal'
import DialogEditMember from '@/app/(normal)/group/[handle]/TabMembers/DialogEditMember'
import {getLabelColor} from '@/utils/label_color'
import LeaveGroupBtn from '@/app/(normal)/group/[handle]/TabMembers/LeaveGroupBtn'

export interface TabMembersProps {
    members: Membership[]
    isManager: boolean
    isMember: boolean
    isOwner:boolean
    // Parent-group admin/owner viewing a child group: no membership here, but
    // can still toggle a child member's role to/from "manager" — see
    // GroupPolicy#can_assign_manager?. Grants nothing else.
    isParentManager?: boolean
    /** Every team in the group, for the edit dialog's checklist. Only fetched
     *  for managers — nobody else can act on it. */
    teams?: Team[]
    group: Group,
    lang: Dictionary,
    currProfile?: Profile | null
}



export default function TabMembers({members, isManager, isMember, currProfile, isOwner, isParentManager, teams: allTeams, lang, group}: TabMembersProps) {
    const {openModal} = useModal()
    const [searchKeyword, setSearchKeyword] = useState('')
    const [teamId, setTeamId] = useState<string | null>(null)

    // A manager gets the group's real team list, so a team nobody is in yet is
    // still visible (and visibly empty) rather than silently missing. Everyone
    // else gets what the roster shows them, which is already filtered to the
    // teams they may see.
    const teams = useMemo(() => {
        if (allTeams?.length) {
            return [...allTeams]
                .filter(t => !t.archived)
                .sort((a, b) => b.sort - a.sort || (a.id < b.id ? -1 : 1))
        }
        const seen = new Map<string, TeamRef>()
        members.forEach(m => m.teams?.forEach(t => seen.set(t.id, t)))
        // Server order, then id — both identical in Node and in the browser.
        // localeCompare is not: it sorts these names one way on the server and
        // another in a zh-CN browser, and the differing markup is a hydration
        // error that throws away the subtree.
        return [...seen.values()].sort((a, b) => b.sort - a.sort || (a.id < b.id ? -1 : 1))
    }, [members, allTeams])

    // Member and manager management used to be two separate screens reached
    // from here. Both are now the per-row dialog, which does the same work
    // without leaving the roster you are looking at.
    const ManagementOptions = isOwner
        ? [{label: lang['Transfer Owner'], url: `/group/${group.name}/management/transfer-owner`}]
        : []

    const showManagement = ManagementOptions.length > 0

    // Who may do what to a given row. Kept here rather than inside the dialog
    // because the rules differ per action and per viewer, and splitting that
    // reasoning across two files is how the two drift apart.
    //
    //  - promote: an owner, a manager, or a parent group's manager
    //  - demote:  an owner only (2026-08-18), wherever you stand
    //  - teams:   needs GroupPolicy#manage?, which a parent manager lacks
    //  - remove:  an owner for a manager's row, a manager for a member's;
    //             an owner's row is nobody's to remove
    const capabilities = (member: Membership) => {
        const isSelf = currProfile?.id === member.user.id
        const targetsOwner = member.role === 'owner'
        return {
            canPromote: !targetsOwner && member.role === 'member'
                && (isManager || !!isParentManager),
            canDemote: !targetsOwner && member.role === 'manager' && !!isOwner,
            canEditTeams: isManager,
            canRemove: !targetsOwner && !isSelf
                && (member.role === 'manager' ? !!isOwner : isManager),
            canSetNotification: canSetNotification(member)
        }
    }

    // The event-submission email only goes to owners and managers, so only
    // their rows carry the switch — the backend rejects it on a plain member.
    // You can always set your own; setting someone else's needs manage rights,
    // which is what lets an owner mute a manager who asked to be muted.
    const canSetNotification = (member: Membership) =>
        (member.role === 'owner' || member.role === 'manager') &&
        (currProfile?.id === member.user.id || isManager)

    // Name and team narrow together rather than replacing each other — the
    // question "who in the volunteers is called Wei" has to be askable.
    const memberList = useMemo(() => {
        const keyword = searchKeyword.toLowerCase().trim()
        return members.filter(m => {
            const matchesName = !keyword
                || m.user.nickname?.toLowerCase().includes(keyword)
                || m.user.name?.toLowerCase().includes(keyword)
            const matchesTeam = !teamId || m.teams?.some(t => t.id === teamId)
            return matchesName && matchesTeam
        })
    }, [members, searchKeyword, teamId])

    return <div className="py-4">
        <div className="flex sm:flex-row flex-col items-center sm:justify-between justify-end">
            <div className="w-full sm:flex-1 flex-row-item-center sm:mr-4 ">
                <div className="text-xs mr-2">
                    <strong className="text-sm">{members.length}</strong> {lang['Members']}
                </div>
                <Input value={searchKeyword}
                    className="flex-1 h-9! text-sm sm:max-w-[200px]"
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

        {teams.length > 0 &&
            <div className="flex-row-item-center gap-2 flex-wrap mt-3">
                <TeamChip active={teamId === null} onClick={() => setTeamId(null)}>
                    {lang['All']}
                </TeamChip>
                {teams.map(team =>
                    <TeamChip key={team.id} active={teamId === team.id}
                        color={team.color || getLabelColor(team.name)}
                        onClick={() => setTeamId(teamId === team.id ? null : team.id)}>
                        {team.name}
                    </TeamChip>
                )}
            </div>
        }

        {memberList.length === 0 && <NoData />}

        <div className="grid grid-cols-1 gap-3 py-4">
            {isManager &&
                <a
                    className="flex-row-item-center shadow-sm rounded-lg px-6 py-4 duration-300 hover:scale-105"
                    href={`/group/${group.name}/management/invite`}>
                    <i className="uil-plus-circle mr-2 text-2xl"/>
                    <div>{lang['Invite Member']}</div>
                </a>
            }
            {
                memberList.map((member, i) => {
                    // flex-wrap, not the usual flex-row-item-center: that class
                    // is `row nowrap`, and a member in two or three teams has
                    // more badges than a phone has width — the name was being
                    // squashed to nothing. gap replaces the per-badge ml-2 so a
                    // wrapped second line does not start with a stray margin.
                    return <a key={i}
                              className="flex flex-wrap items-center gap-x-2 gap-y-1 shadow-sm rounded-lg px-4 sm:px-6 py-4 duration-300 hover:scale-105"
                              href={`/profile/${member.user.name}`}>
                    <div className="relative shrink-0">
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
                        {/* min-w-0 + break-all so a long handle wraps inside
                            its own box instead of pushing the badges off the
                            row. */}
                        <div className="min-w-0 break-all">{member.user.nickname || member.user.name}</div>
                        {member.role !== 'member' &&
                            <Badge variant={"past"} className="capitalize shrink-0">{member.role}</Badge>
                        }
                        {currProfile?.name === member.user.name &&
                            <Badge variant={"upcoming"} className="capitalize shrink-0">You</Badge>
                        }
                        {/* Which teams this person is in. The colour is the
                            team's own when set, else derived from its name by
                            the same function that colours tags and tracks. */}
                        {member.teams?.map(team =>
                            <span key={team.id}
                                className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 max-w-full overflow-hidden text-ellipsis"
                                style={{
                                    background: `${team.color || getLabelColor(team.name)}22`,
                                    color: team.color || getLabelColor(team.name)
                                }}>
                                {team.name}
                            </span>
                        )}
                        {/* The row is a link to the profile, so this has to
                            stop the click reaching it. Managers only — every
                            control inside would 403 for anyone else.
                            ml-auto pushes it to the far right; it is the only
                            thing on the row that claims the free space now
                            that the notification switch has moved inside. */}
                        {(isManager || isParentManager) &&
                            <button className="ml-auto shrink-0 text-gray-400 hover:text-gray-700"
                                aria-label={lang['Edit']}
                                onClick={e => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    openModal({
                                        content: close => <DialogEditMember
                                            lang={lang} group={group} membership={member}
                                            teams={allTeams || []}
                                            {...capabilities(member)}
                                            close={close!}/>
                                    })
                                }}>
                                <i className="uil-setting text-lg"/>
                            </button>
                        }
                    </a>
                })
            }
        </div>
    </div>
}

function TeamChip({active, color, onClick, children}: {
    active: boolean,
    color?: string,
    onClick: () => void,
    children: React.ReactNode
}) {
    return <button onClick={onClick}
        className={`shrink-0 text-xs rounded-full px-3 py-1 border duration-200 ${
            active ? 'text-white' : 'border-gray-200 hover:border-gray-400'}`}
        style={active ? {background: color || '#111827', borderColor: color || '#111827'} : undefined}>
        {children}
    </button>
}
