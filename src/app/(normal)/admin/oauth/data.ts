import {redirect} from 'next/navigation'
import {getAllOauthApplications, OauthApplicationAdmin} from '@sola/sdk'
import {getCurrProfile, getServerSideAuth} from '@/app/actions'
import {CLIENT_MODE} from '@/app/config'
import {isPlatformAdmin} from '@/utils'

export interface AdminOauthDataProps {
    applications: OauthApplicationAdmin[]
    total: number
}

export default async function AdminOauthData(query?: string): Promise<AdminOauthDataProps> {
    const authToken = await getServerSideAuth()
    const currProfile = await getCurrProfile()
    // A courtesy gate only — the API answers 403 to a non-admin regardless, so
    // this saves a wasted round trip rather than providing the authorization.
    if (!authToken || !isPlatformAdmin(currProfile)) redirect('/404')

    const res = await getAllOauthApplications({
        params: {authToken, q: query, limit: 100},
        clientMode: CLIENT_MODE
    })
    return {applications: res.data, total: res.meta.total}
}
