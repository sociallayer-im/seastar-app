import VoucherPageData, {VoucherPageDataProps} from '@/app/(normal)/voucher/[voucherid]/data'
import {selectLang} from '@/app/actions'
import DialogVoucherDetails from '@/components/client/DialogVoucherDetail'

export default async function VoucherPage(props: VoucherPageDataProps) {
    const {
        voucher,
        voucherCode,
        currProfile,
        receiver
    } = await VoucherPageData(props)
    const {lang} = await selectLang()

    return <div className="w-full min-h-[calc(100svh-48px)]">
        <div className="flex flex-row justify-center items-center min-h-[calc(100svh-48px)]">
            <DialogVoucherDetails
                receiver={receiver}
                currProfile={currProfile}
                voucherCode={voucherCode}
                voucherDetail={voucher}
                lang={lang}/>
        </div>
    </div>
}