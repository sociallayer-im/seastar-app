import {selectLang} from "@/app/actions"
import {Input} from "@/components/shadcn/Input"
import {Button, buttonVariants} from "@/components/shadcn/Button"
import {Switch} from "@/components/shadcn/Switch"

export default async function EditTrackPage() {
    const {lang} = await selectLang()

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width-md min-h-[calc(100svh-48px)] px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Edit Track']}</div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Name of track']}</div>
                <Input className="w-full"/>
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Icon (optional)']}</div>
                <div className="mb-1 text-sm text-gray-500">{lang['Display on the schedule page']}</div>
                <div
                    className="cursor-pointer bg-secondary rounded-lg h-[170px] flex-col flex justify-center items-center mb-4">
                    <img className="w-[100px] h-[100px] rounded-full"
                        src={'/images/upload_default.png'} alt=""/>
                </div>
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Description (Optional)']}</div>
                <Input className="w-full"/>
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Visibility']}</div>
                <div
                    className={`flex-row-item-center justify-between border cursor-pointer p-2  rounded-lg mt-2 h-auto border-gray-200 w-full text-left hover:bg-gray-100`}>
                    <div>
                        <div className="text-sm font-semibold">Public</div>
                        <div className="text-gray-500 text-xs font-normal">
                            Everyone can view the event which selected this track.
                        </div>
                    </div>
                    <i className="flex-shrink-0 ml-2 uil-check-circle text-2xl text-green-500"/>
                </div>
                <div
                    className={`flex-row-item-center justify-between border cursor-pointer p-2  rounded-lg mt-2 h-auto border-gray-200 w-full text-left hover:bg-gray-100`}>
                    <div>
                        <div className="text-sm font-semibold">Private</div>
                        <div className="text-gray-500 text-xs font-normal">Select a private
                            event, the event you created can only be viewed through the
                            link,
                            and users can view the event in [My Event] page.
                        </div>
                    </div>
                    <i className="flex-shrink-0 ml-2 uil-circle text-2xl text-gray-500"/>
                </div>
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Available Date (Optional)']}</div>
                <div className="flex sm:flex-row flex-col flex-wrap ">
                    <div className="flex-row-item-center mb-3 flex-1">
                        <div className="w-16 text-center">From</div>
                        <Input className="w-full flex-1" placeholder={'YYYY/MM/DD'}/>
                    </div>
                    <div className="flex-row-item-center mb-3 flex-1">
                        <div className="w-16 text-center">To</div>
                        <Input className="w-full flex-1" placeholder={'YYYY/MM/DD'}/>
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Manager Setting']}</div>
                <div className="grid grid-cols-1 gap-3">
                    {
                        new Array(3).fill('').map((_, index) => {
                            return <div key={index} className="flex-row-item-center w-full">
                                <div
                                    className={`${buttonVariants({variant: 'secondary'})} flex-1 mr-3 flex !justify-start`}>
                                    <img className="w-6 h-6 rounded-full"
                                        src="/images/default_avatar/avatar_0.png" alt=""/>
                                    <div className="font-normal">
                                        zfd
                                    </div>
                                </div>
                                <i className="uil-minus-circle text-3xl text-gray-500 cursor-pointer"/>
                            </div>
                        })
                    }
                </div>
                <Button variant={'secondary'} className='mt-3'>
                    <i className="uil-plus-circle text-xl"/>
                    Add new Manager
                </Button>
            </div>

            <div className="mt-6 flex-row-item-center justify-center">
                <Button variant={'secondary'} className="mr-3 flex-1">{lang['Cancel']}</Button>
                <Button variant={'primary'} className="mr-3 flex-1">{lang['Save']}</Button>
            </div>
        </div>
    </div>
}