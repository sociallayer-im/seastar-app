import {BadgeClass, Event, getProfileEventByHandle, Group, Profile, search} from '@sola/sdk'
import {EventWithJoinStatus, pickSearchParam, setEventAttendedStatus} from '@/utils'
import {CLIENT_MODE} from '@/app/config'
import {getCurrProfile} from '@/app/actions'

export interface SearchPageSearchParams {
    keyword: string,
    tab: string,
}

export interface SearchPageProps {
    searchParams: SearchPageSearchParams,
}

export default async function SearchPageData({searchParams}: SearchPageProps) {
    const keyword = pickSearchParam(searchParams.keyword) || ''
    let tab = pickSearchParam(searchParams.tab)

    if (!tab || !['badge', 'event', 'profile', 'group', 'badge'].includes(tab)) {
        tab = 'event'
    }

    if (!keyword) {
        return {
            result: {
                events: [] as EventWithJoinStatus[],
                groups: [] as Group[],
                profiles: [] as Profile[],
                badgeClasses: [] as BadgeClass[]
            },
            tab,
            keyword
        }
    }

    const data = await search({params: {keyword}, clientMode: CLIENT_MODE})

    const currProfile = await getCurrProfile()

    const profileEvents = currProfile ? await getProfileEventByHandle({
        params: {handle: currProfile?.handle},
        clientMode: CLIENT_MODE
    }) : {
        attends: [],
        starred: []
    }

    const eventWithJoinStatus = setEventAttendedStatus({
        events: data.events,
        currProfileAttends: profileEvents.attends,
        currProfileStarred: profileEvents.starred,
        currProfile
    })

    return {
        result: {...data, events: eventWithJoinStatus},
        tab,
        keyword
    }
}