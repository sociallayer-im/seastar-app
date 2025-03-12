import {buttonVariants} from "@/components/shadcn/Button"
import GroupEventHomeData, {GroupEventHomeDataProps} from '@/app/(normal)/event/[grouphandle]/data'
import {selectLang} from '@/app/actions'
import {displayProfileName} from '@/utils'
import SelectedBadgeWannaSend from '@/components/client/SelectedBadgeWannaSend'
import SignInPanel from '@/components/SignInPanel'
import EventHomeFilterNew from '@/components/client/EventHomeFilterNew'
import EventListGroupedByDate from '@/components/EventListGroupedByDate'
import EventHomeMap from '@/app/(normal)/event/[grouphandle]/EventHomeMap'


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
        <div className="min-h-[116px]"
             style={{background: 'url(/images/event_homet_header_bg.png) center no-repeat', backgroundSize: '100% 100%'}}>
            <div className="page-width flex-col py-6 flex ">
                <div className="font-semibold mb-4">{displayProfileName(groupDetail)}</div>
                <div className="text-xs max-w-[500px]">{groupDetail.about}</div>
                <a className="flex-row-item-center text-xs hover:text-primary-foreground"
                   href={`/group/${groupDetail.handle}?tab=members`}>
                    {groupDetail.memberships.length} {lang['Members']}
                    <i className="uil-angle-right text-xl" />
                </a>
            </div>
        </div>

        <div className="page-width min-h-[100svh] sm:pt-8 pt-3 flex-col flex md:flex-row">
            <div className="flex-1 md:max-w-[648px] order-2 md:order-1">
                <EventHomeFilterNew
                    filterOpts={filterOpts}
                     groupDetail={groupDetail} isManager={isManager} lang={lang}/>

                <div className="my-3">
                    <EventListGroupedByDate events={events} group={groupDetail} lang={lang}/>
                </div>
            </div>

            <div className="md:w-[328px] ml-0 flex-col flex order-1 md:order-2 md:ml-6 mb-6">

                {!!groupDetail.banner_image_url &&
                    <a href={groupDetail.banner_link_url || '/'}>
                        <img className="w-full h-auto"
                             src={groupDetail.banner_image_url} alt=""/>
                    </a>
                }


                {!!currProfile && <>
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
                </>}

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
