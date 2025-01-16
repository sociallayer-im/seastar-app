import {getProfileFollowerAndFollowing} from '@sola/sdk'
import {redirect} from 'next/navigation'

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