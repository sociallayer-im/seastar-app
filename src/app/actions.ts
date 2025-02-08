'use server'

import {cookies, headers} from 'next/headers'
import {getLang, getLangType} from '@/lang'
import {AUTH_FIELD} from '@/utils'
import {getProfileDetailByAuth, ProfileDetail} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import NodeCache from 'node-cache'

const Cache = new NodeCache()

export const selectLang = async function () {
    const acceptLanguage = headers().get('accept-language')
    const cookieLang = cookies().get('lang')?.value

    const type = getLangType(acceptLanguage, cookieLang)
    return {
        type: type,
        lang: getLang(type)
    }
}

export const getServerSideAuth = async () => {
    return cookies().get(AUTH_FIELD)?.value
}

export const getCurrProfile = async function () {
    const authToken = await getServerSideAuth()
    if (!authToken) {
        return null
    }

    const cache = Cache.get(authToken)
    if (cache) {
        return cache as ProfileDetail
    }

    const profile =  await getProfileDetailByAuth({
        params: {authToken: authToken},
        clientMode: CLIENT_MODE
    })

    Cache.set(authToken, profile, 2)

    return  profile
}
