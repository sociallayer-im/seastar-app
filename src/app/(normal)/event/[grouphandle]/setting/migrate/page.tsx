import {redirect} from 'next/navigation'
import {getGroupDetailByName} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {analyzeGroupMembershipAndCheckProfilePermissions} from '@/utils'
import {getCurrProfile, selectLang} from '@/app/actions'
import GroupMigrateForm from './GroupMigrateForm'

interface Props {
    params: {grouphandle: string}
}

export default async function GroupMigratePage({params}: Props) {
    const groupDetail = await getGroupDetailByName({
        params: {groupName: params.grouphandle},
        clientMode: CLIENT_MODE
    })
    if (!groupDetail) redirect('/404')

    const currProfile = await getCurrProfile()
    const {isManager} = analyzeGroupMembershipAndCheckProfilePermissions(groupDetail, currProfile)
    if (!isManager) redirect(`/event/${params.grouphandle}/setting`)

    const {lang} = await selectLang()

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width-md min-h-[calc(100svh-48px)] px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Move Group']}</div>
            <div className="flex flex-col max-w-[800px] mx-auto">
                <GroupMigrateForm groupId={groupDetail.id} lang={lang}/>
            </div>
        </div>
    </div>
}
