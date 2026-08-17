import {redirect} from 'next/navigation'
import {getGroupDetailByName, getTopic, getReplies} from '@sola/sdk'
import {getCurrProfile, getServerSideAuth} from '@/app/actions'
import {CLIENT_MODE, DISCUSSION} from '@/app/config'

export default async function TopicDetailData({grouphandle, topicId}: {
    grouphandle: string,
    topicId: string
}) {
    const groupDetail = await getGroupDetailByName({
        params: {groupName: grouphandle},
        clientMode: CLIENT_MODE
    })
    // Both switches off means the whole surface is absent, not forbidden — so
    // a link to a topic behaves exactly like a link to nothing.
    if (!groupDetail || !DISCUSSION || !groupDetail.discussion_enabled) {
        redirect('/404')
    }

    const authToken = await getServerSideAuth()
    const currProfile = await getCurrProfile()

    // soon answers 404 for a topic this viewer may not see — a hidden topic, a
    // deleted one, or one on a board they are not in. All three land here.
    const topic = await getTopic({
        params: {topicId, authToken}, clientMode: CLIENT_MODE
    }).catch(() => null)
    if (!topic) redirect('/404')

    const replies = await getReplies({
        params: {topicId, limit: 100, authToken}, clientMode: CLIENT_MODE
    }).catch(() => null)

    return {groupDetail, topic, replies: replies?.data ?? [], currProfile}
}
