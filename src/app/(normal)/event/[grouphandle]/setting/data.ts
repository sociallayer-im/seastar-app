import {redirect} from "next/navigation"
import {getGroupDetailByHandle} from '@sola/sdk'
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
    const groupDetail = await getGroupDetailByHandle({
        params: {groupHandle: props.params.grouphandle},
        clientMode: CLIENT_MODE
    })

    if (!groupDetail) {
        redirect('/404')
    }

    const currProfile = await getCurrProfile()

    if (!currProfile) {
        redirect(`/event/${groupDetail?.handle}`)
    }

    const {isManager} = analyzeGroupMembershipAndCheckProfilePermissions(
        groupDetail,
        currProfile
    )

    if (!isManager) {
        redirect(`/event/${groupDetail?.handle}`)
    }


    return {
        groupDetail: groupDetail,
        venues: groupDetail.venues,
        tracks: groupDetail.tracks,
        popupCities: groupDetail.popup_cities
    }
}