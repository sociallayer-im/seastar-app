import {redirect} from "next/navigation"
import {getInviteDetailByInviteId} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {getServerSideAuth} from '@/app/actions'
import {getCurrProfile} from '@/app/actions'

export interface InvitePageParams {
    inviteid: string
}

export interface InvitePageDataProps {
    params: InvitePageParams
    searchParams: { code?: string }
}

export default async function InvitePageData({params, searchParams}: InvitePageDataProps) {
    const {inviteid} = params
    const authToken = await getServerSideAuth()
    if (!authToken) {
        redirect('/404')
    }
    const inviteDetail = await getInviteDetailByInviteId({
        params: {inviteId: inviteid, authToken},
        clientMode: CLIENT_MODE
    })

    if (!inviteDetail) {
        redirect('/404')
    }

    const currProfile = await getCurrProfile()

    return {
        inviteDetail,
        currProfile,
        code: searchParams.code || null
    }
}


