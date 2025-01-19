import {getGroupDetailByHandle, getInviteDetailByInviteId} from '@sola/sdk'
import {redirect} from 'next/navigation'
import {pickSearchParam} from '@/utils'

export type InviteSuccessSearchParams = {role?: string | string[]}

export type InviteSuccessDataProps = {
    searchParams: InviteSuccessSearchParams,
    params: {handle: string},
}

export default async function InviteSuccessData({searchParams, params}: InviteSuccessDataProps) {
    const roleType = pickSearchParam(searchParams.role) || 'member'
    const handle = params.handle

    const groupsDetail = await getGroupDetailByHandle(handle)

    if (!groupsDetail) {
        redirect('/404')
    }



    return {group: groupsDetail, role: roleType}
}