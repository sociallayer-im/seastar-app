import {selectLang} from "@/app/actions"

export default async function NotificationsPage() {
    const {lang} = await selectLang()
    
    return <div className="max-w-[500px] mx-auto w-full pb-12">
        <div className="py-6 font-semibold text-center text-xl">{lang['Notifications']}</div>
        <div className="grid grid-cols-1 gap-2">
            {new Array(10).fill(0).map((_, i) =>
                <div className="flex flex-col cursor-pointer border-b-[1px] pb-4" key={i}>
                    <div className="flex-row-item-center mb-2 justify-between">
                        <div className="flex-row-item-center">
                            <img src="/images/default_avatar/avatar_1.png"
                                className="w-6 h-6 rounded-full mr-2" alt=""/>
                            <div className="text-sm">
                                <span>zfd</span>
                                <span className="text-gray-500 ml-2">TUE, NOV 26, 01:28 PM</span>
                            </div>
                        </div>
                        <i className="bg-red-400 w-3 h-3 rounded-full"/>
                    </div>
                    <div>zfd Send you a badge.</div>
                </div>)
            }
        </div>
    </div>
}