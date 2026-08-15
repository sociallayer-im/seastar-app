import {redirect} from 'next/navigation'
import {getMyOauthGrants, OauthGrant} from '@sola/sdk'
import {getCurrProfile, getServerSideAuth} from '@/app/actions'
import {CLIENT_MODE} from '@/app/config'

export interface OauthGrantsDataProps {
    grants: OauthGrant[]
}

export default async function OauthGrantsData(): Promise<OauthGrantsDataProps> {
    const authToken = await getServerSideAuth()
    const currProfile = await getCurrProfile()
    if (!authToken || !currProfile) redirect('/signin')

    return {
        grants: await getMyOauthGrants({params: {authToken}, clientMode: CLIENT_MODE})
    }
}
