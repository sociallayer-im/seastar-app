import Cookies from 'js-cookie'
import {getProfileByToken} from '@/service/solar'
import {sha3_256} from 'js-sha3'
import dayjs from "dayjs"
import BigNumber from "bignumber.js"
import {paymentTokenList} from "@/utils/payment_setting"
import {Profile, Event, GroupDetail, EventDetail, Ticket, VenueDetail, Track, EventDraftType} from '@sola/sdk'
import Dayjs from '@/libs/dayjs'
import domtoimage from 'dom-to-image'

export const AUTH_FIELD = process.env.NEXT_PUBLIC_AUTH_FIELD!

export const setAuth = (token: string) => {
    Cookies.set(AUTH_FIELD, token, {expires: 365})
}

export const getAuth = () => {
    return Cookies.get(AUTH_FIELD)
}

export const pickSearchParam = (param: string | string[] | undefined): string | undefined => {
    return Array.isArray(param) ? param[0] : param
}

export const clientRedirectToReturn = () => {
    const cookiePath = Cookies.get('return')
    window.location.href = cookiePath || process.env.NEXT_PUBLIC_DEFAULT_RETURN!
}

export const clientCheckUserLoggedInAndRedirect = async (auth_token: string) => {
    const profile = await getProfileByToken(auth_token)

    if (profile && !profile.handle) {
        window.location.href = '/register'
    } else {
        const cookiePath = Cookies.get('return')
        window.location.href = cookiePath || process.env.NEXT_PUBLIC_DEFAULT_RETURN!
    }
}

export const checkProcess = (startTime: string, endTime: string) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const now = new Date()

    if (now < start) {
        return 'upcoming'
    } else if (now > end) {
        return 'past'
    } else {
        return 'ongoing'
    }
}

export const getAvatar = (id?: number | null, url?: string | null) => {
    if (url) return url

    const defAvatars = [
        '/images/default_avatar/avatar_0.png',
        '/images/default_avatar/avatar_1.png',
        '/images/default_avatar/avatar_2.png',
        '/images/default_avatar/avatar_3.png',
        '/images/default_avatar/avatar_4.png',
        '/images/default_avatar/avatar_5.png'
    ]

    if (!id) return defAvatars[0]

    const hash = sha3_256(id.toString())
    const lastNum16 = hash[hash.length - 1]
    const lastNum10 = parseInt(lastNum16, 16)
    const avatarIndex = lastNum10 % defAvatars.length
    return defAvatars[avatarIndex]
}

export const getScrollBarWidth = () => {
    const el = document.createElement("div")
    el.style.cssText = "overflow:scroll; visibility:hidden; position:absolute;"
    document.body.appendChild(el)
    const width = el.offsetWidth - el.clientWidth
    el.remove()
    return width
}

export function genGoogleMapLink(lat: string | number, lng: string | number, place_id?: string | null) {
    let url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    if (place_id) {
        url = url + `&query_place_id=${place_id}`
    }

    return url
}

export function getPrefillEventDateTime() {
    const now = new Date()
    const minutes = now.getMinutes()
    const minuteRange = [0, 30, 60]
    const nearestMinute = minuteRange.find((item) => {
        return item >= minutes
    })

    const initStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), nearestMinute || 0)
    const initEndTime = new Date(initStartTime.getTime() + 60 * 30 * 1000)
    return {initStartTime, initEndTime}
}

export function calculateDuration(start: Date, end: Date) {
    if (end < start) return ``
    const duration = end.getTime() - start.getTime()
    const day = Math.floor(duration / (1000 * 60 * 60 * 24))
    const hour = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minute = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
    const res = `${day ? `${day}d ` : ''}` + `${hour ? `${hour}h ` : ''}` + `${minute ? `${minute}m` : ''}`
    if (res === '23h 59m') return '1 day'
    return res
}

export function eventCoverTimeStr(date: string, timezone: string) {
    const time = dayjs.tz(new Date(date).getTime(), timezone)
    const offset = time.utcOffset() / 60
    return {
        date: time.format('ddd, MMM MM,YYYY'),
        time: `${time.format('HH:mm')} GMT${offset >= 0 ? `+` + offset : offset}`
    }
}

export function checkVenueTimeAvailability(
    timezone: string,
    eventStartTime: string,
    eventEndTime: string,
    venue: Solar.Venue,
    isManager: boolean,
    isMember: boolean
) {
    const startTime = dayjs.tz(new Date(eventStartTime).getTime(), timezone)
    const endTime = dayjs.tz(new Date(eventEndTime!).getTime(), timezone)

    // 判断 overrides 优先级最高
    const hasOverride = venue.venue_overrides?.find((item) => {
        const start_at = item.start_at || '00:00'
        const end_at = item.end_at || '23:59'
        return startTime.isBetween(dayjs.tz(`${item.day} ${start_at}`, timezone), dayjs.tz(`${item.day} ${end_at}`, timezone), null, '[]')
            || endTime.isBetween(dayjs.tz(`${item.day} ${start_at}`, timezone), dayjs.tz(`${item.day} ${end_at}`, timezone), null, '[]')
    })

    if (hasOverride) {
        return !hasOverride.disabled &&
            (hasOverride.role !== 'manager' || isManager) &&
            (hasOverride.role !== 'member' || isMember)
    }

    // 判断 venue 的 start date 和 end date
    let venueAvailable = true
    const availableStart = venue.start_date ? dayjs.tz(venue.start_date, timezone) : null
    const availableEnd = venue.end_date ? dayjs.tz(venue.end_date, timezone).hour(23).minute(59) : null
    if (availableStart && !availableEnd) {
        venueAvailable = startTime.isSameOrAfter(availableStart)
    } else if (!availableStart && availableEnd) {
        venueAvailable = endTime.isBefore(availableEnd)
    } else if (availableStart && availableEnd) {
        venueAvailable = startTime.isSameOrAfter(availableStart) && endTime.isBefore(availableEnd)
    }

    // 判断timeslot
    let timeslotAvailable = true
    const day = dayjs.tz(new Date(eventStartTime).getTime(), timezone).day()
    const dayFullName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const timeslots = venue.venue_timeslots?.filter(item => item.day_of_week === dayFullName[day])
    if (!!timeslots?.length) {
        if (timeslots[0].disabled) {
            timeslotAvailable = false
        } else {
            const eventStartTimeHour = startTime.format('HH:mm')
            const eventEndTimeHour = endTime.format('HH:mm')
            timeslotAvailable = timeslots.some(timeslot => {
                let canBook = true
                if (timeslot.role === 'manager') {
                    canBook = isManager
                }
                if (timeslot.role === 'member') {
                    canBook = isMember
                }

                return canBook && eventStartTimeHour >= timeslot.start_at && eventEndTimeHour <= timeslot.end_at
            })
        }
    }

    return timeslotAvailable && venueAvailable
}

export function isEventTimeSuitable(
    timezone: string,
    eventStartTime: string,
    eventEndTime: string,
    isManager: boolean,
    isMember: boolean,
    venue?: VenueDetail,
) {
    const startTime = dayjs.tz(new Date(eventStartTime).getTime(), timezone)
    const endTime = dayjs.tz(new Date(eventEndTime!).getTime(), timezone)

    // 判断开始时间是否在结束时间之前
    if (startTime.isSameOrAfter(endTime)) {
        return 'The start time should be before the end time'
    }

    // 如果venue不存在则跳过后面的检查
    if (!venue) return ''

    // 如果venue 存在timeslots, 只能创建日内的event
    if (!!venue.venue_timeslots?.length) {
        if (startTime.day() !== endTime.day()) {
            return 'Only same-day events can be created'
        }
    }

    // 判断 overrides 优先级最高
    const hasOverride = venue.venue_overrides?.find((item) => {
        const start_at = item.start_at || '00:00'
        const end_at = item.end_at || '23:59'
        return startTime.isBetween(dayjs.tz(`${item.day} ${start_at}`, timezone), dayjs.tz(`${item.day} ${end_at}`, timezone), null, '[]')
            || endTime.isBetween(dayjs.tz(`${item.day} ${start_at}`, timezone), dayjs.tz(`${item.day} ${end_at}`, timezone), null, '[]')
    })

    if (hasOverride) {
        if (hasOverride.disabled) {
            return 'The date you selected is not available for the current venue due to the override settings'
        }
        if (hasOverride.role === 'manager' && !isManager) {
            return 'The date you selected is not available for the current venue, requires manager permission'
        }
        if (hasOverride.role === 'member' && !isMember) {
            return 'The date you selected is not available for the current venue, requires member permission'
        }
        return ''
    }

    // 判断 venue 的 start date 和 end date
    const availableStart = venue.start_date ? dayjs.tz(venue.start_date, timezone) : null
    const availableEnd = venue.end_date ? dayjs.tz(venue.end_date, timezone).hour(23).minute(59) : null
    if (availableStart && !availableEnd && startTime.isBefore(availableStart)) {
        return 'The date you selected should be after the venue start date'
    } else if (!availableStart && availableEnd && endTime.isAfter(availableEnd)) {
        return 'The date you selected should be before the venue end date'
    } else if (availableStart && availableEnd && (startTime.isBefore(availableStart) || endTime.isAfter(availableEnd))) {
        return 'The date you selected should be between the venue start date and end date'
    }

    // 判断timeslot
    const day = startTime.day()
    const dayFullName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const timeslots = venue.venue_timeslots?.filter(item => item.day_of_week === dayFullName[day])
    if (!!timeslots?.length) {
        if (timeslots[0].disabled) {
            return 'The date you selected is not available for the current venue due to the timeslot settings'
        } else {
            const eventStartTimeHour = startTime.format('HH:mm')
            const eventEndTimeHour = endTime.format('HH:mm')
            const timeslotAvailable = timeslots.find(timeslot => {
                return eventStartTimeHour >= timeslot.start_at && eventEndTimeHour <= timeslot.end_at
            })

            if (!timeslotAvailable) {
                return 'The date you selected is not available for the current venue due to the timeslot settings'
            }

            if (timeslotAvailable.role === 'manager' && !isManager) {
                return 'The date you selected is not available for the current venue, requires manager permission'
            }

            if (timeslotAvailable.role === 'member' && !isMember) {
                return 'The date you selected is not available for the current venue, requires member permission'
            }
        }
    }

    return ''
}

export function displayTicketPrice(ticket: Ticket) {
    if (ticket.payment_methods.length === 0) {
        return 'Free'
    }

    const prices = ticket.payment_methods.map(item => {
        const targetToken = paymentTokenList.find(chain => chain.id === item.chain)
        const targetTokenDetail = targetToken?.tokenList.find(token => token.id === item.token_name)

        return BigNumber(item.price).dividedBy(BigNumber(10).pow(targetTokenDetail?.decimals || 0)).toNumber()
    })

    const maxPrice = Math.max(...prices)
    const minPrice = Math.min(...prices)

    return maxPrice === minPrice ? `${minPrice} USD` : `${minPrice}-${maxPrice} USD`
}

export function getEventDetailPageTimeStr(event: Event) {
    const startTime = dayjs.tz(new Date(event.start_time).getTime(), event.timezone)
    const endTime = dayjs.tz(new Date(event.end_time!).getTime(), event.timezone)
    const offset = startTime.utcOffset() / 60

    const startDateStr = startTime.format('ddd, MMM MM,YYYY')
    const endDateStr = endTime.format('ddd, MMM MM,YYYY')

    let dateStr = ''
    if (startDateStr !== endDateStr) {
        dateStr = startTime.format('ddd, MMM MM') + ' - ' + endTime.format('ddd, MMM MM')
    } else {
        dateStr = startTime.format('ddd, MMM MM,YYYY')
    }

    return {
        date: dateStr,
        time: `${startTime.format('HH:mm')} - ${endTime.format('HH:mm')} GMT${offset >= 0 ? `+` + offset : offset}`
    }
}

export function genGoogleMapLinkByEvent(event: EventDetail) {
    let url = `https://www.google.com/maps/search/?api=1&query=${event.geo_lat}%2C${event.geo_lng}`
    if (event.location_data) {
        url = url + `&query_place_id=${event.location_data}`
    }
    return url
}

export function shortWalletAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function displayProfileName(profile: Profile) {
    return profile.nickname || profile.handle
}

export function clientToSignIn() {
    const signInUrl = `${process.env.NEXT_PUBLIC_SIGN_IN_URL}?return=${window.encodeURIComponent(window.location.href)}`
    alert(signInUrl)
    window.location.href = signInUrl
}

export function getGroupSubdomain(url?: string | null) {
    if (!url) return null
    try {
        const parts = url.split('.')
        if (parts.length > 2 && !['app', 'www', 'seastar-dev', 'auth'].includes(parts[0])) {
            return parts[0]
        }
        return null
    } catch (e) {
        console.error("Invalid URL:", e);
        return null;
    }
}

export interface EventWithJoinStatus extends Event {
    isCreator: boolean
    isJoined: boolean
}

export type SetEventAttendedStatusParams = {
    events: Event[]
    currProfileAttends: Event[]
    currProfile?: Profile | null
}

export const setEventAttendedStatus = ({events, currProfileAttends, currProfile}: SetEventAttendedStatusParams) => {
    return events.map(e => {
        const isCreator = e.owner.handle === currProfile?.handle
        const isJoined = !!currProfileAttends.find(h => h.id === e.id)
        return {
            ...e,
            isCreator,
            isJoined
        } as EventWithJoinStatus
    })
}

export const analyzeGroupMembershipAndCheckProfilePermissions = (groupDetail: GroupDetail, profile?: Profile | null) => {
    const owner = groupDetail.memberships.find(m => m.role === 'owner')!
    const managers = groupDetail.memberships.filter(m => m.role === 'manager')
    const issuers = groupDetail.memberships.filter(m => m.role === 'issuer')
    const members = groupDetail.memberships.filter(m => m.role === 'member')

    const isManager = groupDetail.memberships.some(m => m.profile.handle === profile?.handle && (m.role === 'manager' || m.role === 'owner'))
    const isMember = groupDetail.memberships.some(m => m.profile.handle === profile?.handle)
    const isIssuer = groupDetail.memberships.some(m => m.profile.handle === profile?.handle && m.role === 'issuer')
    const isOwner = owner?.profile.handle === profile?.handle

    const canPublishEvent = (!groupDetail.can_publish_event || groupDetail.can_publish_event === 'everyone')
        || (groupDetail.can_publish_event === 'manager' && isManager)
        || (groupDetail.can_publish_event === 'member' && isMember)

    const canJoinEvent = (!groupDetail.can_join_event || groupDetail.can_join_event === 'everyone')
        || (groupDetail.can_join_event === 'manager' && isManager)
        || (groupDetail.can_join_event === 'member' && isMember)

    const canViewEvent = (!groupDetail.can_view_event || groupDetail.can_view_event === 'everyone')
        || (groupDetail.can_view_event === 'manager' && isManager)
        || (groupDetail.can_view_event === 'member' && isMember)

    return {
        owner,
        managers,
        issuers,
        members,
        isManager,
        isMember,
        isIssuer,
        isOwner,
        canPublishEvent,
        canJoinEvent,
        canViewEvent
    }
}

export const getTimePropsFromRange = (range?: string) => {
    if (range === 'today') {
        return {
            start_date: dayjs().format('YYYY-MM-DD'),
            end_date: dayjs().format('YYYY-MM-DD'),
        }
    } else if (range === 'week') {
        return {
            start_date: dayjs().format('YYYY-MM-DD'),
            end_date: dayjs().endOf('week').format('YYYY-MM-DD'),
        }
    } else if (range === 'month') {
        return {
            start_date: dayjs().format('YYYY-MM-DD'),
            end_date: dayjs().endOf('month').format('YYYY-MM-DD'),
        }
    } else {
        return {
            start_date: undefined,
            end_date: undefined,
        }
    }
}

export const getRangeFromTimeProps = (start_date?: string, end_date?: string) => {
    if (!start_date || !end_date) return 'all_time'
    if (start_date === end_date) return 'today'

    const start = dayjs(start_date)
    if (start.endOf('week').format('YYYY-MM-DD') === end_date) return 'week'
    if (start.endOf('month').format('YYYY-MM-DD') === end_date) return 'month'
}

export const getGmtOffset = (timezone: string) => {
    const date = dayjs.tz(new Date(), timezone)
    const utcOffset = date.utcOffset() / 60
    return utcOffset >= 0 ? `GMT+${utcOffset}` : `GMT${utcOffset}`
}

export const formatEventTime = (dateTimeStr: string, timezone?: string) => {
    const tz = timezone || dayjs.tz.guess()
    const date = dayjs.tz(new Date(dateTimeStr).getTime(), tz)
    const utcOffset = date.utcOffset() / 60
    const GMT = utcOffset >= 0 ? `GMT+${utcOffset}` : `GMT${utcOffset}`
    const now = dayjs.tz(new Date(), tz)

    return date
        .calendar(now, {
            sameDay: '[Today] HH:mm',
            nextDay: '[Tomorrow] HH:mm',
            nextWeek: 'ddd MMM DD, HH:mm',
            lastDay: 'ddd MMM DD, HH:mm',
            lastWeek: 'ddd MMM DD, HH:mm',
            sameElse: 'ddd MMM DD, HH:mm'
        }) + ` ${GMT}`
}

export function isSupportedDownloadCardBrowser() {
    const userAgent = navigator.userAgent.toLowerCase()
    const supportedBrowsers = ['safari', 'chrome', 'firefox', 'edge']
    return supportedBrowsers.some(browser => userAgent.indexOf(browser) !== -1)
}

export const saveDomImage = async ({dom, fileName, scaleFactor = 1}: {
    dom: HTMLElement,
    fileName: string,
    scaleFactor: number
}) => {
    const originWidth = dom.clientWidth
    const originHeight = dom.clientHeight

    const scaleWidth = originWidth * scaleFactor
    const scaleHeight = originHeight * scaleFactor
    const dataUrl = await domtoimage.toPng(dom, {
        width: scaleWidth,
        height: scaleHeight,
        style: {
            transform: `scale(${scaleFactor})`,
            transformOrigin: 'top left',
            borderRadius: '0',
            boxShadow: 'none'
        }
    })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${fileName}.png`
    a.click()
}

export const checkTrackSuitable = (event: EventDraftType, track?: Track): string => {
    if (!!track) {
        const eventStartTime = dayjs.tz(new Date(event.start_time!).getTime(), event.timezone!).format('YYYY-MM-DD')
        const eventEndTime = dayjs.tz(new Date(event.end_time!).getTime(), event.timezone!).format('YYYY-MM-DD')

        if (track.start_date && eventStartTime < track.start_date) {
            return `The event start date cannot be earlier than the track start date: ${track.start_date}`
        }

        if (track.end_date && eventEndTime >= track.end_date) {
            return `The event end date cannot be later than the track end date: ${track.end_date}`
        }

        if (track.start_date && track.end_date && (eventStartTime < track.start_date || eventEndTime >= track.end_date)) {
            return `The event date must be within the track date range: ${track.start_date} to ${track.end_date}`
        }

        return ''
    } else {
        return ''
    }
}

export function reverseObjectFields<T extends Record<string, any>>(obj: T): T {
    return Object.fromEntries(
        Object.entries(obj).reverse()
    ) as T
}






