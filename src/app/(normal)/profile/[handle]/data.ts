import type {ReadonlyRequestCookies} from "next/dist/server/web/spec-extension/adapters/request-cookies"
import {redirect} from "next/navigation"
import {pickSearchParam} from "@/utils"
import {type ProfileDetail,  getProfileDetailByHandle, getProfileDetailByAuth} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {getServerSideAuth} from '@/app/actions'


export interface ProfilePageParams {
    handle: string
}

export interface ProfilePageSearchParams {
    tab?: 'groups' | 'events' | 'badges' | 'sending' | string[]
}

export interface ProfileDataProps {
    params: ProfilePageParams,
    searchParams: ProfilePageSearchParams,
    cookies: ReadonlyRequestCookies
}

export interface ProfileData {
    profile: ProfileDetail,
    currProfile: ProfileDetail | null,
    isSelf: boolean,
    tab: string,
}

export async function ProfileData(props: ProfileDataProps): Promise<ProfileData> {
    const handle = props.params.handle
    const tab = pickSearchParam(props.searchParams.tab)
    const profileDetail = await getProfileDetailByHandle({
        params: {handle: handle},
        clientMode: CLIENT_MODE
    })

    if (!profileDetail) {
        redirect('/error')
    }

    const profile = profileDetail

    let currProfile: ProfileDetail | null = null
    const authToken = await getServerSideAuth()
    if (!!authToken) {
        currProfile = await getProfileDetailByAuth({
            params: {authToken: authToken},
            clientMode: CLIENT_MODE
        })
    }

    const isSelf = currProfile?.id === profile?.id

    return {
        profile: profile,
        currProfile: currProfile,
        isSelf,
        tab: tab || 'groups',
    }
}
