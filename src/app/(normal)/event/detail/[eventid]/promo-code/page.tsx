import {selectLang} from "@/app/actions"
import {buttonVariants} from "@/components/shadcn/Button"
import PomoCodePageData, {
    PromoCodePageProps
} from '@/app/(normal)/event/detail/[eventid]/promo-code/data'
import NoData from '@/components/NoData'

export default async function PromoCodeListPage(props: PromoCodePageProps) {
    const {lang} = await selectLang()
    const {eventDetail, coupons} = await PomoCodePageData(props)

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width-md min-h-[calc(100svh-48px) px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Promo Code']}</div>

            <div className="grid grid-cols-1 gap-3">
                <div className="font-semibold">{lang['Generate Promo Code']}: {coupons.length}</div>
                {coupons.length === 0 &&<NoData />}
                {
                    coupons.map((coupon, index) => {
                        let title = ''
                        if (coupon.discount_type === 'ratio') {
                            title = `${100 - coupon.discount / 100}% Off`
                        } else {
                            title = `$${coupon.discount / 100} USD Off`
                        }

                        return <a className={`${buttonVariants({variant: 'secondary'})} flex-1 justify-between !h-auto`}
                            href={`/event/detail/${eventDetail.id}/promo-code/${coupon.id}`}
                            key={index}>
                            <div className="flex-row-item-center justify-between w-full">
                                <div className="font-normal">
                                    <div className="font-semibold">{title}</div>
                                    <div className="text-sm">{coupon.label}</div>
                                </div>
                                <i className="uil-arrow-right text-2xl"/>
                            </div>
                        </a>
                    })
                }
            </div>
            <a href={`/event/detail/${eventDetail.id}/promo-code/generate`} className={`${buttonVariants({variant: 'secondary'})} mt-3`}>
                <i className="uil-plus-circle text-lg"/>
                {lang['Generate Promo Code']}
            </a>
        </div>
    </div>
}