'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Dictionary} from '@/lang'
import {
    Group, Membership, Team,
    addTeamMember, removeTeamMember, addManager, removeManager, removeMember
} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {getAuth} from '@/utils'
import {getLabelColor} from '@/utils/label_color'
import {Button} from '@/components/shadcn/Button'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import Avatar from '@/components/Avatar'
import AdminNotificationToggle from '@/app/(normal)/group/[handle]/TabMembers/AdminNotificationToggle'
import useConfirmDialog from '@/hooks/useConfirmDialog'

/**
 * Editing one person: which teams they are in, and whether they are a manager.
 *
 * The teams page is the other way round — open a team, tick the people. Both
 * exist because they answer different questions: that one is "who is on the
 * volunteer rota", this one is "we just promoted Wei, set them up". Neither is
 * a substitute for the other at any size.
 *
 * Each toggle is its own request rather than a save button, so a half-finished
 * edit leaves no ambiguity about what was stored. Failures roll the switch
 * back and say so.
 */
export default function DialogEditMember({lang, group, membership, teams, canPromote, canDemote, canEditTeams, canRemove, canSetNotification, close}: {
    lang: Dictionary,
    group: Group,
    membership: Membership,
    teams: Team[],
    /* The four capabilities, decided by the caller rather than re-derived
     * here from roles: the rules differ per action (a manager may promote but
     * not demote, a parent-group manager may do both but may not touch teams),
     * and spreading that reasoning across two files is how the two drift. */
    canPromote: boolean,
    canDemote: boolean,
    canEditTeams: boolean,
    canRemove: boolean,
    canSetNotification: boolean,
    close: () => void
}) {
    const router = useRouter()
    const {toast} = useToast()

    const [inTeams, setInTeams] = useState<string[]>(membership.teams?.map(t => t.id) ?? [])
    const [role, setRole] = useState(membership.role)
    const [busy, setBusy] = useState(false)

    const showRoleSwitch = canPromote || canDemote
    const roleSwitchEnabled = role === 'manager' ? canDemote : canPromote

    const run = async (fn: () => Promise<unknown>, after: () => void, revert: () => void) => {
        setBusy(true)
        try {
            await fn()
            after()
            // The roster behind this dialog is server-rendered, so it has to be
            // told the answer changed.
            router.refresh()
        } catch (e: unknown) {
            revert()
            toast({variant: 'destructive', title: e instanceof Error ? e.message : 'Failed'})
        } finally {
            setBusy(false)
        }
    }

    const toggleTeam = (team: Team) => {
        const authToken = getAuth()!
        const isIn = inTeams.includes(team.id)
        const next = isIn ? inTeams.filter(id => id !== team.id) : [...inTeams, team.id]
        setInTeams(next)
        run(
            () => (isIn ? removeTeamMember : addTeamMember)({
                params: {teamId: team.id, userId: membership.user.id, authToken},
                clientMode: CLIENT_MODE
            }),
            () => {},
            () => setInTeams(inTeams)
        )
    }

    const {showConfirmDialog} = useConfirmDialog()

    const remove = () => showConfirmDialog({
        lang,
        title: membership.user.nickname || membership.user.name || '',
        content: lang['Remove this person from the group?'],
        onConfig: () => run(
            () => removeMember({
                params: {profileId: membership.user.id, groupId: group.id, authToken: getAuth()!},
                clientMode: CLIENT_MODE
            }),
            close,
            () => {}
        )
    })

    const toggleManager = () => {
        const authToken = getAuth()!
        const next = role === 'manager' ? 'member' : 'manager'
        const previous = role
        setRole(next)
        run(
            () => (next === 'manager' ? addManager : removeManager)({
                params: {profileId: membership.user.id, groupId: group.id, authToken},
                clientMode: CLIENT_MODE
            }),
            () => {},
            () => setRole(previous)
        )
    }

    return <div className="max-w-[420px] rounded-lg bg-background shadow-sm p-4" style={{width: '90vw'}}>
        <div className="flex-row-item-center gap-2 mb-4">
            <Avatar profile={membership.user} size={32}/>
            <div className="font-semibold">{membership.user.nickname || membership.user.name}</div>
        </div>

        {/* Owners move this either way. A manager may only promote: peers
            being able to strip each other's role is how one manager removes
            the others, and the API refuses it — so the switch is shown
            disabled rather than absent, which would read as "this person
            cannot be a manager" instead of "not yours to undo". Owner rows and
            your own row are never editable here. */}
        {showRoleSwitch &&
            <label className={`flex-row-item-center justify-between py-2 border-b border-gray-100 ${
                roleSwitchEnabled ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                <span className="text-sm">
                    {lang['Manager']}
                    {!roleSwitchEnabled && role === 'manager' &&
                        <span className="text-xs text-gray-400 ml-2">{lang['Owner only']}</span>}
                </span>
                <input type="checkbox" checked={role === 'manager'}
                    disabled={busy || !roleSwitchEnabled}
                    onChange={toggleManager}/>
            </label>
        }

        {/* Moved off the roster row: it is a per-person setting like the
            others here, and on the row it was a switch with no label sitting
            between a name and a badge. */}
        {canSetNotification &&
            <div className="flex-row-item-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm pr-3">{lang['Email me when a member submits an event']}</span>
                <AdminNotificationToggle lang={lang} groupId={group.id} membership={membership}/>
            </div>
        }

        <div className="text-sm text-gray-500 mt-4 mb-1">{lang['Teams']}</div>
        {!teams.length
            ? <div className="text-sm text-gray-400 py-4">{lang['No teams yet']}</div>
            : <div className="max-h-[280px] overflow-y-auto">
                {teams.map(team => {
                    const color = team.color || getLabelColor(team.name)
                    return <label key={team.id}
                        className="flex-row-item-center justify-between py-2 cursor-pointer">
                        <span className="flex-row-item-center gap-2 text-sm">
                            <span className="w-2.5 h-2.5 rounded-full" style={{background: color}}/>
                            {team.name}
                            {!team.is_public && <i className="uil-lock text-xs text-gray-400"/>}
                        </span>
                        <input type="checkbox" checked={inTeams.includes(team.id)} disabled={busy}
                            onChange={() => toggleTeam(team)}/>
                    </label>
                })}
            </div>
        }

        <div className="flex-row-item-center gap-2 mt-4">
            <Button variant="secondary" className="flex-1" onClick={close}>
                {lang['Close']}
            </Button>
            {canRemove &&
                <Button variant="destructive" className="flex-1" disabled={busy} onClick={remove}>
                    {lang['Remove']}
                </Button>
            }
        </div>
    </div>
}
