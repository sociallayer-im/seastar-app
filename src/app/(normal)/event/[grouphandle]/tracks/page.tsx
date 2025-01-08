import {selectLang} from "@/app/actions"
import {buttonVariants} from "@/components/shadcn/Button"

export default async function GroupTracksPage() {
    const {lang} = await selectLang()

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width-md min-h-[calc(100svh-48px)] px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Tracks']}</div>
            <div className="grid grid-cols-1 gap-3">
                {
                    new Array(10).fill('').map((_, index) => {
                        return <div key={index} className="flex-row-item-center w-full">
                            <a href={`/track/edit/${123}`}
                                className={`${buttonVariants({variant: 'secondary'})} flex-1 mr-3 justify-between`}>
                                <div className="font-normal">track {index}</div>
                                <i className="uil-edit-alt"/>
                            </a>
                            <i className="uil-minus-circle text-3xl text-gray-500 cursor-pointer"/>
                        </div>
                    })
                }
            </div>

            <a href={`/track/create`} className={`${buttonVariants({variant: 'secondary'})} mt-3`}>
                <i className="uil-plus-circle text-lg"/>
                {lang['Create a Track']}
            </a>
        </div>
    </div>
}