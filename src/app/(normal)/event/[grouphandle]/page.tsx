import {Input} from '@/components/shadcn/Input'
import {Button, buttonVariants} from "@/components/shadcn/Button"
import {getLabelColor} from "@/utils/label_color"
import CardEvent from "@/components/CardEvent"
import {GroupEventListData} from "@/app/(normal)/group/[handle]/TabEvents/data"
import {Badge} from "@/components/shadcn/Badge"

export default async function EventHome() {
    const events = await GroupEventListData('woochiangmai')

    return <div style={{background: '#fff url(/images/event_home_bg.png) top center repeat-x'}}>
        <div className="page-width min-h-[100svh] !pt-3 !sm:pt-6 flex-col flex md:flex-row">
            <div className="flex-1 order-2 md:order-1">
                <div className="flex-row-item-center">
                    <a href="?tab=upcoming" className="relative mr-4 font-semibold text-2xl">
                        Upcoming
                        <img src="/images/title_hightlight.png"
                            className="absolute left-0 top-0 translate-x-[-12px]" alt=""/>
                    </a>
                    <a href="?tab=past" className="relative mr-4">
                        Past
                    </a>
                    <a href="?tab=private" className="relative mr-4">
                        Private
                    </a>
                </div>

                <div className="flex-row-item-center my-3">
                    <Input
                        className="flex-1"
                        startAdornment={<i className="uil-search text-lg"/>}
                        placeholder={'Search...'}/>
                    <Button variant="outline" className="ml-3">
                        <i className="uil-filter text-lg"/>
                    </Button>
                    <Button variant="outline" className="ml-3">
                        <i className="uil-calender text-lg"/>
                    </Button>
                    <Button variant="outline" className="ml-3">
                        <i className="uil-rss text-lg mt-[-2px] translate-x-0.5"/>
                    </Button>
                </div>

                <div className="flex flex-row flex-wrap my-3">
                    <Button
                        variant="outline"
                        size={'sm'}
                        className="mr-2 mt-1">
                        <div className="text-xs font-normal">
                            <div className="font-semibold">All Tags</div>
                        </div>
                    </Button>
                    {new Array(4).fill('').map((t, index) => {
                        const color = getLabelColor(Math.random() * 100 + '')
                        const themeStyle = {
                            color: color,
                            borderColor: color
                        }
                        return <Button
                            variant="outline"
                            size={'sm'}
                            className="mr-2 mt-1"
                            style={themeStyle}
                            key={t.id}>
                            <div className="text-xs font-normal">
                                <div className="font-semibold">Tag {index}</div>
                            </div>
                        </Button>
                    })}
                </div>

                <div className="flex flex-row flex-wrap my-3">
                    <Button
                        variant="outline"
                        className="mr-2 mt-1">
                        <div className="text-xs font-normal">
                            <div className="font-semibold">All Tracks</div>
                        </div>
                    </Button>
                    {new Array(4).fill('').map((t, index) => {
                        const color = getLabelColor(Math.random() * 100 + '')
                        const themeStyle = {
                            color: color,
                            borderColor: color
                        }
                        return <Button
                            variant="outline"
                            className="mr-2 mt-1"
                            style={themeStyle}
                            key={t.id}>
                            <div className="text-xs font-normal">
                                <div className="font-semibold">Track {index}</div>
                                <div>Public</div>
                            </div>
                        </Button>
                    })}
                </div>

                <div className="my-3">
                    {
                        new Array(3).fill(0).map((_, index) => {
                            return <div key={index} className="pl-4 mb-5 relative">
                                <i className="block w-4 h-4 border-4 z-10 absolute rounded-full left-0 top-1.5 bg-background translate-x-[-7px]" />
                                <i className="block w-[1px] h-[calc(100%-12px)] absolute left-0 top-3 border-l-2 border-dashed" />
                                <div className="text-lg font-semibold mb-2">{10 + index} November, Sun</div>
                                {
                                    events.slice(0, 3).map((event, index) => {
                                        return <CardEvent className="mb-3" key={index} event={event} />
                                    })
                                }
                            </div>
                        })
                    }
                </div>
            </div>

            <div className="md:w-[328px] ml-0 flex-col flex order-1 md:order-2 md:ml-6 mb-6">
                <a className="flex-row-item-center justify-between bg-background shadow p-3 rounded-lg mb-3 block md:hidden"
                    href="/group/playground2?tab=members">
                    <div className="flex-row-item-center">
                        <img src="/images/default_avatar/avatar_1.png"
                            className="w-4 h-4 rounded-full mr-2" alt=""/>
                        <span
                            className="font-semibold text-xs whitespace-nowrap max-w-[150px] overflow-hidden overflow-ellipsis">
                            Playground2
                        </span>
                    </div>
                    <div className='text-xs'>123 members <i className="uil-arrow-right"/></div>
                </a>

                <a href="/event/playground2/schedule/list" className={`${buttonVariants({variant: "warm"})} w-full`}>
                    <i className="uil-calender text-lg"/>
                    <span>Event Schedule</span>
                </a>

                <a href="/" className="mt-3">
                    <img className="w-full h-auto"
                        src="https://ik.imagekit.io/soladata/0ejijpun_tZ-nyO9hK?tr=w-600" alt=""/>
                </a>

                <a href="/event/playground2/create"
                    className={`${buttonVariants({variant: "special"})} w-full mt-3`}
                >Create an Event</a>

                <div className="flex-row-item-center mt-3">
                    <a href="/create-badge?group=playground2"
                        className={`${buttonVariants({variant: "secondary"})} flex-1`}
                    >Send a Badge</a>

                    <a href="/create-badge?group=playground2"
                        className={`${buttonVariants({variant: "secondary"})} flex-1 ml-3`}
                    >Setting</a>
                </div>

                <div className="mt-8 hidden md:block">
                    <a className="flex-row-item-center justify-between rounded-lg mb-3"
                        href="/group/playground2?tab=members">
                        <div className="flex-row-item-center">
                            <img src="/images/default_avatar/avatar_1.png"
                                className="w-4 h-4 rounded-full mr-2" alt=""/>
                            <span
                                className="font-semibold text-sm whitespace-nowrap max-w-[150px] overflow-hidden overflow-ellipsis">
                            Playground2
                            </span>
                        </div>
                        <div className='text-xs'>123 members <i className="uil-arrow-right"/></div>
                    </a>

                    <div className="grid grid-cols-1 gap-3">
                        {
                            new Array(8).fill(0).map((_, index) => {
                                return <a href="/profile/jiang" className="flex-row-item-center"
                                    key={index}>
                                    <img className="w-8 h-8 mr-2 rounded-full"
                                        src="/images/default_avatar/avatar_1.png" alt=""/>
                                    <span className="text-sm mr-2">Playground2</span>
                                    <Badge variant="past">Manager</Badge>
                                </a>
                            })
                        }

                        <Button variant={"outline"} size={'sm'} className="!rounded-full !font-normal text-sm border-secondary">
                            123 Members
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
}
