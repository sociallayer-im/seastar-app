import {selectLang} from "@/app/actions"
import {Button} from "@/components/shadcn/Button"

export default async function GroupEventPermissionPage() {
    const {lang} = await selectLang()

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width-md min-h-[calc(100svh-48px) px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Event Permission']}</div>


            <div className="font-semibold mb-1">{lang['Who can create events']}</div>
            <Button variant={'secondary'} className='w-full mb-3'>
                <div className="flex-row-item-center justify-between w-full">
                    <div className='font-normal'>Everyone</div>
                    <i className="uil-check-circle text-green-400 text-2xl"/>
                </div>
            </Button>
            <Button variant={'secondary'} className='w-full mb-3'>
                <div className="flex-row-item-center justify-between w-full">
                    <div className='font-normal'>Member, Manager, Owner</div>
                    <i className="uil-circle text-gray-500 text-2xl"/>
                </div>
            </Button>
            <Button variant={'secondary'} className='w-full mb-3'>
                <div className="flex-row-item-center justify-between w-full">
                    <div className='font-normal'>Manager, Owner</div>
                    <i className="uil-circle text-gray-500 text-2xl"/>
                </div>
            </Button>

            <div className="font-semibold mb-1 mt-4">{lang['Who can join events']}</div>
            <Button variant={'secondary'} className='w-full mb-3'>
                <div className="flex-row-item-center justify-between w-full">
                    <div className='font-normal'>Everyone</div>
                    <i className="uil-check-circle text-green-400 text-2xl"/>
                </div>
            </Button>
            <Button variant={'secondary'} className='w-full mb-3'>
                <div className="flex-row-item-center justify-between w-full">
                    <div className='font-normal'>Member, Manager, Owner</div>
                    <i className="uil-circle text-gray-500 text-2xl"/>
                </div>
            </Button>
            <Button variant={'secondary'} className='w-full mb-3'>
                <div className="flex-row-item-center justify-between w-full">
                    <div className='font-normal'>Manager, Owner</div>
                    <i className="uil-circle text-gray-500 text-2xl"/>
                </div>
            </Button>

            <div className="font-semibold mb-1 mt-4">{lang['Who can view events']}</div>
            <Button variant={'secondary'} className='w-full mb-3'>
                <div className="flex-row-item-center justify-between w-full">
                    <div className='font-normal'>Everyone</div>
                    <i className="uil-check-circle text-green-400 text-2xl"/>
                </div>
            </Button>
            <Button variant={'secondary'} className='w-full mb-3'>
                <div className="flex-row-item-center justify-between w-full">
                    <div className='font-normal'>Member, Manager, Owner</div>
                    <i className="uil-circle text-gray-500 text-2xl"/>
                </div>
            </Button>
            <Button variant={'secondary'} className='w-full mb-3'>
                <div className="flex-row-item-center justify-between w-full">
                    <div className='font-normal'>Manager, Owner</div>
                    <i className="uil-circle text-gray-500 text-2xl"/>
                </div>
            </Button>

            <div className="mt-6 flex-row-item-center justify-center">
                <Button variant={'secondary'} className="mr-3">{lang['Cancel']}</Button>
                <Button variant={'primary'} className="mr-3">{lang['Save']}</Button>
            </div>
        </div>
    </div>
}