import {getMarkerById} from '@sola/sdk'
import {redirect} from 'next/navigation'
import {getCurrProfile} from '@/app/actions'
import {MarkerDetailPageDataProps} from '@/app/(normal)/marker/detail/[markerid]/data'
import {CLIENT_MODE} from '@/app/config'

export default async function MarkerEditData({params}: MarkerDetailPageDataProps) {
    const {markerid} = params

    const markerDetail = await getMarkerById({
        params: {markerId: parseInt(markerid)},
        clientMode: CLIENT_MODE
    })
    const currProfile = await getCurrProfile()

    if (!markerDetail) {
        redirect('/404')
    }

    if (!currProfile) {
        redirect('/marker/detail/' + markerid)
    }


    const currProfileIsCreator = markerDetail?.owner.id === currProfile?.id
    if (!currProfileIsCreator) {
        redirect('/marker/detail/' + markerid)
    }

    return {
        markerDetail,
        currProfile,
        group: markerDetail.group,
    }
}