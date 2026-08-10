export const dynamic = 'force-dynamic'

import {getCurrProfile, selectLang} from '@/app/actions'
import {getGroupDirectory} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {isPlatformAdmin} from '@/utils'
import CommunityList from '@/components/CommunityList'
import NoData from '@/components/NoData'

export async function generateMetadata() {
    const {lang} = await selectLang()
    return {
        title: `${lang['Communities']} | ${process.env.NEXT_PUBLIC_APP_TITLE || 'Social Layer'}`
    }
}

export default async function CommunitiesPage() {
    // The full directory, not the homepage's `communities` — that one is only
    // the pin-tagged slice, so an untagged group appeared in no list at all and
    // an admin had no way to reach it in order to pin it.
    const communities = await getGroupDirectory({clientMode: CLIENT_MODE})
    const currProfile = await getCurrProfile()
    const {lang} = await selectLang()

    return <div className="page-width min-h-[100svh] pt-0 sm:pt-6 !pb-16">
        <h2 className="text-2xl font-semibold mb-3 md:flex-row flex items-center justify-between flex-col">
            <div>{lang['Communities']}</div>
            <div className="text-sm font-normal">{communities.length}</div>
        </h2>

        <CommunityList
            communities={communities}
            lang={lang}
            showAdminActions={isPlatformAdmin(currProfile)}/>

        {!communities.length && <NoData/>}
    </div>
}
