import type {ReadonlyRequestCookies} from "next/dist/server/web/spec-extension/adapters/request-cookies"
import {AUTH_FIELD} from "@/utils"
import {redirect} from "next/navigation"
import {pickSearchParam} from "@/utils"
import {type ProfileDetail, type ClientMode, getProfileDetailByHandle, getProfileDetailByAuth, setSdkConfig} from '@sola/sdk'

setSdkConfig({clientMode: process.env.NEXT_PUBLIC_CLIENT_MODE! as ClientMode})

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
    const profileDetail = await getProfileDetailByHandle(handle)

    if (!profileDetail) {
        redirect('/error')
    }

    const profile = profileDetail

    let currProfile: ProfileDetail | null = null
    const authToken = props.cookies.get(AUTH_FIELD)?.value
    if (!!authToken) {
        currProfile = await getProfileDetailByAuth(authToken)
    }

    const isSelf = currProfile?.id === profile?.id

    return {
        profile: profile,
        currProfile: currProfile,
        isSelf,
        tab: tab || 'groups',
    }
}
