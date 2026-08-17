'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Dictionary} from '@/lang'
import {
    Group, Membership, Team,
    addTeamMember, removeTeamMember, addManager, removeManager
} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {getAuth} from '@/utils'
import {getLabelColor} from '@/utils/label_color'
import {Button} from '@/components/shadcn/Button'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import Avatar from '@/components/Avatar'

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
export default function DialogEditMember({lang, group, membership, teams, canChangeRole, close}: {
    lang: Dictionary,
    group: Group,
    membership: Membership,
    teams: Team[],
    /** Owner-level rows are refused by the API; the toggle is hidden for them
     *  rather than offered and then rejected. */
    canChangeRole: boolean,
    close: () => void
}) {
    const router = useRouter()
    const {toast} = useToast()

    const [inTeams, setInTeams] = useState<string[]>(membership.teams?.map(t => t.id) ?? [])
    const [role, setRole] = useState(membership.role)
    const [busy, setBusy] = useState(false)

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

    return <div className="max-w-[420px] rounded-lg bg-background shadow p-4" style={{width: '90vw'}}>
        <div className="flex-row-item-center gap-2 mb-4">
            <Avatar profile={membership.user} size={32}/>
            <div className="font-semibold">{membership.user.nickname || membership.user.name}</div>
        </div>

        {canChangeRole &&
            <label className="flex-row-item-center justify-between py-2 border-b border-gray-100 cursor-pointer">
                <span className="text-sm">{lang['Manager']}</span>
                <input type="checkbox" checked={role === 'manager'} disabled={busy}
                    onChange={toggleManager}/>
            </label>
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

        <Button variant="secondary" className="w-full mt-4" onClick={close}>
            {lang['Close']}
        </Button>
    </div>
}
