import Avatar from '@/components/Avatar'
import {displayProfileName} from '@/utils'
import {Community} from '@sola/sdk'
import ManagActions from '@/components/client/ManagActions'
import type {Dictionary} from '@/lang'

export interface CommunityListProps {
    communities: Community[]
    lang: Dictionary
    /**
     * Show the platform-admin curation controls on each card. The caller
     * decides, because it is the one holding the viewer's profile — the
     * backend independently strips these tags from non-admins, so a wrong
     * answer here leaks a button, not a capability.
     */
    showAdminActions?: boolean
}

// The community card grid, shared by the homepage section and /communities so
// the two can't drift apart — they were the same markup copied once already.
//
// Rendered in the order the API returned: the list is ordered server-side and
// re-sorting here would just be a second, competing opinion.
export default function CommunityList({communities, lang, showAdminActions}: CommunityListProps) {
    if (!communities.length) return null

    return <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-2">
        {communities.map(group =>
            // The group's event home, not its profile page — what someone
            // wants from a community is what it has on.
            <a key={group.id} href={`/event/${group.name}`}
               className="h-[200px] rounded shadow p-3 duration-200 hover:translate-y-[-6px] relative">
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

                {showAdminActions && <ManagActions group={group} lang={lang}/>}
            </a>
        )}
    </div>
}
