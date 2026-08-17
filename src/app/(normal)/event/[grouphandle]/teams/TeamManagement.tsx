'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Dictionary} from '@/lang'
import {
    GroupDetail, Membership, Team,
    addTeamMember, createTeam, deleteTeam, getTeamMembers, removeTeamMember, updateTeam
} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {getAuth} from '@/utils'
import {getLabelColor} from '@/utils/label_color'
import {Button} from '@/components/shadcn/Button'
import {Input} from '@/components/shadcn/Input'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import Avatar from '@/components/Avatar'

/**
 * Creating teams and deciding who is in them.
 *
 * The roster is already on the page (group detail embeds it), so adding
 * someone is a picker over people who are here rather than a search that could
 * offer strangers — a team groups a group's members, and the API refuses
 * anyone else.
 */
export default function TeamManagement({lang, group, teams: initialTeams, members}: {
    lang: Dictionary,
    group: GroupDetail,
    teams: Team[],
    members: Membership[]
}) {
    const router = useRouter()
    const {toast} = useToast()
    const {showConfirmDialog} = useConfirmDialog()

    const [teams, setTeams] = useState(initialTeams)
    const [name, setName] = useState('')
    const [openTeam, setOpenTeam] = useState<string | null>(null)
    const [teamMembers, setTeamMembers] = useState<Record<string, string[]>>({})
    const [busy, setBusy] = useState(false)

    const authToken = () => getAuth()!

    const run = async (fn: () => Promise<unknown>, after?: () => void) => {
        setBusy(true)
        try {
            await fn()
            after?.()
        } catch (e: unknown) {
            toast({variant: 'destructive', title: e instanceof Error ? e.message : 'Failed'})
        } finally {
            setBusy(false)
        }
    }

    const add = () => {
        if (!name.trim()) return
        run(async () => {
            const team = await createTeam({
                params: {draft: {group_id: group.id, name: name.trim()}, authToken: authToken()},
                clientMode: CLIENT_MODE
            })
            setTeams([...teams, team])
            setName('')
        })
    }

    const rename = (team: Team, next: string) => {
        if (!next.trim() || next === team.name) return
        run(async () => {
            const updated = await updateTeam({
                params: {teamId: team.id, draft: {name: next.trim()}, authToken: authToken()},
                clientMode: CLIENT_MODE
            })
            setTeams(teams.map(t => t.id === team.id ? updated : t))
        })
    }

    // Spelled out rather than a bare "are you sure": the consequence people do
    // not expect is a team-restricted board quietly becoming manager-only.
    const remove = (team: Team) => showConfirmDialog({
        lang,
        title: team.name,
        content: lang['Delete this team?'],
        onConfig: () => run(
            () => deleteTeam({params: {teamId: team.id, authToken: authToken()}, clientMode: CLIENT_MODE}),
            () => setTeams(teams.filter(t => t.id !== team.id))
        )
    })

    const toggleOpen = async (team: Team) => {
        if (openTeam === team.id) { setOpenTeam(null); return }
        setOpenTeam(team.id)
        if (!teamMembers[team.id]) {
            const people = await getTeamMembers({
                params: {teamId: team.id, authToken: authToken()}, clientMode: CLIENT_MODE
            }).catch(() => [])
            setTeamMembers(prev => ({...prev, [team.id]: people.map(p => p.id)}))
        }
    }

    const toggleMember = (team: Team, userId: string) => {
        const current = teamMembers[team.id] || []
        const isIn = current.includes(userId)
        run(
            () => isIn
                ? removeTeamMember({params: {teamId: team.id, userId, authToken: authToken()}, clientMode: CLIENT_MODE})
                : addTeamMember({params: {teamId: team.id, userId, authToken: authToken()}, clientMode: CLIENT_MODE}),
            () => {
                setTeamMembers(prev => ({
                    ...prev,
                    [team.id]: isIn ? current.filter(id => id !== userId) : [...current, userId]
                }))
                setTeams(teams.map(t => t.id === team.id
                    ? {...t, members_count: t.members_count + (isIn ? -1 : 1)} : t))
                // The roster on the group page reads these badges from the
                // server, so it has to be told the answer changed.
                router.refresh()
            }
        )
    }

    return <div className="max-w-[720px] mx-auto">
        <div className="text-xl font-semibold mb-1">{lang['Teams']}</div>
        <div className="text-sm text-gray-500 mb-5">
            {lang['Team Members']} · {group.nickname || group.name}
        </div>

        <div className="flex-row-item-center gap-2 mb-6">
            <Input className="flex-1" value={name} placeholder={lang['Team Name']}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') add() }}/>
            <Button variant="special" disabled={busy || !name.trim()} onClick={add}>
                {lang['New Team']}
            </Button>
        </div>

        {!teams.length
            ? <div className="text-sm text-gray-400 py-12 text-center">{lang['No teams yet']}</div>
            : <div className="flex flex-col gap-3">
                {teams.map(team => {
                    const color = team.color || getLabelColor(team.name)
                    const inTeam = teamMembers[team.id] || []
                    return <div key={team.id} className="shadow rounded-lg p-4">
                        <div className="flex-row-item-center gap-2">
                            <span className="w-3 h-3 rounded-full shrink-0" style={{background: color}}/>
                            <input className="font-semibold flex-1 bg-transparent outline-none"
                                defaultValue={team.name}
                                onBlur={e => rename(team, e.target.value)}/>
                            <span className="text-xs text-gray-400">{team.members_count}</span>
                            <button className="text-sm text-blue-500" onClick={() => toggleOpen(team)}>
                                {openTeam === team.id ? lang['Cancel'] : lang['Add Member']}
                            </button>
                            <button className="text-sm text-red-500" onClick={() => remove(team)}>
                                {lang['Delete']}
                            </button>
                        </div>

                        {openTeam === team.id &&
                            <div className="mt-3 border-t border-gray-100 pt-3 max-h-[320px] overflow-y-auto">
                                {members.map(m =>
                                    <label key={m.user.id}
                                        className="flex-row-item-center gap-2 py-1.5 cursor-pointer">
                                        <input type="checkbox" checked={inTeam.includes(m.user.id)}
                                            disabled={busy}
                                            onChange={() => toggleMember(team, m.user.id)}/>
                                        <Avatar profile={m.user} size={20}/>
                                        <span className="text-sm">{m.user.nickname || m.user.name}</span>
                                    </label>
                                )}
                            </div>
                        }
                    </div>
                })}
            </div>
        }
    </div>
}
