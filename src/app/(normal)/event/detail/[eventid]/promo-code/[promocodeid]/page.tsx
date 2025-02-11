import {selectLang} from "@/app/actions"
import {Button} from "@/components/shadcn/Button"

export default async function PromoCodeDetail() {
    const {lang} = await selectLang()

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width-sm min-h-[calc(100svh-48px) px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl mb-4">{lang['Promo Code Detail']}</div>

            <div className="mb-4 flex-row-item-center justify-center">
                <div className="mr-3">{lang['Code']}</div>
                <div className="text-2xl flex-1 font-semibold w-[200px] shadow rounded-lg text-center py-3">
                    PROMO123
                </div>
                <Button variant="secondary" className='ml-3'>
                    <i className="uil-copy text-2xl text-green-500"/>
                </Button>
            </div>

            <div className="flex-row-item-center justify-between bg-secondary rounded-lg px-3 py-2 mb-0.5">
                <div>Amount Off</div>
                <div className="font-semibold">1 USD</div>
            </div>
            <div className="flex-row-item-center justify-between bg-secondary rounded-lg px-3 py-2 mb-0.5">
                <div>{lang['Valid date']}</div>
                <div className="font-semibold">123/12/112</div>
            </div>
            <div className="flex-row-item-center justify-between bg-secondary rounded-lg px-3 py-2 mb-0.5">
                <div>{lang['Remaining uses']}</div>
                <div className="font-semibold">1</div>
            </div>

            <div className="font-semibold mt-6">Usage history</div>
        </div>
    </div>
}