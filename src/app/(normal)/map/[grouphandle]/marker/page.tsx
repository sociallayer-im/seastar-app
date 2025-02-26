import GroupMarkerMapPageData, {GroupMarkerMapPageDataProps} from '@/app/(normal)/map/[grouphandle]/marker/data'
import GroupEventMapData from '@/app/(normal)/map/[grouphandle]/event/data'
import {selectLang} from '@/app/actions'
import MarkerMap from './Map'


export default async function GroupMarkerMap(props: GroupMarkerMapPageDataProps) {
    const {markers, currProfile, groupDetail, category} = await GroupMarkerMapPageData(props)
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