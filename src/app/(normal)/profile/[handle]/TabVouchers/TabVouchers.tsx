import {ProfileVoucherData} from "@/app/(normal)/profile/[handle]/TabVouchers/data"
import NoData from "@/components/NoData"

export default async function TabVouchers(props: {handle: string}) {
    const {vouchers} = await ProfileVoucherData(props.handle)

    return <div className="py-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 py-4">
            {vouchers.map((voucher, i) => {
                return <a key={i} href={`/voucher/${voucher.id}`}
                    className="h-[182px] bg-white shadow rounded-2xl shadow-badge p-2 cursor-pointer duration-200 hover:translate-y-[-6px]">
                    <div
                        className="bg-gray-100 flex flex-row items-center justify-center h-[130px] rounded-2xl relative overflow-auto">
                        <img className="w-[90px] h-[90px] rounded-full"
                            src={voucher.badge_class.image_url!} alt=""/>
                    </div>
                    <div
                        className="font-semibold overflow-hidden overflow-ellipsis whitespace-nowrap text-center p-2">
                        {voucher.badge_class.title!}
                    </div>
                </a>
            })
            }
        </div>
        {!vouchers.length && <NoData />}
    </div>
}
