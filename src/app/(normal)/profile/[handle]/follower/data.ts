import {getProfileFollowerAndFollowing} from '@sola/sdk'
import {redirect} from 'next/navigation'
import {CLIENT_MODE} from '@/app/config'

export interface FollowerPageDataProps {
    params: {
        handle: string
    }
}

export async function FollowerPageData(props: FollowerPageDataProps) {
    const {params: {handle}} = props
    const data = await getProfileFollowerAndFollowing({
        params: {handle: handle},
        clientMode: CLIENT_MODE
    })

    if (!data.profile) {
        redirect('/error')
    }

    return data
}