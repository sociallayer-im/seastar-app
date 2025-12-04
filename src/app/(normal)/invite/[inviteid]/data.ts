import {redirect} from "next/navigation"
import {getInviteDetailByInviteId} from '@sola/sdk'
import {getCurrProfile} from '@/app/actions'

export interface InvitePageParams {
    inviteid: string
}

export interface InvitePageDataProps {
    params: InvitePageParams
}

export default async function InvitePageData({params}: InvitePageDataProps) {
    const {inviteid} = params
    const inviteDetail = await getInviteDetailByInviteId(parseInt(inviteid))

    if (!inviteDetail) {
        redirect('/404')
    }

    const currProfile = await getCurrProfile()

    return {
        inviteDetail,
        currProfile
    }
}


