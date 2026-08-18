import {selectLang} from '@/app/actions'
import AdminOauthData from '@/app/(normal)/admin/oauth/data'
import AdminOauthList from '@/app/(normal)/admin/oauth/AdminOauthList'
import {pickSearchParam} from '@/utils'

/**
 * Every registered OAuth client, for platform admins.
 *
 * Because registration is not reviewed, `Disable` here is the platform's only
 * lever against an app already in the wild — and it burns that app's live
 * tokens rather than merely blocking new authorizations.
 */
export default async function AdminOauthPage(props: {searchParams?: Promise<{q?: string | string[]}>}) {
    const searchParams = await props.searchParams
    const {lang} = await selectLang()
    const query = pickSearchParam(searchParams?.q)
    const {applications, total} = await AdminOauthData(query)

    return <div className="page-width min-h-[calc(100svh-48px)] py-6">
        <AdminOauthList lang={lang} applications={applications} total={total} query={query || ''}/>
    </div>
}
