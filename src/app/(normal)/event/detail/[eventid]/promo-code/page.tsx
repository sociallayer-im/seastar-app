import {selectLang} from "@/app/actions"
import {buttonVariants} from "@/components/shadcn/Button"

export default async function PromoCodeListPage() {
    const {lang} = await selectLang()

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width-md min-h-[calc(100svh-48px) px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Promo Code']}</div>

            <div className="grid grid-cols-1 gap-3">
                {
                    new Array(3).fill('').map((_, index) => {
                        return <a className={`${buttonVariants({variant: 'outline'})} border-gray-300`}
                            href={`/event/detail/${'123'}/promo-code/${123}`}
                            key={index}>
                            <div className="flex-row-item-center justify-between w-full">
                                <div className="font-normal">Promo Code {index}</div>
                                <i className="uil-arrow-right text-2xl"/>
                            </div>
                        </a>
                    })
                }
            </div>
        </div>
    </div>
}