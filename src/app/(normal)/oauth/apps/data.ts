import {redirect} from 'next/navigation'
import {getMyOauthApplications, OauthApplication} from '@sola/sdk'
import {getCurrProfile, getServerSideAuth} from '@/app/actions'
import {CLIENT_MODE} from '@/app/config'

export interface OauthAppsDataProps {
    applications: OauthApplication[]
}

export default async function OauthAppsData(): Promise<OauthAppsDataProps> {
    const authToken = await getServerSideAuth()
    const currProfile = await getCurrProfile()
    // Carry the destination through sign-in — middleware turns ?return=
    // into the cookie the auth screens read, so the user lands back here
    // instead of on the homepage.
    if (!authToken || !currProfile) redirect('/signin?return=/oauth/apps')

    return {
        applications: await getMyOauthApplications({params: {authToken}, clientMode: CLIENT_MODE})
    }
}
