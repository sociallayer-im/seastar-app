import GroupEditPageData, {GroupDataProps} from "@/app/(normal)/group/[handle]/data"
import {selectLang} from "@/app/actions"
import {displayProfileName} from '@/utils'
import Avatar from '@/components/Avatar'
import RemoveManagerBtn from '@/app/(normal)/group/[handle]/management/manager/RemoveManagerBtn'

export const fetchCache = 'force-no-store'

export async function generateMetadata(props: GroupDataProps) {
    const {group} = await GroupEditPageData(props)
    return {
        title: `Manager Management | ${group.nickname || group.handle}`
    }
}

export default async function ManagerManagementPage(props: GroupDataProps) {
    const {members, group} = await GroupEditPageData(props)
    const lang = (await selectLang()).lang

    const managers = members.filter(member => member.role === 'manager')
    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width h-[calc(100svh-48px)] px-3 pb-12 pt-0 flex flex-col">
            <div className="py-6 font-semibold text-center text-xl">{lang['Manager Management']}</div>

            <div
                className="flex flex-row items-center w-full max-w-[800px] mx-auto mb-3 rounded-lg bg-amber-50 p-2 text-sm text-amber-400">
                <i className="uil-info-circle mr-2 text-3xl"/>
                <div>
                    <div className="font-semibold">{lang['The group manager has the following permissions:']}</div>
                    <div className="text-xs">{lang['1. Send the created badge to others']}</div>
                    <div className="text-xs">{lang['2. Manage the badge of group']}</div>
                    <div className="text-xs">{lang['3. Edit the group profile']}</div>
                    <div className="text-xs">{lang['4. Remove group member']}</div>
                </div>
            </div>

            <div className="w-full max-w-[800px] mx-auto">
                <a
                    href={`/group/${group.handle}/management/manager/add`}
                    className="mb-3 justify-between cursor-pointer flex-row-item-center shadow rounded-lg px-6 h-[60px] duration-300 hover:bg-secondary">
                    <div className="flex-row-item-center">
                        <i className="uil-plus-circle text-3xl mr-2 text-green-500"/>
                        <div className="font-semibold">{lang['Add a manager']}</div>
                    </div>
                </a>
                {managers.map((manager, i) => {
                    return <div key={i}
                                className="mb-3 justify-between cursor-pointer flex-row-item-center shadow rounded-lg px-6 h-[60px] duration-300 hover:bg-secondary">
                        <div className="flex-row-item-center">
                            <Avatar size={28} className="mr-2" profile={manager.profile}/>
                            <div>{displayProfileName(manager.profile)}</div>
                        </div>
                        <RemoveManagerBtn
                            lang={lang}
                            groupId={group.id}
                            profileId={manager.profile.id}/>
                    </div>
                })
                }
            </div>
        </div>
    </div>
}