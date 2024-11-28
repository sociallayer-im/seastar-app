import type {ReadonlyRequestCookies} from "next/dist/server/web/spec-extension/adapters/request-cookies"
import {getProfileByToken} from "@/service/solar"
import {AUTH_FIELD} from "@/utils"
import {redirect} from "next/navigation"
import {pickSearchParam} from "@/utils"
import {gql, request} from 'graphql-request'
import process from "node:process"

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

export type ProfileDetail = Pick<Solar.Profile, 'id' | 'handle' | 'image_url' | 'about' | 'social_links' | 'nickname'>

export interface ProfileData {
    profile: ProfileDetail,
    currProfile: Solar.Profile | null,
    isSelf: boolean,
    tab: string,
    followers: number,
    followings: number
}

export async function ProfileData(props: ProfileDataProps): Promise<ProfileData> {
    const handle = props.params.handle
    const tab = pickSearchParam(props.searchParams.tab)
    const {profiles, followings, followers} = await getProfileData(handle)


    if (!profiles || !profiles.length) {
        redirect('/error')
    }

    const profile = profiles[0]

    if (profile.social_links) {
        // social_links is type of string if getting profile by graphql
        profile.social_links = JSON.parse(profile.social_links.toString())
    }

    let currProfile: Solar.Profile | null = null
    const authToken = props.cookies.get(AUTH_FIELD)?.value
    if (!!authToken) {
        currProfile = await getProfileByToken(authToken)
    }

    const isSelf = currProfile?.id === profile?.id

    return {
        profile: profile,
        currProfile: currProfile,
        isSelf,
        tab: tab || 'groups',
        followings: followings.length,
        followers: followers.length
    }
}

const getProfileData = async (handle: string) => {
    const doc = gql`query MyQuery {
         profiles: profiles(where:{handle:{_eq: "${handle}"}}) {
            handle
            id
            image_url
            nickname
            social_links
            about
         }
         followers: followings(where:{target:{handle: {_eq:"${handle}"}}}){id} 
         followings: followings(where:{source:{handle: {_eq:"${handle}"}}}){id} 
    }`

    return await request<{ profiles: ProfileDetail[], followers: Pick<Solar.ProfileSample, 'id'>[], followings: Pick<Solar.ProfileSample, 'id'>[]}>(process.env.NEXT_PUBLIC_GRAPH_URL!, doc)
}

