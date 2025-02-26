import {getCouponByEventId, getEventDetailById, getGroupDetailById} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {redirect} from 'next/navigation'
import {getCurrProfile} from '@/app/actions'
import {analyzeGroupMembershipAndCheckProfilePermissions} from '@/utils'

export interface PromoCodePageParams {
    eventid: string;
}

export interface PromoCodePageProps {
    params: PromoCodePageParams;
}

export default async function PromoCodePageData({params}: PromoCodePageProps) {
    const {eventid} = params

    console.log('eventDetail.group_id', eventid)

    const eventDetail = await getEventDetailById({
        params: {eventId: parseInt(eventid)},
        clientMode: CLIENT_MODE
    })

    if (!eventDetail) {
       redirect('/404')
    }

    const groupDetail = await getGroupDetailById({
        params: {groupId: eventDetail.group_id!},
        clientMode: CLIENT_MODE
    })

    if (!groupDetail) {
        redirect(`/event/detail/${eventDetail.id}`)
    }

    const currProfile = await getCurrProfile()
    if (!currProfile) {
        redirect(`/event/detail/${eventDetail.id}`)
    }

    const {
        isManager: isGroupManager,
    } = analyzeGroupMembershipAndCheckProfilePermissions(groupDetail, currProfile)

    const isEventCreator = eventDetail.owner.id === currProfile?.id

    const isEventOperator = !!currProfile
        && (isGroupManager
            || isEventCreator
            || eventDetail.event_roles?.some(role => role.role === 'co_host' && role.item_id === currProfile.id)
            || eventDetail.event_roles?.some(role => role.role === 'speaker' && role.item_id === currProfile.id)
        )

    if (!isEventOperator) {
        redirect(`/event/detail/${eventDetail.id}`)
    }

    const coupons = await getCouponByEventId({
        params: {eventId: parseInt(eventid)},
        clientMode: CLIENT_MODE
    })

    return {
        groupDetail,
        currProfile,
        eventDetail,
        coupons
    }
}