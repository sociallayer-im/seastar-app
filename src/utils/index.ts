import Cookies from 'js-cookie'
import { getProfileDetailByAuth } from '@sola/sdk'
import { sha3_256 } from 'js-sha3'
import dayjs from "@/libs/dayjs"
import BigNumber from "bignumber.js"
import { Payments, PaymentsType } from "@/utils/payment_setting"
import {
    Event,
    EventDetail,
    EventDraftType,
    GroupDetail,
    PaymentMethod,
    Profile,
    Ticket,
    Track,
    VenueDetail,
    Weekday,
    EventWithJoinStatus, Participant
} from '@sola/sdk'

// Legacy sails venue location fields — soon venues reference a Place instead.
// Optional widening so venue-driven drafts compile and degrade gracefully.
export type LegacyVenueLocation = {
    geo_lat?: string | number | null
    geo_lng?: string | number | null
    formatted_address?: string | null
    location?: string | null
    location_data?: string | null
    visibility?: string | null
}

// UI-local weekly-editing shape (the SDK/API only speak `availabilities`;
// VenueForm expands them into per-day timeslots for editing).
export interface VenueTimeslot {
    day_of_week: Weekday
    disabled: boolean
    start_at: string
    end_at: string
    role: string
}
import domtoimage from 'dom-to-image'
import { Dictionary } from '@/lang'
import {CLIENT_MODE, SOLA_APP_SUBDOMAINS} from '@/app/config'

export const AUTH_FIELD = process.env.NEXT_PUBLIC_AUTH_FIELD!

export const setAuth = (token: string) => {
    Cookies.set(AUTH_FIELD, token, { expires: 365 })
}

export const getAuth = () => {
    return Cookies.get(AUTH_FIELD)
}

export const pickSearchParam = (param?: string | string[]): string | undefined => {
    const value = Array.isArray(param) ? param[0] : param
    return value === 'undefined' ? undefined : value
}

export const clientRedirectToReturn = () => {
    const cookiePath = Cookies.get('return')
    window.location.href = cookiePath || process.env.NEXT_PUBLIC_DEFAULT_RETURN!
}

export const clientCheckUserLoggedInAndRedirect = async (auth_token: string) => {
    const profile = await getProfileDetailByAuth({params: {authToken: auth_token}, clientMode: CLIENT_MODE})

    if (profile && !profile.name) {
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

export const getAvatar = (id?: number | string | null, url?: string | null) => {
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

const CF_IMAGE_HOST = 'https://datastore.sola.day'

export interface CfImageOptions {
    width?: number
    height?: number
    quality?: number
    format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png'
    fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad'
}

export const cfImage = (url: string | null | undefined, options: CfImageOptions = {}): string => {
    if (!url || !url.startsWith(CF_IMAGE_HOST)) return url || ''
    const opts: CfImageOptions = { format: 'auto', quality: 85, ...options }
    const params = (Object.entries(opts) as [string, string | number][])
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `${k}=${v}`)
        .join(',')
    const path = url.slice(CF_IMAGE_HOST.length)
    return `${CF_IMAGE_HOST}/cdn-cgi/image/${params}${path}`
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
    return { initStartTime, initEndTime }
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
        date: time.format('ddd, MMM DD, YYYY'),
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
    return !isEventTimeSuitable(timezone, eventStartTime, eventEndTime, isManager, isMember, venue as unknown as VenueDetail)
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

    if (startTime.isSameOrAfter(endTime)) {
        return 'The start time should be before the end time'
    }

    if (!venue) return ''

    const availabilities = venue.availabilities || []
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

    // venues with weekly availability config only support same-day events
    const hasWeeklySlots = availabilities.some(a => a.day_of_week && !a.day)
    if (hasWeeklySlots && startTime.day() !== endTime.day()) {
        return 'Only same-day events can be created'
    }

    // date-specific override takes priority over weekly slot
    const startDate = startTime.format('YYYY-MM-DD')
    const override = availabilities.find(a => a.day === startDate && !a.day_of_week)
    if (override) {
        if (override.intervals.length === 0) {
            return 'The date you selected is not available for the current venue due to the override settings'
        }
        if (override.role_required === 'manager' && !isManager) {
            return 'The date you selected is not available for the current venue, requires manager permission'
        }
        if (override.role_required === 'member' && !isMember) {
            return 'The date you selected is not available for the current venue, requires member permission'
        }
        const eventStart = startTime.format('HH:mm')
        const eventEnd = endTime.format('HH:mm')
        const inSlot = override.intervals.some(([s, e]) => eventStart >= s && eventEnd <= e)
        if (!inSlot) {
            return 'The date you selected is not available for the current venue due to the override settings'
        }
        return ''
    }

    // weekly timeslot
    const dayName = dayNames[startTime.day()]
    const timeslot = availabilities.find(a => a.day_of_week === dayName && !a.day)
    if (timeslot) {
        if (timeslot.intervals.length === 0) {
            return 'The date you selected is not available for the current venue due to the timeslot settings'
        }
        if (timeslot.role_required === 'manager' && !isManager) {
            return 'The date you selected is not available for the current venue, requires manager permission'
        }
        if (timeslot.role_required === 'member' && !isMember) {
            return 'The date you selected is not available for the current venue, requires member permission'
        }
        const eventStart = startTime.format('HH:mm')
        const eventEnd = endTime.format('HH:mm')
        const inSlot = timeslot.intervals.some(([s, e]) => eventStart >= s && eventEnd <= e)
        if (!inSlot) {
            return 'The date you selected is not available for the current venue due to the timeslot settings'
        }
    } else if (hasWeeklySlots) {
        // venue has weekly slots configured — an unlisted day means closed
        return 'The date you selected is not available for the current venue'
    }

    return ''
}

export function displayTicketPrice(ticket: Ticket) {
    const paymentMethods = ticket.payment_methods || []
    if (paymentMethods.length === 0) {
        return 'Free'
    }

    const prices = paymentMethods
        .filter(item => !item._destroy)
        .map(item => {
            const targetToken = findMethodToken(item)
            if (!targetToken) return null
            return BigNumber(item.price).dividedBy(BigNumber(10).pow(targetToken.decimals)).toNumber()
        })
        .filter((p): p is number => p !== null && !isNaN(p))

    if (prices.length === 0) return ''
    const maxPrice = Math.max(...prices)
    const minPrice = Math.min(...prices)

    return maxPrice === minPrice ? `${minPrice} USD` : `${minPrice}-${maxPrice} USD`
}

export function getEventDetailPageTimeStr(event: Event) {
    const startTime = dayjs.tz(new Date(event.start_time).getTime(), event.timezone || 'UTC')
    const endTime = dayjs.tz(new Date(event.end_time!).getTime(), event.timezone || 'UTC')
    const offset = startTime.utcOffset() / 60

    const startDateStr = startTime.format('ddd, MMM DD, YYYY')
    const endDateStr = endTime.format('ddd, MMM DD, YYYY')

    let dateStr = ''
    if (startDateStr !== endDateStr) {
        dateStr = startTime.format('ddd, MMM DD') + ' - ' + endTime.format('ddd, MMM DD') + ', ' + startTime.format('YYYY')
    } else {
        dateStr = startDateStr
    }

    return {
        date: dateStr,
        time: `${startTime.format('HH:mm')} - ${endTime.format('HH:mm')} GMT${offset >= 0 ? `+` + offset : offset}`
    }
}


export function shortWalletAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function displayProfileName(profile: Profile) {
    return profile.nickname || profile.name
}

export function clientToSignIn() {
    window.location.href = `${process.env.NEXT_PUBLIC_SIGN_IN_URL}?return=${window.encodeURIComponent(window.location.href)}`
}

export function getGroupSubdomain(url?: string | null) {
    if (!url) return null
    if (url.includes('.vercel.app')) return null
    if (/^(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?$/.test(url)) return null

    try {
        const parts = url.split('.')
        if (parts.length > 2 && !SOLA_APP_SUBDOMAINS.includes(parts[0])) {
            return parts[0]
        }
        return null
    } catch (e) {
        console.error("Invalid URL:", e)
        return null
    }
}

export type SetEventAttendedStatusParams = {
    events: Event[]
    currProfileAttends: Event[]
    currProfileStarred: Event[]
    currProfile?: Profile | null
}

export const setEventAttendedStatus = ({
    events,
    currProfileAttends,
    currProfileStarred,
    currProfile
}: SetEventAttendedStatusParams) => {
    return events.map(e => {
        const isCreator = e.owner.name === currProfile?.name
        const isJoined = !!currProfileAttends.find(h => h.id === e.id)
        const isStarred = !!currProfileStarred.find(h => h.id === e.id)
        return {
            ...e,
            is_owner: isCreator,
            is_attending: isJoined,
            is_starred: isStarred,
        } as EventWithJoinStatus
    })
}

export type SetEventIsOwnerStatusParams = {
    events: Event[]
    currProfile?: Profile | null
}

export const setEventIsOwnerStatus = ({
    events,
    currProfile
}: SetEventIsOwnerStatusParams) => {
    return events.map(e => {
        const isOwner = currProfile?.name === e.owner?.name
        return {
            ...e,
            is_owner: isOwner
        } as EventWithJoinStatus
    })
}

export const analyzeGroupMembershipAndCheckProfilePermissions = (groupDetail: GroupDetail, profile?: Profile | null) => {
    const owner = groupDetail.memberships.find(m => m.role === 'owner')!
    // soon roles: owner | manager | member ("issuer" is gone)
    const managers = groupDetail.memberships.filter(m => m.role === 'manager')
    const issuers: typeof groupDetail.memberships = []
    const members = groupDetail.memberships.filter(m => m.role === 'member')

    const isManager = groupDetail.memberships.some(m => m.user.name === profile?.name && (m.role === 'manager' || m.role === 'owner'))
    const isMember = groupDetail.memberships.some(m => m.user.name === profile?.name)
    const isIssuer = false
    const isOwner = owner?.user?.name === profile?.name

    const canPublishEvent = (!groupDetail.can_publish_event || groupDetail.can_publish_event === 'all' || groupDetail.can_publish_event === 'everyone')
        || (groupDetail.can_publish_event === 'manager' && isManager)
        || (groupDetail.can_publish_event === 'member' && isMember)

    // soon has no group-level review_required field: members who cannot publish
    // directly submit events as status "pending" for manager approval.
    const canSubmitForReview = !!profile && isMember
    // can submit (create) an event — either publishes directly or goes into pending review
    const canSubmitEvent = canPublishEvent || canSubmitForReview

    const canJoinEvent = (!groupDetail.can_join_event || groupDetail.can_join_event === 'all' || groupDetail.can_join_event === 'everyone')
        || (groupDetail.can_join_event === 'manager' && isManager)
        || (groupDetail.can_join_event === 'member' && isMember)

    const canViewEvent = (!groupDetail.can_view_event || groupDetail.can_view_event === 'all' || groupDetail.can_view_event === 'everyone')
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
        canSubmitEvent,
        canJoinEvent,
        canViewEvent
    }
}

export const checkEventPermissionsForProfile = (eventDetail: EventDetail, groupDetail: GroupDetail, profile?: Profile | null) => {
    const { canJoinEvent, isManager, isOwner } = analyzeGroupMembershipAndCheckProfilePermissions(groupDetail, profile)

    const isEventOperator = !!profile
        && (isManager
            || isOwner
            || eventDetail.event_roles?.some(role => role.role === 'co_host' && role.item_id === profile.id)
            || eventDetail.event_roles?.some(role => role.role === 'speaker' && role.item_id === profile.id)
        )

    // soon: a participant row with status attending/pending is a spot; paid
    // tickets are only attending once payment_status succeeds; check-in is the
    // register_time stamp.
    const attended = !!eventDetail.participants?.find((item: Participant) => {
        if (item.user.id !== profile?.id) return false
        if (item.status !== 'attending' && item.status !== 'pending') return false
        return !item.payment_status || item.payment_status.includes('succe') || item.payment_status === 'pending'
    })

    const checkedIn = eventDetail.participants?.find((item: Participant) => {
        return item.user.id === profile?.id && !!item.register_time
    })

    return {
        canAccess: canJoinEvent || isEventOperator,
        isEventOperator,
        attended,
        checkedIn
    }
}

export const getTimePropsFromRange = (timezone: string, range: string, collection?: string) => {
    timezone = timezone || dayjs.tz.guess()
    if (range === 'today') {
        return {
            start_date: dayjs.tz(new Date(), timezone).format('YYYY-MM-DD'),
            end_date: dayjs.tz(new Date(), timezone).format('YYYY-MM-DD'),
        }
    } else if (range === 'week') {
        if (collection === 'past') {
            return {
                start_date: dayjs.tz(new Date(), timezone).startOf('week').format('YYYY-MM-DD'),
                end_date: dayjs.tz(new Date(), timezone).endOf('week').format('YYYY-MM-DD'),
            }
        } else {
            return {
                start_date: dayjs.tz(new Date(), timezone).format('YYYY-MM-DD'),
                end_date: dayjs.tz(new Date(), timezone).endOf('week').format('YYYY-MM-DD'),
            }
        }
    } else if (range === 'month') {
        if (collection === 'past') {
            return {
                start_date: dayjs.tz(new Date(), timezone).startOf('month').format('YYYY-MM-DD'),
                end_date: dayjs.tz(new Date(), timezone).endOf('month').format('YYYY-MM-DD'),
            }
        } else {
            return {
                start_date: dayjs.tz(new Date(), timezone).format('YYYY-MM-DD'),
                end_date: dayjs.tz(new Date(), timezone).endOf('month').format('YYYY-MM-DD'),
            }
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

export const formatEventTime = (dateTimeStr: string, timezone?: string | null) => {
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

export const formatEventDuration = (startTime: string, endTime: string, timezone?: string | null) => {
    const tz = timezone || dayjs.tz.guess()
    const start = dayjs.tz(new Date(startTime).getTime(), tz)
    const end = dayjs.tz(new Date(endTime).getTime(), tz)
    const utcOffset = start.utcOffset() / 60
    const GMT = utcOffset >= 0 ? `GMT+${utcOffset}` : `GMT${utcOffset}`
    const now = dayjs.tz(new Date(), tz)

    const isInDayEvent = start.isSame(end, 'day')

    const startDateStr = start.calendar(now, {
        sameDay: `[Today] HH:mm`,
        nextDay: `[Tomorrow] HH:mm`,
        nextWeek: 'MMM DD, HH:mm',
        lastDay: 'MMM DD, HH:mm',
        lastWeek: 'MMM DD, HH:mm',
        sameElse: 'MMM DD, HH:mm'
    })

    const endDateStr = isInDayEvent ? end.format('HH:mm') : end.format('MMM DD, HH:mm')

    return startDateStr + ` - ` + endDateStr + ` ${GMT}`
}

export function isSupportedDownloadCardBrowser() {
    const userAgent = navigator.userAgent.toLowerCase()
    const supportedBrowsers = ['safari', 'chrome', 'firefox', 'edge']
    return supportedBrowsers.some(browser => userAgent.indexOf(browser) !== -1)
}

export const saveDomImage = async ({ dom, fileName, scaleFactor = 1 }: {
    dom: HTMLElement,
    fileName: string,
    scaleFactor: number
}): Promise<void> => {
    // Wait for all images to load before converting to PNG
    const images = dom.querySelectorAll('img')
    const imageLoadPromises = Array.from(images).map(img => {
        return new Promise<void>((resolve) => {
            if (img.complete) {
                // Image is already loaded
                resolve()
            } else {
                // Wait for image to load or fail
                const onLoad = () => {
                    img.removeEventListener('load', onLoad)
                    img.removeEventListener('error', onError)
                    resolve()
                }
                const onError = () => {
                    img.removeEventListener('load', onLoad)
                    img.removeEventListener('error', onError)
                    resolve() // Continue even if image fails to load
                }
                img.addEventListener('load', onLoad)
                img.addEventListener('error', onError)
            }
        })
    })

    // Wait for all images with timeout
    await Promise.race([
        Promise.all(imageLoadPromises),
        new Promise<void>(resolve => setTimeout(resolve, 5000)) // 5 second timeout
    ])

    const originWidth = dom.clientWidth
    const originHeight = dom.clientHeight

    const scaleWidth = originWidth * scaleFactor
    const scaleHeight = originHeight * scaleFactor

    try {
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
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    } catch (error) {
        throw new Error(`Failed to capture image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
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


export function categorizeTimeslotByWeekDay(timeslots: VenueTimeslot[]): Record<Weekday, VenueTimeslot[]> {
    let categorizedTimeslots: Record<Weekday, VenueTimeslot[]> = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
    }

    timeslots.forEach(timeslot => {
        const day = timeslot.day_of_week
        categorizedTimeslots[day].push(timeslot)
    })

    // sort timeslots by start time
    // categorizedTimeslots = Object.keys(categorizedTimeslots).reduce((acc, key) => {
    //     acc[key as Weekday] = categorizedTimeslots[key as Weekday].sort((a, b) => {
    //         return a.start_at.localeCompare(b.start_at)
    //     })
    //     return acc
    // }
    // , categorizedTimeslots)

    // if some weekdays have no timeslots, add an empty array
    categorizedTimeslots = Object.keys(categorizedTimeslots).reduce((acc, key) => {
        if (!categorizedTimeslots[key as Weekday].length) {
            const emptyTimeslot: VenueTimeslot = {
                day_of_week: key as Weekday,
                disabled: false,
                start_at: '08:00',
                end_at: '20:00',
                role: 'all'
            }
            acc[key as Weekday] = [emptyTimeslot]
        }
        return acc
    }, categorizedTimeslots)

    return categorizedTimeslots
}

export const checkTimeSlotOverlapInWeekDay = (timeslots: VenueTimeslot[]) => {
    const sortedTimeslots = (JSON.parse(JSON.stringify(timeslots)) as VenueTimeslot[]).sort((a, b) => {
        return a.start_at.localeCompare(b.start_at)
    })

    for (let i = 0; i < sortedTimeslots.length - 1; i++) {
        const current = sortedTimeslots[i]
        const next = sortedTimeslots[i + 1]
        if (current.end_at > next.start_at) {
            return true
        }
    }

    return false
}

export const inValidStartEndTime = (start_at?: string | null, end_at?: string | null) => {
    if (!start_at || !end_at) {
        return false
    }

    return start_at >= end_at
}

export const verifyUsername = (domain: string, lang: Dictionary) => {
    const minLength = 6
    const maxLength = 20

    if (!domain || !domain.trim()) {
        return lang['Please input username']
    }

    if (domain.startsWith('-')) {
        return lang['Username cannot start with "-"']
    }

    if (domain.endsWith('-')) {
        return lang['Username cannot end with "-"']
    }

    if (domain.match(/-{2,}/)) {
        const char: any = domain.match(/-{2,}/)
        return lang['Username contains invalid character'] + char[0]
    }

    if (domain.match(/[`~!@#$%^&*()_+<>?:"{},./\\|=;'[\]]/im)) {
        const char: any = domain.match(/[`~!@#$%^&*()_+<>?:"{},./\\|=;'[\]]/im)
        return lang['Username contains invalid character'] + char[0]
    }

    if (!domain.match(/^[a-z0-9]+(-{1}[a-z0-9]+)*$/)) {
        return lang['Username contains invalid character']
    }

    if (domain.length < minLength) {
        return lang['The minimum length of username is '] + minLength
    }

    if (domain.length > maxLength) {
        return lang['The maximum length of username is '] + maxLength
    }

    return null
}


export const checkDomainInput = (domain: string) => {
    if (domain.startsWith('-')) {
        return false
    }

    if (domain.match(/\s/)) {
        return false
    }

    return !domain.match(/[`~!@#$%^&*()_+<>?:"{},./\\|=;'[\]]/im)
}

export const getChainIcon = (chain: string) => {
    return Payments.find(p => p.chain === chain)?.chainIcon || '/images/unknown.png'
}

// Returns the effective chain list for a payment method.
// chains[] is canonical; chain (single string) is the legacy fallback.
const effectiveChains = (payment: PaymentMethod): string[] =>
    payment.chains?.length ? payment.chains : (payment.chain ? [payment.chain] : [])

// Finds the token config for a payment method across its supported chains.
// Uses token.id as secondary match for legacy token_name values.
export const findMethodToken = (payment: PaymentMethod) =>
    effectiveChains(payment)
        .map(chain => Payments.find(p => p.chain === chain))
        .flatMap(type => type?.tokenList || [])
        .find(token => token.name === payment.token_name || token.id === payment.token_name)

export const getPaymentMethodChainIcons = (payment: PaymentMethod): string[] =>
    effectiveChains(payment).map(getChainIcon)

export const displayMethodPrice = (payment: PaymentMethod) => {
    const targetToken = findMethodToken(payment)
    if (!targetToken) return 'Unknown'
    return BigNumber(payment.price).dividedBy(BigNumber(10).pow(targetToken.decimals)).toNumber()
}

export const prefixUrl = (url: string) => {
    if (!url) return undefined

    if (!url.startsWith('http') || !url.startsWith('https')) {
        return `https://${url}`
    } else {
        return url
    }
}

export const formatVenueDate = (venue: VenueDetail, lang: Dictionary) => {
    // soon venues carry no start/end date columns — kept optional so the label
    // degrades to "Unlimited".
    const {start_date = null, end_date = null} = venue as VenueDetail & {start_date?: string | null, end_date?: string | null}
    if (!start_date && !end_date) {
        return lang['Unlimited']
    }

    if (start_date && !end_date) {
        return lang['After {date}'].replace('{date}', start_date)
    }

    if (!start_date && end_date) {
        return lang['Before {date}'].replace('{date}', end_date)
    }

    const startDate = dayjs(start_date!)
    const endDate = dayjs(end_date!)

    if (startDate.year() === endDate.year()) {
        return `${startDate.format('DD MMM')} - ${endDate.format('DD MMM')}, ${startDate.format('YYYY')}`
    } else {
        return `${startDate.format('DD MMM, YYYY')} - ${endDate.format('DD MMM, YYYY')}`
    }
}

export function getInterval(startDate?: string, view: 'week' | 'day' | 'list' | 'compact' | 'venue' = 'week', timezone: string = dayjs.tz.guess()) {
    let start = dayjs()

    try {
        start = dayjs.tz(startDate || undefined, timezone)
    } catch (e: any) {
        console.warn(e)
    }

    switch (view) {
        case 'week':
            return {
                start: start.startOf('week').format('YYYY-MM-DD'),
                end: start.endOf('week').format('YYYY-MM-DD')
            }
        case 'day':
            return {
                start: start.format('YYYY-MM-DD'),
                end: start.format('YYYY-MM-DD')
            }
        case 'list':
            return {
                start: start.startOf('week').format('YYYY-MM-DD'),
                end: start.endOf('week').format('YYYY-MM-DD')
            }
        case 'compact':
            return {
                start: start.format('YYYY-MM-DD'),
                end: start.format('YYYY-MM-DD')
            }
        case 'venue':
            return {
                start: start.format('YYYY-MM-DD'),
                end: start.format('YYYY-MM-DD')
            }
    }
}

export async function processEventRoles(eventDraft: EventDraftType) {
    // soon stores email-only roles directly on the event_role (EventRole.email);
    // there is no by-email profile lookup (PII), so no resolution is needed.
    return eventDraft
}





