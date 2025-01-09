'use client'

import type {Dictionary} from "@/lang"
import {CreateEventPageDataType, EventDraftType} from "@/app/(normal)/event/[grouphandle]/create/data"
import {useEffect, useState} from "react"
import {Button, buttonVariants} from "@/components/shadcn/Button"
import useUploadImage from "@/hooks/useUploadImage"
import {Input} from "@/components/shadcn/Input"
import {getLabelColor} from "@/utils/label_color"
import dynamic from 'next/dynamic'
import {Switch} from "@/components/shadcn/Switch"
import LocationInput from "@/components/client/LocationInput"
import EventDateTimeInput from "@/components/client/EventDateTimeInput"
import {eventCoverTimeStr, isEventTimeSuitable} from "@/utils"
import SelectedEventHost from "@/components/client/SelectedEventHost"
import SelectTag from "@/components/client/SelectTag"
import {CreteEvent, getOccupiedTimeEvent} from "@/service/solar"
import useModal from "@/components/client/Modal/useModal"
import SelectedEventBadge from "@/components/client/SelectedEventBadge"
import EventRoleInput from "@/components/client/EventRoleInput"
import Cookies from 'js-cookie'
import {useToast} from "@/components/shadcn/Toast/use-toast"

const RichTextEditorDynamic = dynamic(() => import('@/components/client/Editor/RichTextEditor'), {ssr: false})

export interface EventFormProps {
    lang: Dictionary
    event: EventDraftType
    data: CreateEventPageDataType,
}

export default function EventForm({lang, event, data}: EventFormProps) {
    const [draft, setDraft] = useState<EventDraftType>(event)
    const {uploadImage} = useUploadImage()
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    // ui
    const [enableNote, setEnableNote] = useState(!!draft.notes)
    const [enableMoreSetting, setEnableMoreSetting] = useState(false)
    const [enableTicket, setEnableTicket] = useState(false)

    // errors
    const [timeError, setTimeError] = useState('')
    const [occupiedEvent, setOccupiedEvent] = useState<Solar.Event | null>(null)
    const [tagError, setTagError] = useState('')
    const [titleError, setTitleError] = useState('')

    const setCover = async () => {
        const picUrl = await uploadImage()
        setDraft({...draft, cover_url: picUrl})
    }

    useEffect(() => {
        console.log(draft)
    }, [draft])

    useEffect(() => {
        ;(async () => {
            const venue = data.venues.find(v => v.id === draft.venue_id)
            const errorMsg = isEventTimeSuitable(
                draft.timezone!,
                draft.start_time!,
                draft.end_time!,
                data.isGroupManager,
                data.isGroupMember,
                venue
            )
            setTimeError(lang[errorMsg as keyof Dictionary])

            const loading = showLoading()
            try {
                const occupiedEvents = await getOccupiedTimeEvent(
                    draft.start_time,
                    draft.end_time,
                    draft.timezone!,
                    draft.venue_id,
                    draft.id
                )
                setOccupiedEvent(occupiedEvents)
            } catch (e: unknown) {
                console.error(e)
            } finally {
                closeModal(loading)
            }
        })()
    }, [draft.end_time, draft.id, draft.start_time, draft.timezone, draft.venue_id])

    useEffect(() => {
        setTagError(!!draft.tags && draft.tags.filter(t => !t.startsWith(':')).length > 3
            ? lang['The maximum number of tags is 3'] : '')
    }, [draft.tags])

    const checkDraft = () => {
        if (!draft.title) {
            setTitleError(lang['Event Name is required'])
            setTimeout(() => {
                document.querySelector('.err-msg')?.scrollIntoView({behavior: 'smooth', block: 'center'})
            }, 200)
            return
        } else {
            setTitleError('')
        }

        if (!!timeError || !!tagError || !!occupiedEvent) {
            setTimeout(() => {
                document.querySelector('.err-msg')?.scrollIntoView({behavior: 'smooth', block: 'center'})
            }, 200)
        }

        const authToken = Cookies.get(process.env.NEXT_PUBLIC_AUTH_FIELD!)

        if (!authToken) {
            toast({
                title: 'Please login first',
                variant: 'destructive'
            })
            return
        }

        const loading = showLoading()
        try {
            const event = CreteEvent({...draft, auth_token: authToken})
            console.log('event', event)
        } catch (e: unknown) {
            console.error(e)
            toast({
                title: 'Failed to create event',
                description: e instanceof Error ? e.message : 'Unknown error',
                variant: 'destructive'
            })
        } finally {
            closeModal(loading)
        }
    }

    return <div className="min-h-[100svh] w-full">
        <div className="page-width min-h-[100svh] px-3 pb-12 pt-0 !pb-16">
            <div
                className="py-6 font-semibold text-center text-xl">{event.id ? lang['Edit Event'] : lang['Create Event']}</div>

            <div className="flex flex-col items-center sm:items-start sm:flex-row w-full">
                <div className="sm:order-2 mt-4 sm:mt-0 mb-8">
                    {!draft.cover_url ?
                        <div className="mb-4 flex-shrink-0 w-[324px] h-[324px] overflow-hidden mx-auto">
                            <div className="default-cover w-[452px] h-[452px]" style={{transform: 'scale(0.72)'}}>
                                <div
                                    className="font-semibold text-[27px] max-h-[80px] w-[312px] absolute left-[76px] top-[78px]">
                                    {draft.title || lang['Event Name']}
                                </div>
                                <div
                                    className="text-lg absolute font-semibold left-[76px] top-[178px]">{eventCoverTimeStr(draft.start_time!, draft.timezone!).date}
                                    <br/>
                                    {eventCoverTimeStr(draft.start_time!, draft.timezone!).time}
                                </div>
                                <div
                                    className="text-lg absolute font-semibold left-[76px] top-[240px]">{draft.location}</div>
                            </div>
                        </div>
                        : <img src={draft.cover_url} alt="" className="w-[324px] h-auto mb-4"/>
                    }
                    <Button onClick={setCover}
                        variant={'secondary'} className="block btn mx-auto w-[324px]">
                        {lang['Upload Cover']}
                    </Button>
                </div>

                <div className="sm:order-1 sm:mr-8 flex-1 max-w-[644px]">
                    {!!data.tracks.length && <>
                        <div className="font-semibold mb-1">{lang['Event Track']}</div>
                        <div className="flex-row flex flex-wrap items-center mb-8">
                            {data.tracks.map(t => {
                                const color = getLabelColor(t.title)
                                const themeStyle = t.id === draft.track_id ? {
                                    color: color,
                                    borderColor: color
                                } : {borderColor: '#ededed'}
                                return <Button
                                    onClick={() => setDraft({...draft, track_id: t.id})}
                                    variant="outline"
                                    className="mr-2"
                                    style={themeStyle}
                                    key={t.id}>
                                    <div className="text-xs font-normal">
                                        <div className="font-semibold">{t.title}</div>
                                        <div>{t.kind}</div>
                                    </div>
                                </Button>
                            })}
                        </div>
                    </>}

                    <div className="mb-8">
                        <div className="font-semibold mb-1">{lang['Event Name']} <span className="text-red-500">*</span>
                        </div>
                        <Input className="w-full"
                            placeholder={lang['Input event name']}
                            value={draft.title}
                            required
                            onChange={e => setDraft({...draft, title: e.target.value})}/>
                        {!!titleError && <div className="text-red-400 mt-2 text-xs err-msg">{titleError}</div>}
                    </div>

                    <div className="font-semibold mb-1">{lang['Event Description']}</div>
                    <div className="mb-3 w-full min-h-[226px] bg-secondary rounded-lg">
                        <RichTextEditorDynamic
                            initText={draft.content || ''}
                            onChange={md => {
                                setDraft({...draft, content: md})
                            }}/>
                    </div>

                    <div className="mb-8">
                        <div className={`select-none mb-3`}>
                            <div className="flex flex-row items-center justify-between w-full">
                                <div className="text-sm">
                                    <div className="font-semibold">{lang['Event Note']}</div>
                                    <div className="text-xs text-gray-500 font-normal">
                                        {lang['Display after confirming attendance']}
                                    </div>
                                </div>
                                <Switch onClick={() => {
                                    setEnableNote(!enableNote)
                                }} checked={enableNote} aria-readonly/>
                            </div>
                        </div>
                        <div id="event-notes" className={`${enableNote ? '' : 'h-0'} overflow-hidden`}>
                            <RichTextEditorDynamic
                                initText={draft.notes || ''}
                                onChange={(md) => {
                                    setDraft({...event, notes: md})
                                }}
                            />
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="font-semibold mb-1">{lang['Location']}</div>
                        <LocationInput
                            lang={lang}
                            isManager={data.isGroupManager}
                            isMember={data.isGroupMember}
                            venues={data.venues}
                            state={{event: draft, setEvent: setDraft}}/>
                    </div>

                    <div className="mb-8">
                        <div className="font-semibold mb-1">{lang['When will it happen']}</div>
                        <EventDateTimeInput
                            lang={lang}
                            venues={data.venues}
                            state={{event: draft, setEvent: setDraft}}
                        />
                        {!!timeError && <div className="text-red-400 mt-2 text-xs err-msg">{timeError}</div>}
                        {!!occupiedEvent &&
                            <div
                                className="text-red-400 mt-2 text-xs err-msg">{lang['The selected time slot is occupied by another event at the current venue. Occupying event:']}
                                <a className="text-blue-400"
                                    target="_blank"
                                    href={`/event/detail/${occupiedEvent.id}`}>[{occupiedEvent.title}]</a>
                            </div>
                        }
                    </div>

                    <div className="mb-8">
                        <div className="font-semibold mb-1">{lang['Meeting URL']}</div>
                        <Input className="w-full"
                            placeholder={lang['Input meeting url']}
                            onChange={e => {
                                setDraft({...draft, meeting_url: e.target.value})
                            }}
                            startAdornment={<i className="uil-link text-lg"/>}
                            value={draft.meeting_url || ''}/>
                    </div>

                    {!!data.availableHost.length &&
                        <div className="mb-8">
                            <div className="font-semibold mb-1">{lang['Host']}</div>
                            <SelectedEventHost
                                lang={lang}
                                availableHost={data.availableHost}
                                state={{event: draft, setEvent: setDraft}}/>
                        </div>
                    }

                    <div className="mb-8">
                        <div className="font-semibold mb-1">{lang['Tags']}</div>
                        <SelectTag
                            onSelect={(tags) => setDraft({...draft, tags})}
                            tags={data.tags || []}
                            value={draft.tags || []}/>
                        {!!tagError && <div className="text-red-400 mt-2 text-xs err-msg">{tagError}</div>}
                    </div>

                    <div className="mb-8">
                        <div className="font-semibold mb-1">{lang['Invite Co-hosts']}</div>
                        <EventRoleInput lang={lang}
                            state={{event: draft, setEvent: setDraft}}
                            role={'co_host' as Solar.EventRoleType}/>
                    </div>

                    <div className="mb-8">
                        <div className="font-semibold mb-1">{lang['Invite Speakers']}</div>
                        <EventRoleInput lang={lang}
                            state={{event: draft, setEvent: setDraft}}
                            role={'speaker' as Solar.EventRoleType}/>
                    </div>

                    <div className="mb-8">
                        <div className="flex flex-row items-center justify-between w-full mb-2">
                            <div className="font-semibold">{lang['Ticket Setting']}</div>
                            <Switch checked={enableTicket} onClick={() => {
                                setEnableTicket(!enableTicket)
                            }}/>
                        </div>

                        { enableTicket && <>
                            <div>
                                <div className="border border-gray-200 p-3 rounded-lg mb-3">
                                    <div className="font-semibold flex-row-item-center justify-between">
                                        <div className="flex-row-item-center">
                                            <i className="uil-ticket text-2xl mr-2"/>
                                            <div>Ticket 1</div>
                                        </div>
                                        <i className="uil-times-circle text-2xl"/>
                                    </div>
                                    <div className="my-3">
                                        <div className="text-sm mb-1">Name of Tickets <span
                                            className="text-red-500">*</span></div>
                                        <Input type="text" className="w-full"/>
                                    </div>
                                    <div className="my-3">
                                        <div className="text-sm mb-1">Ticket description</div>
                                        <Input type="text" className="w-full"/>
                                    </div>
                                    <div className="my-3">
                                        <div className="text-sm mb-1">Event Track</div>
                                        <div className="flex-row flex flex-wrap items-center mb-4">
                                            {data.tracks.map(t => {
                                                const color = getLabelColor(t.title)
                                                const themeStyle = t.id === draft.track_id ? {
                                                    color: color,
                                                    borderColor: color
                                                } : {borderColor: '#ededed'}
                                                return <Button
                                                    variant="outline"
                                                    className="mr-2"
                                                    style={themeStyle}
                                                    key={t.id}>
                                                    <div className="text-xs font-normal">
                                                        <div className="font-semibold">{t.title}</div>
                                                        <div>{t.kind}</div>
                                                    </div>
                                                </Button>
                                            })}
                                        </div>
                                    </div>
                                    <div className="my-3">
                                        <div className="flex-row-item-center">
                                            <div className="text-sm mr-6">Price</div>
                                            <div className="flex-row-item-center text-sm font-semibold">
                                                <div className="flex-row-item-center">
                                                    <div>Free</div>
                                                    <i className="uil-check-circle ml-2 text-2xl text-green-500"/>
                                                </div>
                                                <div className="flex-row-item-center ml-3">
                                                    <div>Payment</div>
                                                    <i className="uil-circle ml-2 text-2xl text-gray-500"/>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border border-gray-200 p-3 rounded-lg mb-3">
                                            <div className="mb-2 text-sm font-semibold">Payment 1</div>
                                            <div
                                                className="flex-row-item-center">
                                                <div className="mr-3">
                                                    <div className="flex-row-item-center flex-1 text-sm mb-3">
                                                        <div>Price</div>
                                                        <Input type="text" inputSize={'md'} className="ml-2"/>
                                                        <Input type="text" inputSize={'md'} className="ml-2"/>
                                                        <Input type="text" inputSize={'md'} className="ml-2"/>
                                                    </div>
                                                    <div className="flex-row-item-center flex-1 text-sm">
                                                        <div>Receiving wallet</div>
                                                        <Input type="text" inputSize={'md'} className="ml-2 flex-1"/>
                                                    </div>
                                                </div>
                                                <i className="uil-minus-circle text-2xl text-gray-500"/>
                                            </div>
                                        </div>
                                        <div className="border border-gray-200 p-3 rounded-lg mb-3">
                                            <div className="mb-2 text-sm font-semibold">Payment 1</div>
                                            <div
                                                className="flex-row-item-center">
                                                <div className="mr-3">
                                                    <div className="flex-row-item-center flex-1 text-sm mb-3">
                                                        <div>Price</div>
                                                        <Input type="text" inputSize={'md'} className="ml-2"/>
                                                        <Input type="text" inputSize={'md'} className="ml-2"/>
                                                        <Input type="text" inputSize={'md'} className="ml-2"/>
                                                    </div>
                                                    <div className="flex-row-item-center flex-1 text-sm">
                                                        <div>Receiving wallet</div>
                                                        <Input type="text" inputSize={'md'} className="ml-2 flex-1"/>
                                                    </div>
                                                </div>
                                                <i className="uil-minus-circle text-2xl text-gray-500"/>
                                            </div>
                                        </div>
                                        <div className="border border-gray-200 p-3 rounded-lg mb-3">
                                            <div className="mb-2 text-sm font-semibold">Payment 3</div>
                                            <div
                                                className="flex-row-item-center">
                                                <div className="mr-3">
                                                    <div className="flex-row-item-center flex-1 text-sm mb-3">
                                                        <div>Price</div>
                                                        <Input type="text" inputSize={'md'} className="ml-2"/>
                                                        <Input type="text" inputSize={'md'} className="ml-2"/>
                                                        <Input type="text" inputSize={'md'} className="ml-2"/>
                                                    </div>
                                                    <div className="flex-row-item-center flex-1 text-sm">
                                                        <div>Receiving wallet</div>
                                                        <Input type="text" inputSize={'md'}
                                                            className="ml-2 flex-1"/>
                                                    </div>
                                                </div>
                                                <i className="uil-minus-circle text-2xl text-gray-500"/>
                                                <i className="uil-plus-circle text-2xl text-green-500 ml-2"/>
                                            </div>
                                        </div>

                                    </div>

                                    <div className="my-3">
                                        <div className="flex-row-item-center">
                                            <div className="text-sm mr-6">Ticket amount</div>
                                            <div className="flex-row-item-center text-sm font-semibold">
                                                <div className="flex-row-item-center">
                                                    <div>No limit</div>
                                                    <i className="uil-circle ml-2 text-2xl text-gray-500"/>
                                                </div>
                                                <div className="flex-row-item-center ml-3">
                                                    <div>Limit</div>
                                                    <i className="uil-check-circle ml-2 text-2xl text-green-500"/>
                                                </div>
                                            </div>
                                        </div>
                                        <Input type="text" className="w-full"/>
                                    </div>

                                    <div className="my-3">
                                        <div className="flex-row-item-center">
                                            <div className="text-sm mr-6">Ticket sales end time</div>
                                            <div className="flex-row-item-center text-sm font-semibold">
                                                <div className="flex-row-item-center">
                                                    <div>No limit</div>
                                                    <i className="uil-check-circle ml-2 text-2xl text-green-500"/>
                                                </div>
                                                <div className="flex-row-item-center ml-3">
                                                    <div>Limit</div>
                                                    <i className="uil-circle ml-2 text-2xl text-gray-500"/>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Input type="date" className="w-full"
                                                startAdornment={<i className="uil-calender text-lg"/>}/>
                                            <Input type="time" className="w-full"
                                                startAdornment={<i className="uil-clock text-lg"/>}/>
                                        </div>
                                    </div>
                                    <div className="my-3">
                                        <div className="text-sm mr-6">Qualification</div>
                                        <div className="text-xs text-gray-500 mb-3">
                                                People possessing the badge you select have the privilege to make
                                                payments at this price.
                                        </div>
                                        <Button variant={'secondary'} className="text-sm">Select a Badge</Button>
                                    </div>
                                </div>
                            </div>
                        </>
                        }
                    </div>

                    <div className="mb-8">
                        <div className="border border-gray-200 rounded-lg">
                            <div onClick={() => {
                                setEnableMoreSetting(!enableMoreSetting)
                                setTimeout(() => {
                                    window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})
                                }, 500)
                            }}
                            className={`${buttonVariants({variant: 'ghost'})} flex w-full justify-between items-center cursor-pointer`}>
                                <div className="font-semibold">
                                    {lang['More Setting']}
                                </div>

                                <div className={`flex items-center ${enableMoreSetting ? 'rotate-180' : ''}`}>
                                    {enableMoreSetting
                                        ? <i className="uil-sorting text-xl"/>
                                        : <i className="uil-direction text-xl"/>
                                    }
                                </div>
                            </div>

                            <div
                                className={`transition-all overflow-hidden duration-500 ${enableMoreSetting ? 'max-h-[1000px]' : 'max-h-0'}`}>
                                <div className="p-4">
                                    <div className="font-semibold mb-1 text-sm">{lang['Event Badge']}</div>
                                    <div
                                        className="text-gray-500 text-xs">{lang['When an event participant checks in, he or she automatically receives a badge at the end of the event']}</div>
                                    <SelectedEventBadge
                                        profileBadgeClasses={data.badgeClasses}
                                        lang={lang}
                                        state={{event: draft, setEvent: setDraft}}/>

                                    <div className="flex-row-item-center justify-between mt-8">
                                        <div
                                            className="font-semibold mb-1 text-sm">{lang['Maximum participants']}</div>
                                        <Input placeholder={'No limit'}
                                            autoComplete={'off'}
                                            className="!h-[2rem] w-[130px] text-sm"
                                            type={'phone'}
                                            onChange={e => {
                                                setDraft({...draft, max_participant: parseInt(e.target.value)})
                                            }}
                                            value={draft.max_participant || ''}
                                            endAdornment={!!draft.max_participant
                                                ? <i className="uil-times-circle text-lg cursor-pointer"
                                                    onClick={() => {
                                                        setDraft({...draft, max_participant: null})
                                                    }}/>
                                                : <i className="uil-edit-alt text-lg"/>
                                            }/>
                                    </div>

                                    <div className="mt-8">
                                        <div className="font-semibold mb-1 text-sm">Display</div>
                                        <div onClick={() => {
                                            setDraft({...draft, display: 'normal'})
                                        }}
                                        className={`flex-row-item-center justify-between border cursor-pointer p-2 rounded-lg mt-2 h-auto border-gray-200 w-full text-left hover:bg-gray-100`}>
                                            <div>
                                                <div className="text-xs font-semibold">Normal event</div>
                                                <div className="text-gray-500 text-xs font-normal">Select a normal
                                                    event, the event you created is shown to all users.
                                                </div>
                                            </div>
                                            {draft.display === 'normal'
                                                ?
                                                <i className="flex-shrink-0 ml-2 uil-check-circle text-2xl text-green-500"/>
                                                :
                                                <i className="flex-shrink-0 ml-2 uil-circle text-2xl text-gray-500"/>
                                            }
                                        </div>
                                        <div onClick={() => {
                                            setDraft({...draft, display: 'private'})
                                        }}
                                        className={`flex-row-item-center justify-between border cursor-pointer p-2  rounded-lg mt-2 h-auto border-gray-200 w-full text-left hover:bg-gray-100`}>
                                            <div>
                                                <div className="text-xs font-semibold">Private event</div>
                                                <div className="text-gray-500 text-xs font-normal">Select a private
                                                    event, the event you created can only be viewed through the
                                                    link,
                                                    and users can view the event in My Event page.
                                                </div>
                                            </div>
                                            {draft.display === 'private'
                                                ?
                                                <i className="flex-shrink-0 ml-2 uil-check-circle text-2xl text-green-500"/>
                                                :
                                                <i className="flex-shrink-0 ml-2 uil-circle text-2xl text-gray-500"/>
                                            }
                                        </div>
                                        <div onClick={() => {
                                            setDraft({...draft, display: 'public'})
                                        }}
                                        className={`flex-row-item-center justify-between border cursor-pointer p-2  rounded-lg mt-2 h-auto border-gray-200 w-full text-left hover:bg-gray-100`}>
                                            <div>
                                                <div className="text-xs font-semibold">Public event</div>
                                                <div className="text-gray-500 text-xs font-normal">Select a public
                                                    event, the event you created is open to the public even other
                                                    events
                                                    are hidden for non-members.
                                                </div>
                                            </div>
                                            {draft.display === 'public'
                                                ?
                                                <i className="flex-shrink-0 ml-2 uil-check-circle text-2xl text-green-500"/>
                                                :
                                                <i className="flex-shrink-0 ml-2 uil-circle text-2xl text-gray-500"/>
                                            }
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <div className="flex-row-item-center justify-between">
                                            <div>
                                                <div className="font-semibold text-sm">{lang['Highlighted']}</div>
                                                <div className="text-gray-500 text-xs">
                                                    {lang['Select a highlight event, the event you created will display on the top of the day']}
                                                </div>
                                            </div>
                                            <Switch checked={draft.pinned}
                                                onClick={() => {
                                                    setDraft({...draft, pinned: !draft.pinned})
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <div className="flex-row-item-center justify-between">
                                            <div>
                                                <div
                                                    className="font-semibold text-sm text-amber-500">{lang['Close Event']}</div>
                                                <div className="text-xs text-amber-500">
                                                    {lang['People can not RSVP the event']}
                                                </div>
                                            </div>
                                            <Switch checked={draft.status === 'closed'}
                                                onClick={() => {
                                                    setDraft({
                                                        ...draft,
                                                        status: draft.status === 'closed' ? (event.status === 'closed' ? 'open' : event.status) : 'closed'
                                                    })
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button variant={'special'} className="w-full" onClick={checkDraft}>Create Event</Button>
                </div>
            </div>
        </div>
    </div>
}
