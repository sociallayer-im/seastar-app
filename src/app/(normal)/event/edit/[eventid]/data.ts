import type {ReadonlyRequestCookies} from "next/dist/server/web/spec-extension/adapters/request-cookies"
import {AUTH_FIELD} from "@/utils"
import {getEventDetail, getProfileByToken} from "@/service/solar"
import {redirect} from "next/navigation"
import {CreateEventPageDataType, getGroupData} from "@/app/(normal)/event/[grouphandle]/create/data"

export interface EditEventPageDataProps {
    eventid: string
}


export interface EditEventDataProps {
    params: EditEventPageDataProps
    cookies: ReadonlyRequestCookies
}

export interface EditEventPageDataType extends CreateEventPageDataType {
    eventDetail: Solar.Event
}


export default async function EditEventPageData({params, cookies} : EditEventDataProps) {

    const authToken = cookies.get(AUTH_FIELD)?.value
    let currProfile: Solar.Profile | null = null
    if (!!authToken) {
        currProfile = await getProfileByToken(authToken)
    } else {
        redirect('/')
    }

    const eventDetail = await getEventDetail(parseInt(params.eventid))
    if (!eventDetail) {
        redirect('/404')
    }

    const {groups, memberships, userGroups, tracks, venues, badgeClasses} = await getGroupData(eventDetail.group.handle, currProfile?.handle)
    const group = groups[0]
    const isGroupOwner = memberships.find(m => m.profile.handle === currProfile?.handle)?.role === 'owner'
    const isGroupManager = isGroupOwner || memberships.find(m => m.profile.handle === currProfile?.handle)?.role === 'manager'
    const isGroupMember = isGroupOwner || isGroupManager || memberships.some(m => m.profile.handle === currProfile?.handle)
    const availableHost: Array<Solar.ProfileSample | Solar.GroupSample> = currProfile
        ? [currProfile, ...(userGroups || [])]
        : []

    const groupHost = eventDetail.event_roles?.find(r => r.role === 'group_host')

    return {
        currProfile,
        eventDetail,
        group,
        memberships,
        isGroupOwner,
        isGroupManager,
        isGroupMember,
        availableHost,
        tracks,
        venues,
        tags: group.event_tags || [],
        badgeClasses: badgeClasses || [],
        groupHost,
        owner: eventDetail.owner
    }
}
