import ShareVoucherPageData, {ShareVoucherPageDataProps} from "@/app/(normal)/voucher/[voucherid]/share/data"
import {selectLang} from "@/app/actions"
import VoucherQRCode from "@/app/(normal)/voucher/[voucherid]/share/VoucherQRCode"
import ShareVoucherAction from "@/app/(normal)/voucher/[voucherid]/share/ShareVoucherAction"

export default async function ShareVoucherPage(props: ShareVoucherPageDataProps) {
    const {voucher} = await ShareVoucherPageData(props)
    const {lang} = await selectLang()

    return <div className="min-h-[calc(100svh-48px)] w-full overflow-auto bg-[#f8f8f8]">
        <div className="page-width min-h-[calc(100svh-48px)] px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Share']}</div>

            <div
                className="w-[330px] h-[420px] flex flex-col items-center justify-center rounded-lg border-white border-2 mx-auto bg-gray-100">
                <div className="flex flex-row-item-center w-[80%] mx-auto">
                    <img src={voucher.badge_class.image_url!}
                        className="w-12 h-12 rounded-full mr-3"
                        alt=""/>
                    <div>
                        <div className='font-semibold'>{voucher.badge_class.title}</div>
                        <div className='text-sm'>
                            {voucher.sender.nickname || voucher.sender.handle} {lang['send you a badge']}
                        </div>
                    </div>
                </div>
                <div className="font-semibold text-xl mt-6">{lang['Scan the QR Code']}</div>
                <div className="p-4 bg-white my-3 mx-0">
                    <VoucherQRCode voucherId={voucher.id} code={''} />
                </div>
            </div>

            <ShareVoucherAction
                lang={lang}
                voucherId={voucher.id}
                code={''}
                badgeName={voucher.badge_class.title}
                profileHandle={voucher.sender.handle}
            />
        </div>
    </div>
}