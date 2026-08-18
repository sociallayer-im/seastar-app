import {awaitProps, AsyncProps} from '@/utils'
import GroupMarkerMapPageData, {GroupMarkerMapPageDataProps} from '@/app/(normal)/map/[grouphandle]/marker/data'
import GroupEventMapData from '@/app/(normal)/map/[grouphandle]/event/data'
import {selectLang} from '@/app/actions'
import MarkerMap from './Map'


export default async function GroupMarkerMap(props: AsyncProps<GroupMarkerMapPageDataProps>) {
    const {markers, currProfile, groupDetail, category} = await GroupMarkerMapPageData(await awaitProps(props))
    const {lang, type} = await selectLang()

    return <MarkerMap
        langType={type}
        lang={lang}
        markers={markers}
        currProfile={currProfile}
        groupDetail={groupDetail}
        currCategory={category}
    />
}