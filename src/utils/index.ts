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

/**
 * The registrable parent domain, so the session cookie is shared across
 * app.sola.day, auth.sola.day and every group subdomain (<handle>.sola.day)
 * — which is what made a separate auth origin work in the first place, and what
 * has to keep working now that sign-in happens in this app.
 *
 * Returns undefined for localhost and bare IPs: a Domain attribute is invalid
 * for a single-label host, and browsers drop the whole Set-Cookie when one is
 * sent, which would silently break sign-in in local dev.
 */
export const authCookieDomain = (hostname?: string): string | undefined => {
    const host = hostname ?? (typeof window === 'undefined' ? '' : window.location.hostname)
    if (!host) return undefined
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) return undefined
    const labels = host.split('.')
    if (labels.length < 2) return undefined
    return labels.slice(-2).join('.')
}

// expires is what makes this a persistent cookie rather than a session one, so
// closing the tab doesn't sign the user out. Matches what seastar-auth set.
export const setAuth = (token: string) => {
    // Remove the host-only cookie FIRST. Builds before 5207d3e wrote this name
    // with no Domain attribute, which the browser stores as a *different*
    // cookie from the domain-scoped one below — writing one does not overwrite
    // the other. The browser then sends both, and per RFC 6265 equal-path
    // cookies go oldest-first, so the server reads the stale one.
    //
    // When that stale token points at a deleted or rotated account, /users/me
    // 401s, every page that resolves a profile bounces to /signin, and signing
    // in AGAIN cannot fix it — signing in is what writes the shadowed cookie.
    // That deadlock is what this line breaks. signOut has always removed both
    // for the same reason; the write path has to be symmetric with it.
    Cookies.remove(AUTH_FIELD)
    Cookies.set(AUTH_FIELD, token, {expires: 365, domain: authCookieDomain()})
}

export const getAuth = () => {
    return Cookies.get(AUTH_FIELD)
}

/**
 * Removal has to repeat the exact domain the cookie was written with —
 * js-cookie matches on it, and a mismatch leaves the original cookie in place
 * (the user appears signed in again on the next navigation). The host-only
 * remove is a deliberate second attempt: a session written by an older build,
 * before setAuth set a domain, is scoped to this host alone and is otherwise
 * unreachable from here.
 */
export const signOut = () => {
    Cookies.remove(AUTH_FIELD, {domain: authCookieDomain()})
    Cookies.remove(AUTH_FIELD)
}

export const pickSearchParam = (param?: string | string[]): string | undefined => {
    const value = Array.isArray(param) ? param[0] : param
    return value === 'undefined' ? undefined : value
}

/**
 * The `return` value originates in a query parameter and is then fed straight to
 * window.location / redirect(), so it is attacker-controlled navigation unless
 * it is checked. Two things have to be refused:
 *
 *  - non-http schemes — `?return=javascript:…` is script execution on our origin;
 *  - other people's domains — otherwise this is an open redirect wearing ours,
 *    which is exactly the primitive a phishing link wants.
 *
 * Absolute URLs can't simply be banned: a group subdomain (<handle>.sola.day) is
 * a different origin from app.sola.day, and signing in there has to come back
 * there. So the test is the registrable domain, not the origin — anything under
 * the same parent domain as the page doing the redirect is allowed, and a bare
 * path always is.
 */
export const sanitizeReturnTarget = (value?: string | null, currentHost?: string | null): string => {
    const fallback = process.env.NEXT_PUBLIC_DEFAULT_RETURN || '/'
    if (!value) return fallback
    // Protocol-relative ("//evil.com") is an absolute URL in disguise, so this
    // has to be checked before treating a leading "/" as a local path.
    if (value.startsWith('//')) return fallback
    if (value.startsWith('/')) return value

    try {
        const url = new URL(value)
        if (url.protocol !== 'https:' && url.protocol !== 'http:') return fallback

        const host = currentHost ?? (typeof window === 'undefined' ? '' : window.location.host)
        const parent = authCookieDomain(host.split(':')[0])
        // No parent domain to compare against (localhost, an IP): accept only
        // an exact host match, so dev keeps working without opening a hole.
        if (!parent) return url.host === host ? value : fallback

        return url.hostname === parent || url.hostname.endsWith(`.${parent}`) ? value : fallback
    } catch {
        return fallback
    }
}

/**
 * Where to land after signing in. `return` is set by middleware from the
 * ?return= query param, exactly as the standalone auth app did, so existing
 * links keep working untouched.
 *
 * The '/' fallback inside sanitizeReturnTarget is load-bearing:
 * NEXT_PUBLIC_DEFAULT_RETURN is set in no environment, so the previous
 * `cookiePath || process.env.…!` navigated to the literal string "undefined".
 */
export const returnTarget = () => sanitizeReturnTarget(Cookies.get('return'))

export const clientRedirectToReturn = () => {
    window.location.href = returnTarget()
}

/**
 * Where a freshly signed-in account still has to go before it can be used.
 *
 * Email comes BEFORE username, and that order is load-bearing. Binding an
 * address that already has an account merges the two, and soon only permits
 * that while this account is still unregistered (blank name) — see
 * AuthController#mergeable?. Asking for the username first would close the
 * merge window and leave the person holding two accounts, which is the whole
 * thing we're trying to avoid for WeChat sign-ins.
 *
 * Accounts that arrive with an email (code login, Google) skip straight to the
 * username step, and `/bind-email` is skippable, so nobody is forced through a
 * step that doesn't apply to them.
 */
export const onboardingTarget = (
    profile: {email?: string | null, name?: string | null} | null,
    prefillUsername?: string
) => {
    if (!profile) return returnTarget()
    if (!profile.email) return '/bind-email'
    if (!profile.name) {
        return prefillUsername ? `/register?username=${encodeURIComponent(prefillUsername)}` : '/register'
    }
    return returnTarget()
}

/**
 * Post-sign-in routing. An account with no username yet has to finish at
 * /register before anything else — getCurrProfile reports a nameless account as
 * signed-out, so skipping this step would drop the user back on a page that
 * still thinks they never signed in.
 */
export const clientCheckUserLoggedInAndRedirect = async (auth_token: string, prefillUsername?: string) => {
    const profile = await getProfileDetailByAuth({params: {authToken: auth_token}, clientMode: CLIENT_MODE})
    if (!profile) {
        // The token we JUST received resolves to no account — it was revoked,
        // or the account is gone. Carrying on would land the user on a page
        // that bounces them to /signin with the dead cookie still in place, so
        // clear it and send them to sign in cleanly rather than into a loop.
        signOut()
        window.location.href = '/signin'
        return
    }
    window.location.href = onboardingTarget(profile, prefillUsername)
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

// Cloudflare Images' own delivery host. Uploads go to the R2 bucket behind
// CF_IMAGE_HOST, but for a while soon's upload endpoint returned Cloudflare
// Images variant URLs instead, so a handful of stored *_url values still point
// here. Left alone they are doubly broken: cfImage can't resize them, and
// imagedelivery.net is unreachable from mainland China. Our own domain serves
// the very same objects under /cdn-cgi/imagedelivery, which is reachable and
// still goes through image resizing — so rewrite rather than pass through.
const CF_DELIVERY_HOST = 'https://imagedelivery.net'

export interface CfImageOptions {
    width?: number
    height?: number
    quality?: number
    format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png'
    fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad'
}

export const cfImage = (url: string | null | undefined, options: CfImageOptions = {}): string => {
    if (!url) return ''

    let path: string
    if (url.startsWith(CF_IMAGE_HOST)) {
        path = url.slice(CF_IMAGE_HOST.length)
    } else if (url.startsWith(CF_DELIVERY_HOST)) {
        path = `/cdn-cgi/imagedelivery${url.slice(CF_DELIVERY_HOST.length)}`
    } else {
        return url
    }

    const opts: CfImageOptions = { format: 'auto', quality: 85, ...options }
    const params = (Object.entries(opts) as [string, string | number][])
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `${k}=${v}`)
        .join(',')
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

/**
 * What a ticket costs, in the units it is actually priced in.
 *
 * The unit used to be the literal string "USD" for everything, which was
 * survivable while USD was the only fiat currency and every crypto token was a
 * dollar stablecoin. A ¥1 WeChat ticket rendered as "1 USD" — a price tag that
 * is wrong by ~7x, on the screen where the buyer decides.
 *
 * Prices in different units are never mixed into one range: a ticket payable
 * as ¥1 or 5 USDT is two offers, not a spread, and averaging them would invent
 * an exchange rate we do not have.
 */
export function displayTicketPrice(ticket: Ticket) {
    const paymentMethods = (ticket.payment_methods || []).filter(item => !item._destroy)
    if (paymentMethods.length === 0) {
        return 'Free'
    }

    // Insertion-ordered, so the organizer's own ordering of methods is kept.
    const byUnit = new Map<string, {values: number[], symbol?: string}>()
    paymentMethods.forEach(method => {
        const amount = methodAmount(method)
        if (!amount || isNaN(amount.value)) return

        const bucket = byUnit.get(amount.unit) || {values: [], symbol: amount.symbol}
        bucket.values.push(amount.value)
        byUnit.set(amount.unit, bucket)
    })

    if (byUnit.size === 0) return ''

    return Array.from(byUnit.entries())
        .map(([unit, {values, symbol}]) => {
            const min = Math.min(...values)
            const max = Math.max(...values)
            const range = min === max ? `${min}` : `${min}-${max}`
            // Fiat reads as ¥1; a token has no symbol, so it stays "1 USDT".
            return symbol ? `${symbol}${range}` : `${range} ${unit}`
        })
        .join(' / ')
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

/**
 * Sign-in entry points. The auth screens now live in this app, so these are
 * same-origin paths — no hop to auth.sola.day and back, which is the whole
 * point of the integration.
 *
 * The paths deliberately match the standalone auth app's one-for-one
 * (/register, /bind-email, /verify-email, /verify-bind-email, and ?return=), so
 * links that already exist — including auth.sola.day URLs still sitting in
 * caches and bookmarks — resolve to the same screens. Only the sign-in root
 * differs: '/' is this app's home page, so it is served at /signin and
 * middleware rewrites the auth host's '/' onto it.
 *
 * Set NEXT_PUBLIC_SIGN_IN_URL to fall back to an external auth origin; leaving
 * it empty (the default now) keeps everything in-app.
 */
const authPath = (path: string, returnTo?: string) => {
    const base = process.env.NEXT_PUBLIC_SIGN_IN_URL || ''
    // The standalone app's sign-in screen was its root, not '/signin'.
    const target = base && path === '/signin' ? '' : path
    const url = `${base}${target}` || '/'
    return returnTo ? `${url}?return=${encodeURIComponent(returnTo)}` : url
}

export const signInUrl = (returnTo?: string) => authPath('/signin', returnTo)
export const bindEmailUrl = (returnTo?: string) => authPath('/bind-email', returnTo)

export function clientToSignIn() {
    window.location.href = signInUrl(window.location.href)
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

/**
 * Who a group's can_publish_event / can_join_event / can_view_event setting
 * opens something up to.
 */
export type GroupPermissionScope = 'everyone' | 'member' | 'manager'

/**
 * The single place that decides what a stored permission value means.
 *
 * There used to be three answers to that question and they disagreed: the
 * settings form wrote 'all', this file read 'all' | 'everyone' | empty as open,
 * and soon's EventPolicy#create? accepted only 'everyone' — so every group set
 * to "Everyone" was in fact manager-only on the backend, and the UI cheerfully
 * showed a Create Event button that 403'd. 160 of 453 groups were in that state.
 *
 * 'everyone' is now the one written value (see PermissonForm) and the stored
 * data has been normalized to match. 'all' and empty are still accepted here:
 * legacy rows are what caused this, and silently reinterpreting an unknown value
 * as manager-only would lock a group down rather than fail visibly.
 */
export const normalizeGroupPermission = (value?: string | null): GroupPermissionScope => {
    if (value === 'member' || value === 'manager') return value
    return 'everyone'
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

    const publishScope = normalizeGroupPermission(groupDetail.can_publish_event)
    const canPublishEvent = publishScope === 'everyone'
        || (publishScope === 'manager' && isManager)
        || (publishScope === 'member' && isMember)

    // soon has no group-level review_required field: members who cannot publish
    // directly submit events as status "pending" for manager approval.
    const canSubmitForReview = !!profile && isMember
    // can submit (create) an event — either publishes directly or goes into pending review
    const canSubmitEvent = canPublishEvent || canSubmitForReview

    // Gates the RSVP button (via checkEventPermissionsForProfile's canAccess and
    // the event detail loader's) — a member-only group shows a "this event is
    // only for members" line instead.
    const joinScope = normalizeGroupPermission(groupDetail.can_join_event)
    const canJoinEvent = joinScope === 'everyone'
        || (joinScope === 'manager' && isManager)
        || (joinScope === 'member' && isMember)

    const viewScope = normalizeGroupPermission(groupDetail.can_view_event)
    const canViewEvent = viewScope === 'everyone'
        || (viewScope === 'manager' && isManager)
        || (viewScope === 'member' && isMember)

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
    // checked_in_at stamp (registered_at is the RSVP time).
    const attended = !!eventDetail.participants?.find((item: Participant) => {
        if (item.user.id !== profile?.id) return false
        if (item.status !== 'attending' && item.status !== 'pending') return false
        return !item.payment_status || item.payment_status.includes('succe') || item.payment_status === 'pending'
    })

    const checkedIn = eventDetail.participants?.find((item: Participant) => {
        return item.user.id === profile?.id && !!item.checked_in_at
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

// Fiat prices are stored in minor units on every rail — cents, 分 — so the
// scale is fixed and does not depend on finding a token entry.
const FIAT_DECIMALS = 2
const FIAT_SYMBOL: Record<string, string> = {usd: '$', cny: '¥'}

/**
 * A payment method's price, with the unit it is actually denominated in.
 *
 * `currency` is the authority when present: it is what the backend charged and
 * what a refund goes out in. Only crypto methods fall through to the token,
 * whose name IS the unit there. Reading the unit off the token for fiat too
 * would work by accident today and break the moment a rail's token entry is
 * missing — the backend never requires token_name.
 */
export const methodAmount = (payment: PaymentMethod): {value: number, unit: string, symbol?: string} | null => {
    if (payment.currency) {
        const code = payment.currency.toLowerCase()
        return {
            value: BigNumber(payment.price).dividedBy(BigNumber(10).pow(FIAT_DECIMALS)).toNumber(),
            unit: code.toUpperCase(),
            symbol: FIAT_SYMBOL[code]
        }
    }

    const targetToken = findMethodToken(payment)
    if (!targetToken) return null
    return {
        value: BigNumber(payment.price).dividedBy(BigNumber(10).pow(targetToken.decimals)).toNumber(),
        unit: targetToken.name
    }
}

export const displayMethodPrice = (payment: PaymentMethod) =>
    methodAmount(payment)?.value ?? 'Unknown'

/**
 * An order's amount, which is stored in minor units on fiat rails.
 *
 * A crypto order carries no currency — its amount is scaled by a token's
 * decimals that the order row alone does not name — so it is shown raw rather
 * than divided by a factor we would be guessing at.
 */
export const formatOrderAmount = (minor?: number | null, currency?: string | null) => {
    if (minor === null || minor === undefined) return ''
    if (!currency) return `${minor}`

    const code = currency.toLowerCase()
    const value = BigNumber(minor).dividedBy(BigNumber(10).pow(FIAT_DECIMALS)).toNumber()
    const symbol = FIAT_SYMBOL[code]
    return symbol ? `${symbol}${value}` : `${value} ${code.toUpperCase()}`
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





