import {selectLang} from "@/app/actions"
import {Input} from "@/components/shadcn/Input"
import {Button} from "@/components/shadcn/Button"

export default async function GroupBannerPage() {
    const {lang} = await selectLang()
    
    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width-md min-h-[calc(100svh-48px) px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Banner']}</div>
            <div className="font-semibold mb-1">{lang['Image']}</div>
            <div
                className="cursor-pointer bg-secondary rounded-lg h-[170px] flex-col flex justify-center items-center mb-4">
                <img className="w-[100px] h-[100px] rounded-full"
                    src={'/images/upload_default.png'} alt=""/>
            </div>

            <div className="font-semibold mb-1">{lang['Link']}</div>
            <Input className="w-full mb-4"/>

            <div className="mt-6 flex-row-item-center justify-center">
                <Button variant={'secondary'} className="mr-3">{lang['Cancel']}</Button>
                <Button variant={'primary'} className="mr-3">{lang['Save']}</Button>
            </div>
        </div>
    </div>
}