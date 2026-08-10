import Avatar from '@/components/Avatar'
import {displayProfileName} from '@/utils'
import {Community} from '@sola/sdk'
import type {Dictionary} from '@/lang'

export interface CommunityListProps {
    communities: Community[]
    lang: Dictionary
}

// The community card grid, shared by the homepage section and /communities so
// the two can't drift apart — they were the same markup copied once already.
//
// Rendered in the order the API returned: the list is ordered server-side and
// re-sorting here would just be a second, competing opinion.
export default function CommunityList({communities, lang}: CommunityListProps) {
    if (!communities.length) return null

    return <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-2">
        {communities.map(group =>
            <a key={group.id} href={`/group/${group.name}`}
               className="h-[200px] rounded shadow p-3 duration-200 hover:translate-y-[-6px]">
                <Avatar profile={group} size={64} className="object-cover"/>
                <div className="webkit-box-clamp-2 text-lg font-semibold leading-5 h-10 mb-4 mt-2">
                    {displayProfileName(group)}
                </div>

                <div className="text-sm">
                    <strong className="mr-1">{group.memberships_count ?? 0}</strong>{lang['Members']}
                </div>
                <div className="text-sm">
                    <strong className="mr-1">{group.events_count ?? 0}</strong>{lang['Events']}
                </div>
            </a>
        )}
    </div>
}
