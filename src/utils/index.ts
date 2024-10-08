import Cookies from 'js-cookie'
import {getProfileByToken} from '@/service/solar'

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



