import {ProfileVoucherData} from "@/app/(normal)/profile/[handle]/TabVouchers/data"
import NoData from "@/components/NoData"
import CardVoucher from '@/components/client/CardVoucher'
import {selectLang} from '@/app/actions'

export default async function TabVouchers(props: {handle: string}) {
    const vouchers = await ProfileVoucherData(props.handle)
    const {lang} = await selectLang()

    return <div className="py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4">
            {vouchers.map((voucher, i) => {
                return <CardVoucher voucher={voucher} key={i} lang={lang}/>
            })}
        </div>
        {!vouchers.length && <NoData />}
    </div>
}
