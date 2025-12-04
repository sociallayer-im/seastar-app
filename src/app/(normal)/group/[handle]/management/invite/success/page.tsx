
import { selectLang } from '@/app/actions'
import Avatar from '@/components/Avatar'
import { displayProfileName } from '@/utils'
import InviteQrcode from './InviteQrcode'
import InviteSuccessAction from './InviteSuccessAction'
import InviteSuccessData, { InviteSuccessDataProps } from '@/app/(normal)/group/[handle]/management/invite/success/data'

export async function generateMetadata(props: InviteSuccessDataProps) {
    const { group, role } = await InviteSuccessData(props)
    const { lang } = await selectLang()

    return {
        title: lang['Group Invite'],
        description: lang['Invite you to become [1] [2]']
            .replace('[1]', displayProfileName(group))
            .replace('[2]', role),
    }
}

export default async function InviteSuccess(props: InviteSuccessDataProps) {

    const { group, role, inviteDetail } = await InviteSuccessData(props)
    const { lang } = await selectLang()

    return <div className="min-h-[calc(100svh-48px)] w-full overflow-auto bg-[#f8f8f8]">
        <div className="page-width min-h-[calc(100svh-48px)] px-3 !pb-12 pt-0 justify-center items-center flex flex-col">
            <div className="py-6 font-semibold text-center text-xl">
                {lang['The invitation has been sent!']}
            </div>

            {
                inviteDetail?.receiver_address_type === 'code' ? (
                    <div
                        className="w-[330px] h-[420px] flex flex-col items-center justify-center rounded-lg border-white border-2 mx-auto bg-gray-100">
                        <div className="flex flex-row-item-center w-[80%] mx-auto">
                            <Avatar profile={group} size={48} className="mr-3" />

                            <div>
                                <div className='text-sm'>
                                    {lang['Invite you to become [1] [2]']
                                        .replace('[1]', displayProfileName(group))
                                        .replace('[2]', role)}
                                </div>
                            </div>
                        </div>
                        <div className="font-semibold text-xl mt-6">{lang['Scan the QR Code']}</div>
                        <div className="p-4 bg-white my-3 mx-0">
                            <InviteQrcode id={inviteDetail?.id?.toString() || ''} />
                        </div>
                    </div>
                ): <div className="text-center">
                    {lang["The other party has successfully joined the group"]}
                    </div>
            }
            <InviteSuccessAction groupHandle={group.handle} lang={lang} id={inviteDetail?.id} />
        </div>
    </div>
}