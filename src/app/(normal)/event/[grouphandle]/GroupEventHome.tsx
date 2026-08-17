'use client'

import { buttonVariants, Button } from "@/components/shadcn/Button"
import GroupEventHomeData from '@/app/(normal)/event/[grouphandle]/data'
import { cfImage, displayProfileName, getAuth, prefixUrl } from '@/utils'
import SelectedBadgeWannaSend from '@/components/client/SelectedBadgeWannaSend'
import SignInPanel from '@/components/SignInPanel'
import Img from '@/components/Img'
import EventHomeFilter from '@/components/client/EventHomeFilter'
import EventListGroupedByDate from '@/components/EventListGroupedByDate'
import EventHomeMap from '@/app/(normal)/event/[grouphandle]/EventHomeMap'
import { useState } from "react"
import { EventListFilterProps, EventWithJoinStatus, getEvents } from "@sola/sdk"
import { Dictionary } from "@/lang"
import useModal from '@/components/client/Modal/useModal'
import { CLIENT_MODE, DISCUSSION } from "@/app/config"
import DiscussionPanel from '@/app/(normal)/event/[grouphandle]/DiscussionPanel'
import DialogEventHomeFilter from "@/components/client/DialogEventHomeFilter"
import { PAGE_SIZE } from "./data"
import Footer from "@/components/Footer"

interface GroupEventHomeProps {
    lang: Dictionary,
    langType: string,
    data: Awaited<ReturnType<typeof GroupEventHomeData>>
    /** From ?tab=. Anything unrecognised, or a group with discussion off,
     *  falls back to the events tab rather than rendering a blank panel. */
    initialTab?: string
}

export default function GroupEventHome({ data, lang, langType, initialTab }: GroupEventHomeProps) {
    const {
        groupDetail,
        events,
        currProfile,
        members,
        isManager,
        isOwner,
        filterOpts,
        mapMarkers,
        canPublishEvent,
        canSubmitEvent,
        highlightedEvents,
        enableGoogleMap,
        categories,
        canPostTopic,
    } = data

    const { showLoading, closeModal } = useModal()

    // Both switches have to be on: the deployment's, and this group's. With
    // either off there is no tab bar at all rather than a disabled tab — a tab
    // bar with one tab is noise, and this page has never had one.
    const showDiscussion = DISCUSSION && groupDetail.discussion_enabled && !!categories
    const [tab, setTab] = useState<'event' | 'discussion'>(
        showDiscussion && initialTab === 'discussion' ? 'discussion' : 'event'
    )

    const switchTab = (next: 'event' | 'discussion') => {
        setTab(next)
        // replaceState, not push: switching tabs is not a navigation people
        // expect the back button to undo one step at a time.
        window.history.replaceState({}, '', next === 'discussion' ? '?tab=discussion' : '?')
    }

    const [eventList, setEventList] = useState<EventWithJoinStatus[]>(events)
    const [currFilter, setCurrFilter] = useState<EventListFilterProps>(filterOpts)
    const [hasMore, setHasMore] = useState<boolean>(!!events.length)

    const checkUiStatus = (currFilter: EventListFilterProps): {
        isFiltered: boolean,
        showHighlight: boolean
    } => {
        const isFiltered = !!currFilter.skip_recurring
            || !!currFilter.start_date
            || !!currFilter.end_date
            || !!currFilter.venue_id
            || !!currFilter.tags
            || !!currFilter.track_id
        return {
            isFiltered,
            showHighlight: currFilter.collection === 'upcoming' && !currFilter.search_title && !isFiltered
        }
    }

    const [uiStatus, setUiStatus] = useState(checkUiStatus(currFilter))

    const handleFilterChange = async (filter: EventListFilterProps) => {
        setCurrFilter(filter)
        const searchParams = new URLSearchParams()
        for (const key in filter) {
            const _key = key as keyof typeof filter
            if (filter[_key] && _key !== 'group_id' && _key !== 'timezone') {
                searchParams.append(key, filter[_key].toString())
            }
        }

        window.history.replaceState({}, '', `?${searchParams.toString()}`)

        const loading = showLoading()
        try {
            const events = await getEvents({
                params: {
                    filters: {
                        ...filter,
                        group_id: groupDetail.id,
                        timezone: groupDetail.timezone || undefined
                    },
                    authToken: getAuth(),
                    limit: PAGE_SIZE
                }, clientMode: CLIENT_MODE
            })
            // Events already embed their track (soon EventBlueprint).
            const listWithTrack = events

            setHasMore(listWithTrack.length === PAGE_SIZE)

            if (filter.page === 1) {
                setEventList(listWithTrack)
            } else {
                setEventList([...eventList, ...listWithTrack])
            }

            setUiStatus(checkUiStatus(filter))
        } catch (e) {
            console.error(e)
        } finally {
            closeModal(loading)
        }
    }

    return <div style={{ background: '#fff url(/images/event_home_bg.png) top center repeat-x' }}>
        <div className="page-width min-h-[100svh] sm:pt-8 pt-3 flex-col flex md:flex-row">
            <div className="flex-1 md:max-w-[648px] order-2 md:order-1">
                {showDiscussion &&
                    <div className="flex-row-item-center gap-1 border-b border-gray-200 mb-3">
                        <TabButton active={tab === 'event'} onClick={() => switchTab('event')}>
                            {lang['Events']}
                        </TabButton>
                        <TabButton active={tab === 'discussion'} onClick={() => switchTab('discussion')}>
                            {lang['Discussion']}
                        </TabButton>
                    </div>
                }

                {tab === 'discussion' && showDiscussion &&
                    <DiscussionPanel
                        lang={lang}
                        group={groupDetail}
                        categories={categories!}
                        canPost={canPostTopic}/>
                }

                {tab === 'event' && <>
                {enableGoogleMap && mapMarkers.length > 0 &&
                    <EventHomeMap
                        mapMarkers={mapMarkers}
                        lang={lang}
                        langType={langType}
                        groupHandle={groupDetail.name}
                    />
                }
                <EventHomeFilter
                    filterOpts={currFilter}
                    onFilterChange={(filter) => handleFilterChange({ ...filter, page: 1 })}
                    groupDetail={groupDetail}
                    isManager={isManager}
                    unionVenues={[]}
                    isFiltered={uiStatus.isFiltered}
                    lang={lang} />
                <div className="my-3">
                    <EventListGroupedByDate
                        isManager={isManager || isOwner}
                        highlightedEvents={uiStatus.showHighlight ? highlightedEvents : []}
                        events={eventList}
                        group={groupDetail}
                        lang={lang} />

                    {hasMore && <Button variant="secondary" className="w-full mb-3"
                        onClick={() => handleFilterChange({ ...currFilter, page: currFilter.page ? Number(currFilter.page) + 1 : 2 })}>
                        View More Events
                    </Button>}
                </div>
                </>}
            </div>

            <div className="md:w-[328px] ml-0 flex-col flex order-1 md:order-2 md:ml-6 mb-6">
                <a className="flex-row-item-center justify-between  p-3 rounded-lg mb-3"
                    href={`/group/${groupDetail.name}?tab=members`}>
                    <div className="flex-row-item-center">
                        <Img src={cfImage((groupDetail.image_url && groupDetail.image_url != "") ? groupDetail.image_url : "/images/default_avatar/avatar_1.png", { width: 32, height: 32, fit: 'cover' })}
                            className="w-4 h-4 rounded-full mr-2" alt="" />
                        <span
                            className="font-semibold text-xs whitespace-nowrap max-w-[150px] overflow-hidden overflow-ellipsis">
                            {displayProfileName(groupDetail)}
                        </span>
                    </div>
                    <div className='text-xs'>{members.length} {lang['Members']} <i className="uil-arrow-right" /></div>
                </a>

                <a href={`/event/${groupDetail.name}/schedule/compact`}
                    className={`${buttonVariants({ variant: "warm" })} w-full`}>
                    <i className="uil-calender text-lg" />
                    <span>{lang['Event Schedule']}</span>
                </a>

                {!!groupDetail.banner_image_url &&
                    <a href={groupDetail.banner_link_url ? prefixUrl(groupDetail.banner_link_url) : '/'} className="mt-3">
                        <Img className="w-full h-auto"
                            src={cfImage(groupDetail.banner_image_url, { width: 656, format: 'auto', quality: 85 })} alt="" />
                    </a>
                }

                {!!groupDetail.venues.length &&
                    <a href={`/event/${groupDetail.name}/venues`}
                        className={`${buttonVariants({ variant: "normal" })} w-full mt-3`}
                    >
                        <img src="/images/icon_venue.svg" alt="" />
                        {lang['Venue List']}
                    </a>
                }


                {!!currProfile && <>
                    {canSubmitEvent && groupDetail.active !== false &&
                        <a href={`/event/${groupDetail.name}/create`}
                            className={`${buttonVariants({ variant: "special" })} w-full mt-3`}
                        >{lang['Create an Event']}</a>
                    }

                    <SelectedBadgeWannaSend
                        className={'flex-shrink-0 mt-3'}
                        lang={lang}
                        profileDetail={currProfile}
                        group={groupDetail}>
                        <div className={`${buttonVariants({ variant: "secondary" })} w-full cursor-pointer`}
                        >{lang['Send a Badge']}</div>
                    </SelectedBadgeWannaSend>


                    {isManager &&
                        <>
                        <div className="flex-row-item-center mt-3 gap-2">
                            <a href={`/event/${groupDetail.name}/setting`}
                                className={`${buttonVariants({ variant: "secondary" })} flex-1`}>
                                {lang['Settings']}
                            </a>
                            <a href={`https://dashboard.sola.day/event/${groupDetail.name}`}
                                className={`${buttonVariants({ variant: "secondary" })} flex-1`}>
                                Dashboard
                            </a>
                        </div>
                        <div className="flex-row-item-center mt-3 gap-2">
                        <a href={`/my-events/pending-requests`}
                                className={`${buttonVariants({ variant: "secondary" })} flex-1`}>
                                {lang['Pending Requests']}
                            </a>
                        </div>
                        </>
                    }
                </>}

                {!currProfile && <SignInPanel lang={lang} />}

                <div className="mt-6 hidden sm:block">
                    <DialogEventHomeFilter
                        filterOpts={currFilter}
                        groupDetail={groupDetail}
                        unionVenues={[]}
                        lang={lang}
                        onFilterChange={(filter) => handleFilterChange({ ...filter, page: 1 })}
                        dialogMode="modal"
                    />
                </div>
            </div>
        </div>
        <div className="page-width">
            <Footer lang={lang} />
        </div>
    </div>
}

function TabButton({active, onClick, children}: {
    active: boolean,
    onClick: () => void,
    children: React.ReactNode
}) {
    return <button onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold border-b-2 duration-200 ${
            active ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
        {children}
    </button>
}
