import {redirect} from 'next/navigation'
import {getGroupDetailByName, getTeams} from '@sola/sdk'
import {getCurrProfile, getServerSideAuth, selectLang} from '@/app/actions'
import {CLIENT_MODE} from '@/app/config'
import TeamManagement from './TeamManagement'

export default async function TeamsPage(props: {params: {grouphandle: string}}) {
    const {lang} = await selectLang()
    const authToken = await getServerSideAuth()
    const currProfile = await getCurrProfile()
    if (!authToken || !currProfile) {
        redirect(`/signin?return=/event/${props.params.grouphandle}/teams`)
    }

    // With the token, and load-bearing: TeamManagement seeds every checkbox
    // from this roster, so without it the private teams would show as having
    // nobody in them.
    const groupDetail = await getGroupDetailByName({
        params: {groupName: props.params.grouphandle, authToken},
        clientMode: CLIENT_MODE
    })
    if (!groupDetail) redirect('/404')

    const membership = groupDetail.memberships.find(m => m.user.id === currProfile.id)
    const isManager = membership?.role === 'manager' || membership?.role === 'owner'
    // The API refuses anyway; this keeps a non-manager off a page whose every
    // control would 403.
    if (!isManager) redirect(`/group/${groupDetail.name}?tab=members`)

    const teams = await getTeams({
        params: {groupId: groupDetail.id, authToken}, clientMode: CLIENT_MODE
    }).catch(() => [])

    return <div className="page-width-md min-h-[calc(100svh-48px)] px-3 py-6">
        <TeamManagement lang={lang} group={groupDetail} teams={teams}
            members={groupDetail.memberships}/>
    </div>
}
