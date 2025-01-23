import {getEventGroups} from '@sola/sdk'
import Avatar from '@/components/Avatar'
import {displayProfileName} from '@/utils'
import {selectLang} from '@/app/actions'
import DiscoverPageData from '@/app/(normal)/discover/data'

export default async function CommunitiesPage() {
    const {eventGroups} = await DiscoverPageData()
    const {lang} = await selectLang()

    return <div className="page-width min-h-[100svh] pt-0 sm:pt-6 !pb-16">
        <h2 className="text-2xl font-semibold mb-3 md:flex-row flex items-center justify-between flex-col">
            Communities
        </h2>

        <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-2">
            {eventGroups.map((group, index) => {
                return <a key={index} href={`/group/${group.handle}`}
                          className="h-[200px] rounded shadow p-3 duration-200 hover:translate-y-[-6px]">
                    <Avatar profile={group} size={64} className="object-cover"/>
                    <div className="webkit-box-clamp-2 text-lg font-semibold leading-5 h-10 mb-4 mt-2">
                        {displayProfileName(group)}
                    </div>

                    <div className="text-sm"><strong className="mr-1">
                        {(group as any).memberships_count}</strong>{lang['Members']}</div>
                    <div className="text-sm"><strong className="mr-1">
                        {(group as any).events_count}</strong>{lang['Events']}</div>
                </a>
            })
            }
        </div>
    </div>
}
