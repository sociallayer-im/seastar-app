import type {ReadonlyRequestCookies} from "next/dist/server/web/spec-extension/adapters/request-cookies"
import {AUTH_FIELD, pickSearchParam} from "@/utils"
import {getProfileByToken} from "@/service/solar"
import {redirect} from "next/navigation"
import {gql, request} from 'graphql-request'
import {getGroupData} from "@/app/(normal)/event/[grouphandle]/create/data"

export interface EventDetailPageDataProps {
    eventid: string
}

export interface EventDetailPageSearchParams {
    tab?: 'content' | 'tickets' | 'comments' | 'participants' | string[]
}


export interface EventDetailDataProps {
    params: EventDetailPageDataProps
    cookies: ReadonlyRequestCookies,
    searchParams: EventDetailPageSearchParams
}

export default async function EventDetailPage({params, cookies, searchParams}: EventDetailDataProps) {
    const authToken = cookies.get(AUTH_FIELD)?.value
    let currProfile: Solar.Profile | null = null
    if (!!authToken) {
        currProfile = await getProfileByToken(authToken)
    } else {
        redirect('/')
    }

    const eventDetail = await getEventDetailData(parseInt(params.eventid))
    if (!eventDetail) {
        redirect('/404')
    }

    const {groups, memberships, userGroups, tracks, venues} = await getGroupData(eventDetail.group.handle, currProfile?.handle)
    const group = groups[0]
    const isGroupOwner = memberships.find(m => m.profile.handle === currProfile?.handle)?.role === 'owner'
    const isGroupManager = isGroupOwner || memberships.find(m => m.profile.handle === currProfile?.handle)?.role === 'manager'
    const isGroupMember = isGroupOwner || isGroupManager || memberships.some(m => m.profile.handle === currProfile?.handle)
    const availableHost: Array<Solar.ProfileSample | Solar.GroupSample> = currProfile
        ? [currProfile, ...(userGroups || [])]
        : []

    const isEventCreator = eventDetail.owner.handle === currProfile?.handle
    const joinedEvent = eventDetail.participants?.find(p => p.profile_id === currProfile?.id)
    const groupHost = eventDetail.event_roles?.find(r => r.role === 'group_host')


    return {
        currProfile,
        eventDetail,
        group,
        isGroupOwner,
        isGroupManager,
        isGroupMember,
        availableHost,
        isEventCreator,
        venues,
        tracks,
        joinedEvent,
        owner: eventDetail.owner,
        groupHost,
        tab: pickSearchParam(searchParams.tab) || ''
    }
}

async function getEventDetailData(eventid: number) {
    const doc = gql`query MyQuery {
        events(where: {id: {_eq: ${eventid}}}) {
            id
            title
            content
            start_time
            end_time
            timezone
            meeting_url
            location
            formatted_address
            geo_lat
            geo_lng
            cover_url
            tags
            max_participant
            badge_class_id
            notes
            group_id
            group {
                 id
                handle
                nickname
                image_url
            }
            owner {
                id
                handle
                nickname
                image_url
            }
            event_roles {
                id
                role
                item_id
                image_url
                nickname
                item_type
                group {
                    handle
                }
                profile {
                    handle
                }
            }
            tickets {
                id
                tracks_allowed
                check_badge_class_id
                check_badge_class {
                    id
                    title
                    image_url
                }
                content
                created_at
                end_time
                event_id
                need_approval
                payment_methods {
                    id
                    item_type
                    item_id
                    chain
                    token_name
                    token_address
                    receiver_address
                    price
                }
                ticket_type
                status
                title
            }
            participants {
                id
                event_id
                profile_id
                role
                status
                created_at
                ticket_id
                payment_status
                ticket {
                    title
                }
            }
        }
    }`

    // console.log(doc)
    const {events} = await request<{events: Solar.Event[]}>(process.env.NEXT_PUBLIC_GRAPH_URL!, doc)
    if (!events.length) {
        return null
    }
    return  events[0]
}

