import {FollowerPageData, FollowerPageDataProps} from '@/app/(normal)/profile/[handle]/follower/data'
import {selectLang} from '@/app/actions'
import FollowerList from '@/app/(normal)/profile/[handle]/follower/FollowerList'

export default async function FollowerPage(props: FollowerPageDataProps) {
    const data = await FollowerPageData(props)
    const {lang} = await selectLang()

    return <FollowerList {...data} lang={lang} />
}