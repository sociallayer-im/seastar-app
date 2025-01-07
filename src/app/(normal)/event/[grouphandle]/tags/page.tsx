import {selectLang} from "@/app/actions"
import {Button} from "@/components/shadcn/Button"
import {Input} from "@/components/shadcn/Input"

export default async function GroupTracksPage() {
    const {lang} = await selectLang()

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width min-h-[calc(100svh-48px) px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Event Tags']}</div>
            <div className="mb-4">{lang['Event tags that creators can choose for their events.']}</div>
            <div className="grid grid-cols-1 gap-3">
                {
                    new Array(10).fill('').map((_, index) => {
                        return <div key={index} className="flex-row-item-center w-full">
                            <Input value={index} className="flex-1 mr-3" placeholder="Enter a tag"/>
                            <i className="uil-minus-circle text-3xl text-gray-500 cursor-pointer"/>
                        </div>
                    })
                }
            </div>

            <div className="flex-row-item-center w-full">
                <Input value={''} className="flex-1 mr-3 mt-3" placeholder="Enter a tag"/>
                <i className="uil-plus-circle text-3xl text-green-500 cursor-pointer"/>
            </div>

            <div className="mt-6 flex-row-item-center justify-center">
                <Button variant={'secondary'} className="mr-3">{lang['Cancel']}</Button>
                <Button variant={'primary'} className="mr-3">{lang['Save']}</Button>
            </div>
        </div>
    </div>
}