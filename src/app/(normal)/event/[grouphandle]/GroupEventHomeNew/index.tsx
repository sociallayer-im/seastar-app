import {buttonVariants} from "@/components/shadcn/Button"
import GroupEventHomeData, {GroupEventHomeDataProps} from '@/app/(normal)/event/[grouphandle]/data'
import {selectLang} from '@/app/actions'
import {displayProfileName} from '@/utils'
import SelectedBadgeWannaSend from '@/components/client/SelectedBadgeWannaSend'
import SignInPanel from '@/components/SignInPanel'
import EventHomeFilterNew from '@/components/client/EventHomeFilterNew'
import EventListGroupedByDate from '@/components/EventListGroupedByDate'
import EventHomeMap from '@/app/(normal)/event/[grouphandle]/EventHomeMap'
import EventHomeEventList from '@/app/(normal)/event/[grouphandle]/GroupEventHomeNew/EventList'


export default async function GroupEventHome(props: GroupEventHomeDataProps) {
    const {
        groupDetail,
        events,
        currProfile,
        isManager,
        filterOpts,
        mapMarkers,
        canPublishEvent
    } = await GroupEventHomeData(props, true)

    const {lang, type} = await selectLang()

    return <div className="min-h-[100svh] bg-[#F8F9F8]">
        <div className="min-h-[116px] hidden sm:block"
             style={{
                 background: 'url(/images/event_homet_header_bg.png) center no-repeat',
                 backgroundSize: '100% 100%'
             }}>
            <div className="page-width flex-col py-6 flex ">
                <div className="font-semibold mb-4">{displayProfileName(groupDetail)}</div>
                <div className="text-xs max-w-[500px]">{groupDetail.about}</div>
                <a className="flex-row-item-center text-xs hover:text-primary-foreground"
                   href={`/group/${groupDetail.handle}?tab=members`}>
                    {groupDetail.memberships.length} {lang['Members']}
                    <i className="uil-angle-right text-xl"/>
                </a>
            </div>
        </div>

        <div className="flex sm:hidden flex-row justify-between items-start  px-3 pt-6">
            <div className="flex-1">
                <div className="font-semibold">{displayProfileName(groupDetail)}</div>
                <a className="flex-row-item-center text-xs hover:text-primary-foreground"
                   href={`/group/${groupDetail.handle}?tab=members`}>
                    {groupDetail.memberships.length} {lang['Members']}
                    <i className="uil-angle-right text-xl"/>
                </a>
            </div>

            <a className={`${buttonVariants({variant: 'ghost'})} flex-row-item-center text-xs gap-0`}
               href={`/map/${groupDetail.handle}/event`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                          d="M16.5 9.54545C16.5 14.6364 10 19 10 19C10 19 3.5 14.6364 3.5 9.54545C3.5 5.9305 6.41015 3 10 3C13.5899 3 16.5 5.9305 16.5 9.54545Z"
                          fill="#272928" stroke="white" stroke-width="1.125" stroke-linecap="round"
                          stroke-linejoin="round"/>
                    <path fill-rule="evenodd" clip-rule="evenodd"
                          d="M10 11C10.8284 11 11.5 10.3284 11.5 9.5C11.5 8.67157 10.8284 8 10 8C9.17157 8 8.5 8.67157 8.5 9.5C8.5 10.3284 9.17157 11 10 11Z"
                          fill="white" stroke="white" stroke-width="1.125" stroke-linecap="round"
                          stroke-linejoin="round"/>
                </svg>
                {lang['Map']}
            </a>
        </div>

        <div className="page-width min-h-[100svh] sm:pt-8 flex-col flex sm:flex-row">
            <div className="flex-1 md:max-w-[648px] order-2 md:order-1">
                <EventHomeEventList
                    events={events}
                    lang={lang}
                    isManager={isManager}
                    groupDetail={groupDetail}
                    filterOpts={filterOpts} />


                {!!currProfile && <div className="block sm:hidden pb-6">
                    {canPublishEvent && groupDetail.status !== 'freezed' &&
                        <a href={`/event/${groupDetail.handle}/create`}
                           className={`${buttonVariants({variant: "primary"})} add-btn fixed right-10 bottom-16 mb-3 !w-9 !h-9 !rounded-full`}
                        ><i className="uil-plus text-lg" /></a>
                    }

                    <div className="flex-row-item-center mb-3">
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
                </div>}
            </div>

            <div className="md:w-[328px] ml-0 flex-col flex order-1 md:order-2 md:ml-6 mb-6">
                {!!groupDetail.banner_image_url &&
                    <a href={groupDetail.banner_link_url || '/'} className="mb-3">
                        <img className="w-full h-auto"
                             src={groupDetail.banner_image_url} alt=""/>
                    </a>
                }

                {!!currProfile && <div className="hidden sm:block">
                    {canPublishEvent && groupDetail.status !== 'freezed' &&
                        <a href={`/event/${groupDetail.handle}/create`}
                           className={`${buttonVariants({variant: "special"})} w-full mb-3`}
                        >{lang['Create an Event']}</a>
                    }

                    <div className="flex-row-item-center mb-3">
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
                </div>}

                {!currProfile && <SignInPanel lang={lang}/>}

                {groupDetail.map_enabled &&
                    <div className="mb-8 hidden md:block">
                        <EventHomeMap
                            mapMarkers={mapMarkers}
                            lang={lang}
                            langType={type}
                            groupHandle={groupDetail.handle}
                        />
                    </div>
                }
            </div>
        </div>
    </div>
}
