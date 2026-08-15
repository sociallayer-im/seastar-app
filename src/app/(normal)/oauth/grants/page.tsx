import {selectLang} from '@/app/actions'
import OauthGrantsData from '@/app/(normal)/oauth/grants/data'
import OauthGrants from '@/app/(normal)/oauth/grants/OauthGrants'

/**
 * "Which third-party apps can see my data, and stop that one." Revoking here
 * also destroys the tokens the consent already produced — otherwise revoking
 * would only block future authorizations while the app kept calling the API
 * with what it already holds.
 */
export default async function OauthGrantsPage() {
    const {lang, type: langType} = await selectLang()
    const {grants} = await OauthGrantsData()

    return <div className="page-width min-h-[calc(100svh-48px)] py-6">
        <OauthGrants lang={lang} langType={langType} grants={grants}/>
    </div>
}
