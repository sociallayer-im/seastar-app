export const dynamic = 'force-dynamic'

import {selectLang} from '@/app/actions'
import DiscoverPageData from '@/app/(normal)/discover/data'
import CommunityList from '@/components/CommunityList'

export default async function CommunitiesPage() {
    // `communities`, not `eventGroups`: this page is the full list, while
    // eventGroups is the featured/top-tagged curation slice. Reading the latter
    // meant an untagged group never appeared here — and on a deployment with no
    // tagged groups at all, the page was simply empty.
    const {communities} = await DiscoverPageData()
    const {lang} = await selectLang()

    return <div className="page-width min-h-[100svh] pt-0 sm:pt-6 !pb-16">
        <h2 className="text-2xl font-semibold mb-3 md:flex-row flex items-center justify-between flex-col">
            {lang['Communities']}
        </h2>

        <CommunityList communities={communities} lang={lang} />
    </div>
}
