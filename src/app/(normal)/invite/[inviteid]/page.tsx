import {awaitProps, AsyncProps} from '@/utils'
import InvitePageData, { InvitePageDataProps } from '@/app/(normal)/invite/[inviteid]/data'
import { selectLang } from '@/app/actions'
import DialogInviteDetail from '@/components/client/DialogInviteDetail'

export default async function InvitePage(props: AsyncProps<InvitePageDataProps>) {
    const {
        inviteDetail,
        currProfile,
        code,
    } = await InvitePageData(await awaitProps(props))
    const { lang } = await selectLang()

    return <div className="w-full min-h-[calc(100svh-48px)]">
        <div className="flex flex-row justify-center items-center min-h-[calc(100svh-48px)]">
            <DialogInviteDetail
                inviteDetail={inviteDetail}
                lang={lang}
                code={code}
            />
        </div>
    </div>
}