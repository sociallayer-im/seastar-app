import {redirect} from 'next/navigation'
import {getGroupDetailByHandle} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {analyzeGroupMembershipAndCheckProfilePermissions} from '@/utils'
import {getCurrProfile} from '@/app/actions'
import {selectLang} from '@/app/actions'
import EmailMembersForm from './EmailMembersForm'

interface Props {
    params: {grouphandle: string}
}

export default async function EmailMembersPage({params}: Props) {
    const groupDetail = await getGroupDetailByHandle({
        params: {groupHandle: params.grouphandle},
        clientMode: CLIENT_MODE
    })
    if (!groupDetail) redirect('/404')

    const currProfile = await getCurrProfile()
    const {isManager} = analyzeGroupMembershipAndCheckProfilePermissions(groupDetail, currProfile)
    if (!isManager) redirect(`/event/${params.grouphandle}/setting`)

    const {lang} = await selectLang()
    const memberCount = groupDetail.memberships?.length ?? 0

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width-md min-h-[calc(100svh-48px)] px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">Email Members</div>
            <div className="flex flex-col max-w-[800px] mx-auto">
                <EmailMembersForm
                    groupId={groupDetail.id}
                    groupHandle={params.grouphandle}
                    memberCount={memberCount}
                    lang={lang}
                />
            </div>
        </div>
    </div>
}
