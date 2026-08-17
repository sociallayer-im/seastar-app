import {selectLang} from '@/app/actions'
import TopicDetailData from './data'
import TopicDetail from './TopicDetail'

export async function generateMetadata(props: {params: {grouphandle: string, topicid: string}}) {
    const {topic} = await TopicDetailData({
        grouphandle: props.params.grouphandle,
        topicId: props.params.topicid
    })
    return {title: topic.title}
}

export default async function TopicPage(props: {params: {grouphandle: string, topicid: string}}) {
    const {lang} = await selectLang()
    const data = await TopicDetailData({
        grouphandle: props.params.grouphandle,
        topicId: props.params.topicid
    })

    return <div className="page-width min-h-[calc(100svh-48px)] py-6">
        <TopicDetail lang={lang} {...data}/>
    </div>
}
