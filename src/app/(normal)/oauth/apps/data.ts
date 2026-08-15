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
    if (!authToken || !currProfile) redirect('/signin')

    return {
        applications: await getMyOauthApplications({params: {authToken}, clientMode: CLIENT_MODE})
    }
}
