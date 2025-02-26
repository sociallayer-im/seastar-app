import {getMarkerById} from '@sola/sdk'
import {redirect} from 'next/navigation'
import {getCurrProfile} from '@/app/actions'
import {CLIENT_MODE} from '@/app/config'

export interface MarkerDetailPageParams {
    markerid: string
}

export interface MarkerDetailPageDataProps {
    params: MarkerDetailPageParams
}

export default async function MarkerDetailData({params} : MarkerDetailPageDataProps) {
    const {markerid} = params

    const markerDetail = await getMarkerById({
        params: {markerId: parseInt(markerid)},
        clientMode: CLIENT_MODE
    })
    const currProfile = await getCurrProfile()

    const currProfileIsCreator = markerDetail?.owner.id === currProfile?.id

    if (!markerDetail) {
        redirect('/404')
    }

    return {
        markerDetail,
        currProfile,
        currProfileIsCreator
    }
}