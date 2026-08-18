'use server'

import {cookies, headers} from 'next/headers'
import {getLang, getLangType} from '@/lang'
import {AUTH_FIELD} from '@/utils'
import {getProfileDetailByAuth, ProfileDetail} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {cache} from 'react'

// Per-request dedupe (React cache): the layout and nearly every page's data.ts
// both resolve the current profile, so this halves those calls without the
// cross-request staleness a process-global cache had.
const currProfileByToken = cache(async (authToken: string): Promise<ProfileDetail | null> => {
    const profile = await getProfileDetailByAuth({
        params: {authToken: authToken},
        clientMode: CLIENT_MODE
    })
    return profile?.name ? profile : null
})

export const selectLang = async function () {
    const acceptLanguage = (await headers()).get('accept-language')
    const cookieLang = (await cookies()).get('lang')?.value

    const type = getLangType(acceptLanguage, cookieLang)
    return {
        type: type,
        lang: getLang(type)
    }
}

export const getServerSideAuth = async () => {
    return (await cookies()).get(AUTH_FIELD)?.value
}

export const getCurrProfile = async function () {
    const authToken = await getServerSideAuth()
    if (!authToken) {
        return null
    }

    return currProfileByToken(authToken)
}
