import {selectLang} from "@/app/actions"
import {Input} from "@/components/shadcn/Input"
import {Button} from "@/components/shadcn/Button"
import {Switch} from "@/components/shadcn/Switch"

export default async function EditVenuePage() {
    const {lang} = await selectLang()

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width-md min-h-[calc(100svh-48px)] px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Edit Venue']}</div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Name of venue']}</div>
                <Input className="w-full"/>
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Default location']}</div>
                <Input className="w-full"/>
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Description (Optional)']}</div>
                <Input className="w-full"/>
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Link (Optional)']}</div>
                <Input className="w-full"/>
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
                <div className="font-semibold mb-1">{lang['Visibility']}</div>
                <Button variant={'secondary'} className="w-full mb-3">
                    <div className="flex-row-item-center justify-between w-full">
                        <div className="font-normal">Everyone</div>
                        <i className="uil-check-circle text-green-400 text-2xl"/>
                    </div>
                </Button>
                <Button variant={'secondary'} className='w-full mb-3'>
                    <div className="flex-row-item-center justify-between w-full">
                        <div className="font-normal">Manager</div>
                        <i className="uil-circle text-gray-300 text-2xl"/>
                    </div>
                </Button>
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Venue Capacity (Optional)']}</div>
                <Input className="w-full"/>
            </div>

            <div className="mb-4 flex-row-item-center justify-between">
                <div className="font-semibold mb-1">{lang['Require Approval (Optional)']}</div>
                <Switch checked={false}/>
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-2">{lang['Opening Hours']}</div>
                <div
                    className="flex-row-item-center justify-between w-full border border-gray-200 rounded-lg  px-3 py-2 mb-2">
                    <div>
                        <div className="text-sm font-semibold mb-1">Opening Hours 7/24</div>
                        <div className="text-xs text-gray-500">Open all the time</div>
                    </div>
                    <i className="uil-check-circle text-green-500 text-2xl"/>
                </div>

                <div
                    className="w-full border border-gray-200 rounded-lg px-3 py-3">
                    <div className="flex-row-item-center justify-between w-full">
                        <div>
                            <div className="text-sm font-semibold mb-1">Timeslots</div>
                            <div className="text-xs text-gray-500">Opening within specific timeslots</div>
                        </div>
                        <i className="uil-circle text-gray-300 text-2xl"/>
                    </div>

                    {
                        new Array(3).fill('').map((_, index) => {
                            return <div key={index} className="mt-3 border rounded-lg p-3">
                                <div className="flex-row-item-center justify-between  text-sm">
                                    <div className="font-semibold">Monday</div>
                                    <div className="flex-row-item-center">
                                        <div className="mr-2">Closed</div>
                                        <Switch />
                                    </div>
                                </div>
                                {
                                    new Array(3).fill('').map((_, i) => {
                                        return <div key={i}
                                            className="flex flex-row items-center pb-3 px-2 mt-3 rounded bg-gray-50">
                                            <div
                                                className="flex sm:flex-row flex-col flex-wrap sm:items-center flex-1 mr-2">
                                                <div className="flex-row-item-center mt-3 flex-1 text-sm">
                                                    <div className="w-16 text-center">From</div>
                                                    <Input className="w-full flex-1" inputSize={'md'}
                                                        placeholder={'YYYY/MM/DD'}/>
                                                </div>
                                                <div className="flex-row-item-center mt-3 flex-1 text-sm">
                                                    <div className="w-16 text-center">To</div>
                                                    <Input className="w-full flex-1" inputSize={'md'}
                                                        placeholder={'YYYY/MM/DD'}/>
                                                </div>
                                                <div className="flex-row-item-center mt-3 flex-1 text-sm">
                                                    <div className="w-16 text-center">For</div>
                                                    <Input className="w-full flex-1" inputSize={'md'}
                                                        placeholder={'role'}/>
                                                </div>
                                            </div>

                                            <i className="uil-minus-circle text-gray-300 text-3xl mt-3 "/>
                                        </div>
                                    })
                                }
                            </div>
                        })
                    }
                </div>
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Overrides']}</div>
                <Input className="w-full"/>
            </div>
        </div>
    </div>
}