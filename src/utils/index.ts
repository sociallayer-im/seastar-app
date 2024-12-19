import Cookies from 'js-cookie'
import {getProfileByToken} from '@/service/solar'
import { sha3_256 } from 'js-sha3'
import dayjs from "dayjs"

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

export const getAvatar = (id?: number, url?: string | null) => {
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
    return {date: time.format('ddd, MMM MM,YYYY') , time: `${time.format('HH:mm')} GMT${offset >= 0 ? `+` + offset : offset}`}
}



