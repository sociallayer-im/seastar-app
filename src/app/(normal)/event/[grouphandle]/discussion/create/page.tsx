import {redirect} from 'next/navigation'
import {getGroupDetailByName, getCategories} from '@sola/sdk'
import {getCurrProfile, getServerSideAuth, selectLang} from '@/app/actions'
import {CLIENT_MODE, DISCUSSION} from '@/app/config'
import TopicCreateForm from './TopicCreateForm'

export default async function CreateTopicPage(props: {params: Promise<{grouphandle: string}>}) {
    const {lang} = await selectLang()
    const groupDetail = await getGroupDetailByName({
        params: {groupName: (await props.params).grouphandle},
        clientMode: CLIENT_MODE
    })
    if (!groupDetail || !DISCUSSION || !groupDetail.discussion_enabled) redirect('/404')

    const authToken = await getServerSideAuth()
    const currProfile = await getCurrProfile()
    if (!authToken || !currProfile) {
        redirect(`/signin?return=/event/${(await props.params).grouphandle}/discussion/create`)
    }

    // Only boards this person can see — posting to one they cannot see would
    // be refused anyway, and offering it would disclose that it exists.
    const categories = await getCategories({
        params: {groupId: groupDetail.id, authToken}, clientMode: CLIENT_MODE
    }).catch(() => [])

    return <div className="page-width min-h-[calc(100svh-48px)] py-6">
        <TopicCreateForm lang={lang} group={groupDetail} categories={categories.filter(c => !c.archived)}/>
    </div>
}
