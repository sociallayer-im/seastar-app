import {Button, buttonVariants} from "@/components/shadcn/Button"
import {Badge} from "@/components/shadcn/Badge"
import GroupEventHomeData, {
    GroupEventHomeDataWithHandleProps
} from '@/app/(normal)/event/[grouphandle]/data'
import {selectLang} from '@/app/actions'
import {displayProfileName} from '@/utils'
import Avatar from '@/components/Avatar'
import SelectedBadgeWannaSend from '@/components/client/SelectedBadgeWannaSend'
import SignInPanel from '@/components/SignInPanel'
import EventHomeFilter from '@/components/client/EventHomeFilter'
import EventListGroupedByDate from '@/components/EventListGroupedByDate'
import GoogleMap, {GoogleMapMarkerProps} from '@/components/client/Map'

export default async function GroupEventHome(props: GroupEventHomeDataWithHandleProps) {
    const {
        groupDetail,
        events,
        currProfile,
        members,
        isManager,
        filterOpts,
        mapMarkers,
    } = await GroupEventHomeData(props)

    const {lang} = await selectLang()

    return <div style={{background: '#fff url(/images/event_home_bg.png) top center repeat-x'}}>
        <div className="page-width min-h-[100svh] !pt-3 !sm:pt-6 flex-col flex md:flex-row">

            <div className="flex-1 max-w-[648px] order-2 md:order-1">
                {groupDetail.map_enabled && !!mapMarkers.length && <div className="w-full h-[260px] mb-6 relative">
                    <GoogleMap lang={lang} markers={mapMarkers} center={mapMarkers[0].position}/>
                    <a className={`${buttonVariants({variant: "secondary", size: "sm"})} absolute bottom-2 right-2 z-10 text-xs bg-white shadow`}
                       href={`/map/${groupDetail.handle}/event`}>
                        {lang['Browse on Map']} <i className="uil-expand-arrows-alt text-base"/>
                    </a>
                </div>
                }
                <EventHomeFilter filterOpts={filterOpts}
                                 groupDetail={groupDetail} isManager={isManager} lang={lang}/>

                <div className="my-3">
                    <EventListGroupedByDate events={events} group={groupDetail}/>
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
                    <a href={`/event/${groupDetail.handle}/create`}
                       className={`${buttonVariants({variant: "special"})} w-full mt-3`}
                    >{lang['Create an Event']}</a>

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

                    <div className="grid grid-cols-1">
                        {
                            members.slice(0, 20).map((member, index) => {
                                return <a href={`/profile/${member.profile.handle}`}
                                          className="flex-row-item-center p-2 rounded-lg hover:bg-secondary"
                                          key={index}>
                                    <Avatar size={32} profile={member.profile} className="mr-2"/>
                                    <span className="text-sm mr-2">{displayProfileName(member.profile)}</span>
                                    <Badge variant="past">{member.role}</Badge>
                                </a>
                            })
                        }

                        <Button variant={"outline"} size={'sm'}
                                className="!rounded-full !font-normal text-sm border-secondary">
                            {members.length} {lang['Members']}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
}
