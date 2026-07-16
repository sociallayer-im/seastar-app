import {redirect} from "next/navigation"
import {getGroupDetailByName, PopupCity} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {analyzeGroupMembershipAndCheckProfilePermissions} from '@/utils'
import {getCurrProfile} from '@/app/actions'

export interface GroupEventSettingDataParams {
    grouphandle: string
}

export interface GroupEventSettingDataProps {
    params: GroupEventSettingDataParams
}

export default async function GroupEventSettingData(props: GroupEventSettingDataProps) {
    const groupDetail = await getGroupDetailByName({
        params: {groupName: props.params.grouphandle},
        clientMode: CLIENT_MODE
    })

    if (!groupDetail) {
        redirect('/404')
    }

    const currProfile = await getCurrProfile()

    const {isManager} = analyzeGroupMembershipAndCheckProfilePermissions(
        groupDetail,
        currProfile
    )

    return {
        groupDetail: groupDetail,
        currProfile,
        venues: groupDetail.venues,
        tracks: groupDetail.tracks,
        popupCities: groupDetail.start_date ? [{
            id: groupDetail.id,
            title: groupDetail.nickname || groupDetail.name,
            name: groupDetail.name,
            image_url: groupDetail.image_url,
            banner_image_url: groupDetail.banner_image_url,
            location: groupDetail.location,
            start_date: groupDetail.start_date,
            end_date: groupDetail.end_date,
            group_tags: groupDetail.group_tags,
            group_id: groupDetail.id,
            group: {id: groupDetail.id, name: groupDetail.name, nickname: groupDetail.nickname, image_url: groupDetail.image_url}
        } as PopupCity] : [],
        isManager
    }
}