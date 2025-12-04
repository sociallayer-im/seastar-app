import InvitePageData, { InvitePageDataProps } from '@/app/(normal)/invite/[inviteid]/data'
import { selectLang } from '@/app/actions'
import DialogInviteDetail from '@/components/client/DialogInviteDetail'

export default async function InvitePage(props: InvitePageDataProps) {
    const {
        inviteDetail,
        currProfile,
    } = await InvitePageData(props)
    const { lang } = await selectLang()

    return <div className="w-full min-h-[calc(100svh-48px)]">
        <div className="flex flex-row justify-center items-center min-h-[calc(100svh-48px)]">
            <DialogInviteDetail
                inviteDetail={inviteDetail}
                lang={lang}
            />
        </div>
    </div>
}