import type {Metadata} from 'next'
import {redirect} from 'next/navigation'
import {selectLang} from '@/app/actions'
import OauthAuthorizeData from '@/app/(auth)/oauth/authorize/data'
import ConsentForm from '@/app/(auth)/oauth/authorize/ConsentForm'

// A consent screen is per-request and carries a third party's parameters in
// its URL; there is nothing here for a crawler.
export const metadata: Metadata = {robots: {index: false, follow: false}}

/**
 * The OAuth consent screen. Reached either directly (a client that knows the
 * web origin) or via soon's GET /oauth/authorize, which 302s here carrying the
 * query string — that redirect is what lets a stock OIDC client library work
 * against sola unmodified.
 *
 * Registration is not reviewed (design/OAUTH_PROVIDER_PLAN.md §8), so this page
 * is the only thing between a user and a client that has named itself something
 * reassuring. That is why it leads with who owns the app and where the data is
 * being sent, rather than with the app's own name.
 */
export default async function OauthAuthorizePage(
    props: {
        searchParams: Promise<Record<string, string | string[] | undefined>>
    }
) {
    const searchParams = await props.searchParams
    const {lang, type: langType} = await selectLang()
    const data = await OauthAuthorizeData(searchParams)

    // Not signed in: send them through the normal sign-in flow and come back
    // here with the same query string. Deliberately after the backend has
    // validated the request — bouncing a malformed one through sign-in first
    // would waste the user's time on a request that can only fail.
    if (data.info && !data.authToken) {
        const params = new URLSearchParams(
            Object.entries(searchParams).flatMap(([k, v]) =>
                v === undefined ? [] : [[k, Array.isArray(v) ? v[0] : v] as [string, string]]
            )
        )
        redirect(`/signin?return=${encodeURIComponent(`/oauth/authorize?${params.toString()}`)}`)
    }

    if (!data.info) {
        return <div className="w-full min-h-[calc(100svh-48px)] flex flex-col justify-center items-center px-4">
            <div className="max-w-[420px] w-full bg-[var(--background)] rounded-lg shadow p-6 text-center">
                <div className="text-lg font-semibold mb-2">{lang['Authorization failed']}</div>
                <div className="text-sm text-gray-500 break-words">{data.errorDescription || data.error}</div>
                <div className="text-xs text-gray-400 mt-4 font-mono">{data.error}</div>
            </div>
        </div>
    }

    return <div className="w-full min-h-[calc(100svh-48px)] flex flex-col justify-center items-center px-4 py-8">
        <ConsentForm lang={lang} langType={langType} query={data.query} info={data.info}/>
    </div>
}
