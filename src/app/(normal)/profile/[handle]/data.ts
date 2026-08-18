import {redirect} from "next/navigation"
import {pickSearchParam} from "@/utils"
import {type ProfileDetail, getProfileDetailByName, getProfileDetailByAuth} from '@sola/sdk'
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
}

export interface ProfileData {
    profile: ProfileDetail,
    currProfile: ProfileDetail | null,
    isSelf: boolean,
    tab: string,
}

export async function ProfileData(handle: string, tab='events'): Promise<ProfileData> {
    const authToken = await getServerSideAuth()

    // The viewed profile and the viewer's own are independent reads.
    const [profileDetail, currProfile] = await Promise.all([
        getProfileDetailByName({
            params: {name: handle},
            clientMode: CLIENT_MODE
        }),
        authToken
            ? getProfileDetailByAuth({params: {authToken: authToken}, clientMode: CLIENT_MODE})
            : Promise.resolve<ProfileDetail | null>(null)
    ])

    if (!profileDetail) {
        redirect('/error')
    }

    const profile = profileDetail

    const isSelf = currProfile?.id === profile?.id

    return {
        profile: profile,
        currProfile: currProfile,
        isSelf,
        tab: tab || 'groups',
    }
}
