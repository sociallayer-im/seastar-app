'use server'

import {cookies, headers} from 'next/headers'
import {getLang, getLangType} from '@/lang'
import {AUTH_FIELD} from '@/utils'
import {getProfileByToken} from '@/service/solar'

export const selectLang = async function () {
    const acceptLanguage = headers().get('accept-language')
    const cookieLang = cookies().get('lang')?.value

    const type = getLangType(acceptLanguage, cookieLang)
    return {
        type: type,
        lang: getLang(type)
    }
}

export const getCurrProfile = async function () {
    const authToken = cookies().get(AUTH_FIELD)?.value
    if (!authToken) {
        return null
    }

    return await getProfileByToken(authToken)
}
