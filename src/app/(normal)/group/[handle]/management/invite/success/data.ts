import {getGroupDetailByHandle} from '@sola/sdk'
import {redirect} from 'next/navigation'
import {pickSearchParam} from '@/utils'
import {CLIENT_MODE} from '@/app/config'

export type InviteSuccessSearchParams = { role?: string | string[] }

export type InviteSuccessDataProps = {
    searchParams: InviteSuccessSearchParams,
    params: { handle: string },
}

export default async function InviteSuccessData({searchParams, params}: InviteSuccessDataProps) {
    const roleType = pickSearchParam(searchParams.role) || 'member'
    const handle = params.handle

    const groupsDetail = await getGroupDetailByHandle({
        params: {groupHandle: handle},
        clientMode: CLIENT_MODE
    })

    if (!groupsDetail) {
        redirect('/404')
    }


    return {group: groupsDetail, role: roleType}
}