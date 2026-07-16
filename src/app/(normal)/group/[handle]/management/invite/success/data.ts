import {getGroupDetailByName, getInviteDetailByInviteId, InviteDetail} from '@sola/sdk'
import {redirect} from 'next/navigation'
import {pickSearchParam} from '@/utils'
import {CLIENT_MODE} from '@/app/config'
import {getServerSideAuth} from '@/app/actions'

export type InviteSuccessSearchParams = { role?: string | string[], id?: string | string[] }

export type InviteSuccessDataProps = {
    searchParams: InviteSuccessSearchParams,
    params: { handle: string },
}

export default async function InviteSuccessData({searchParams, params}: InviteSuccessDataProps) {
    const roleType = pickSearchParam(searchParams.role) || 'member'
    const inviteId = pickSearchParam(searchParams.id) || null
    const handle = params.handle

    const groupsDetail = await getGroupDetailByName({
        params: {groupName: handle},
        clientMode: CLIENT_MODE
    })

    let inviteDetail: InviteDetail | null = null
    
    if (inviteId) {
        const authToken = await getServerSideAuth()
        if (authToken) {
            inviteDetail = await getInviteDetailByInviteId({
                params: {inviteId, authToken},
                clientMode: CLIENT_MODE
            })
        }
    }

    if (!groupsDetail) {
        redirect('/404')
    }


    return {group: groupsDetail, role: roleType, inviteDetail}
}