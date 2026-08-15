import {selectLang} from '@/app/actions'
import OauthAppsData from '@/app/(normal)/oauth/apps/data'
import OauthApps from '@/app/(normal)/oauth/apps/OauthApps'

/**
 * The developer portal. Any signed-in user may register a client and activate
 * it themselves — there is no review step (design/OAUTH_PROVIDER_PLAN.md §8).
 * The guards that would live in a review live in the API instead: reserved
 * names, a per-user cap, and https-only redirect URIs.
 */
export default async function OauthAppsPage() {
    const {lang} = await selectLang()
    const {applications} = await OauthAppsData()

    return <div className="page-width min-h-[calc(100svh-48px)] py-6">
        <OauthApps lang={lang} applications={applications}/>
    </div>
}
