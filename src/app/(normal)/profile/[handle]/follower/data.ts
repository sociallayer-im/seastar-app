import {type ClientMode, getProfileFollowerAndFollowing, setSdkConfig} from '@sola/sdk'
import {redirect} from 'next/navigation'

setSdkConfig({clientMode: process.env.NEXT_PUBLIC_CLIENT_MODE! as ClientMode})

export interface FollowerPageDataProps {
    params: {
        handle: string
    }
}

export async function FollowerPageData(props: FollowerPageDataProps) {
    const {params: {handle}} = props
    const data = await getProfileFollowerAndFollowing(handle)

    if (!data.profile) {
        redirect('/error')
    }

    return data
}