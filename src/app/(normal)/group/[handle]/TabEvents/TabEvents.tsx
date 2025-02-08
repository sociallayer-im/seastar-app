import {GroupEventListData} from "@/app/(normal)/group/[handle]/TabEvents/data"
import NoData from "@/components/NoData"
import CardEvent from "@/components/CardEvent"
import {selectLang} from "@/app/actions"
import {buttonVariants} from "@/components/shadcn/Button"
import {Profile} from '@sola/sdk'

export default async function GroupEvents({handle, currProfile, canPublishEvent}: {
    handle: string,
    currProfile?: Profile | null,
    canPublishEvent?: boolean
}) {
    const events = await GroupEventListData(handle, currProfile)
    const {lang} = await selectLang()

    return <div className="py-4">
        <div className="flex-row-item-center justify-between">
            <div className="text-sm"><strong className="text-lg">
                {events.length === 100 ? '99+' : events.length}</strong> {lang['Events']}</div>
            <div className="flex-row-item-center">
                <a className={`${buttonVariants({variant: 'normal', size: 'sm'})} text-xs sm:text-sm sm:h-9 mr-2`}
                   href={`/event/${handle}`}>
                    {lang['View All Event']}
                </a>
                {canPublishEvent &&
                    <a className={`${buttonVariants({variant: 'special', size: 'sm'})} text-xs sm:text-sm sm:h-9`}
                       href={`/event/${handle}/create`}>
                        {lang['Create an Event']}
                    </a>
                }
            </div>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-4">
            {events.map((event, i) => {
                return <CardEvent key={i} event={event}/>
            })}

            {!events.length && <NoData/>}
        </div>
    </div>

}
