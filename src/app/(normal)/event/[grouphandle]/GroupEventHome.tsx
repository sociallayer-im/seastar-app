import {Button, buttonVariants} from "@/components/shadcn/Button"
import {Badge} from "@/components/shadcn/Badge"
import GroupEventHomeData, { GroupEventHomeDataProps} from '@/app/(normal)/event/[grouphandle]/data'
import {selectLang} from '@/app/actions'
import {displayProfileName} from '@/utils'
import Avatar from '@/components/Avatar'
import SelectedBadgeWannaSend from '@/components/client/SelectedBadgeWannaSend'
import SignInPanel from '@/components/SignInPanel'
import EventHomeFilter from '@/components/client/EventHomeFilter'
import EventListGroupedByDate from '@/components/EventListGroupedByDate'
import EventHomeMap from '@/app/(normal)/event/[grouphandle]/EventHomeMap'


export default async function GroupEventHome(props: GroupEventHomeDataProps) {
    const {
        groupDetail,
        events,
        currProfile,
        members,
        isManager,
        filterOpts,
        mapMarkers,
        canPublishEvent
    } = await GroupEventHomeData(props)

    const {lang, type} = await selectLang()

    return <div style={{background: '#fff url(/images/event_home_bg.png) top center repeat-x'}}>
        <div className="page-width min-h-[100svh] sm:pt-8 pt-3 flex-col flex md:flex-row">
            <div className="flex-1 md:max-w-[648px] order-2 md:order-1">
                {groupDetail.map_enabled &&
                    <EventHomeMap
                        mapMarkers={mapMarkers}
                        lang={lang}
                        langType={type}
                        groupHandle={groupDetail.handle}
                    />
                }
                <EventHomeFilter filterOpts={filterOpts}
                                 groupDetail={groupDetail} isManager={isManager} lang={lang}/>

                <div className="my-3">
                    <EventListGroupedByDate events={events} group={groupDetail} lang={lang}/>
                </div>
            </div>

            <div className="md:w-[328px] ml-0 flex-col flex order-1 md:order-2 md:ml-6 mb-6">
                <a className="flex-row-item-center justify-between bg-background shadow p-3 rounded-lg mb-3 block md:hidden"
                   href={`/group/${groupDetail.handle}?tab=members`}>
                    <div className="flex-row-item-center">
                        <img src="/images/default_avatar/avatar_1.png"
                             className="w-4 h-4 rounded-full mr-2" alt=""/>
                        <span
                            className="font-semibold text-xs whitespace-nowrap max-w-[150px] overflow-hidden overflow-ellipsis">
        {displayProfileName(groupDetail)}
        </span>
                    </div>
                    <div className='text-xs'>{members.length} {lang['Members']} <i className="uil-arrow-right"/></div>
                </a>

                <a href={`/event/${groupDetail.handle}/schedule/list`}
                   className={`${buttonVariants({variant: "warm"})} w-full`}>
                    <i className="uil-calender text-lg"/>
                    <span>{lang['Event Schedule']}</span>
                </a>

                {!!groupDetail.banner_image_url &&
                    <a href={groupDetail.banner_link_url || '/'} className="mt-3">
                        <img className="w-full h-auto"
                             src={groupDetail.banner_image_url} alt=""/>
                    </a>
                }


                {!!currProfile && <>
                    {canPublishEvent && groupDetail.status !== 'freezed' &&
                        <a href={`/event/${groupDetail.handle}/create`}
                           className={`${buttonVariants({variant: "special"})} w-full mt-3`}
                        >{lang['Create an Event']}</a>
                    }

                    <div className="flex-row-item-center mt-3">
                        <SelectedBadgeWannaSend
                            className={'flex-1 flex-shrink-0'}
                            lang={lang}
                            profileDetail={currProfile}
                            group={groupDetail}>
                            <div className={`${buttonVariants({variant: "secondary"})} w-full cursor-pointer`}
                            >{lang['Send a Badge']}</div>
                        </SelectedBadgeWannaSend>

                        {isManager &&
                            <a href={`/event/${groupDetail.handle}/setting`}
                               className={`${buttonVariants({variant: "secondary"})} ml-3`}>
                                {lang['Setting']}
                            </a>
                        }
                    </div>
                </>}

                {!currProfile && <SignInPanel lang={lang}/>}

                <div className="mt-8 hidden md:block">
                    <a className="flex-row-item-center justify-between rounded-lg mb-3"
                       href={`/group/${groupDetail.handle}?tab=members`}>
                        <div className="flex-row-item-center">
                            <Avatar profile={groupDetail} size={16} className="mr-2"/>
                            <span
                                className="font-semibold text-sm whitespace-nowrap max-w-[150px] overflow-hidden overflow-ellipsis">
        {displayProfileName(groupDetail)}
        </span>
                        </div>
                        <div className='text-xs'>
                            {members.length} {lang['Members']}
                            <i className="uil-arrow-right"/>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </div>
}
