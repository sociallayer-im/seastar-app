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
    // Carry the destination through sign-in — middleware turns ?return=
    // into the cookie the auth screens read, so the user lands back here
    // instead of on the homepage.
    if (!authToken || !currProfile) redirect('/signin?return=/oauth/grants')

    return {
        grants: await getMyOauthGrants({params: {authToken}, clientMode: CLIENT_MODE})
    }
}
