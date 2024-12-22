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
import {getOccupiedTimeEvent} from "@/service/solar"
import useModal from "../../../../../components/client/Modal/useModal"

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

    // ui
    const [enableNote, setEnableNote] = useState(false)
    const [enableMoreSetting, setEnableMoreSetting] = useState(false)

    // errors
    const [timeError, setTimeError] = useState('')
    const [occupiedEvent, setOccupiedEvent] = useState<Solar.Event | null>(null)
    const [tagError, setTagError] = useState('')

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
                data.isManager,
                data.isMember,
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

    return <div className="min-h-[100svh] w-full">
        <div className="page-width min-h-[100svh] px-3 pb-12 pt-0">
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

                    <div className="font-semibold mb-1">{lang['Event Name']} <span className="text-red-500">*</span>
                    </div>
                    <Input className="w-full mb-8"
                        value={draft.title}
                        required
                        onChange={e => setDraft({...draft, title: e.target.value})}/>

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
                            isManager={data.isManager}
                            isMember={data.isMember}
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
                        <div className="text-red-400 mt-2 text-xs">{timeError}</div>
                        {!!occupiedEvent &&
                            <div
                                className="text-red-400 mt-2 text-xs">{lang['The selected time slot is occupied by another event at the current venue. Occupying event:']}
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
                        <div className="text-red-400 mt-2 text-xs">{tagError}</div>
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
                                    <Button variant={'secondary'} className="mt-2 text-sm">
                                        <i className="uil-plus-circle text-lg"/>
                                        {lang['Set a POAP badge for attendees']}
                                    </Button>

                                    <div className="flex-row-item-center justify-between mt-8">
                                        <div className="font-semibold mb-1 text-sm">{lang['Maximum participants']}</div>
                                        <Input placeholder={'No limit'}
                                            autoComplete={'off'}
                                            className="!h-[2rem] w-[130px] text-sm"
                                            type={'phone'}
                                            onChange={e => {
                                                setDraft({...draft, max_participants: parseInt(e.target.value)})
                                            }}
                                            value={draft.max_participants || ''}
                                            endAdornment={!!draft.max_participants
                                                ? <i className="uil-times-circle text-lg cursor-pointer"
                                                    onClick={() => {
                                                        setDraft({...draft, max_participants: null})
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
                                                : <i className="flex-shrink-0 ml-2 uil-circle text-2xl text-gray-500"/>
                                            }
                                        </div>
                                        <div onClick={() => {
                                            setDraft({...draft, display: 'private'})
                                        }}
                                        className={`flex-row-item-center justify-between border cursor-pointer p-2  rounded-lg mt-2 h-auto border-gray-200 w-full text-left hover:bg-gray-100`}>
                                            <div>
                                                <div className="text-xs font-semibold">Private event</div>
                                                <div className="text-gray-500 text-xs font-normal">Select a private
                                                    event, the event you created can only be viewed through the link,
                                                    and users can view the event in My Event page.
                                                </div>
                                            </div>
                                            {draft.display === 'private'
                                                ?
                                                <i className="flex-shrink-0 ml-2 uil-check-circle text-2xl text-green-500"/>
                                                : <i className="flex-shrink-0 ml-2 uil-circle text-2xl text-gray-500"/>
                                            }
                                        </div>
                                        <div onClick={() => {
                                            setDraft({...draft, display: 'public'})
                                        }}
                                        className={`flex-row-item-center justify-between border cursor-pointer p-2  rounded-lg mt-2 h-auto border-gray-200 w-full text-left hover:bg-gray-100`}>
                                            <div>
                                                <div className="text-xs font-semibold">Public event</div>
                                                <div className="text-gray-500 text-xs font-normal">Select a public
                                                    event, the event you created is open to the public even other events
                                                    are hidden for non-members.
                                                </div>
                                            </div>
                                            {draft.display === 'public'
                                                ?
                                                <i className="flex-shrink-0 ml-2 uil-check-circle text-2xl text-green-500"/>
                                                : <i className="flex-shrink-0 ml-2 uil-circle text-2xl text-gray-500"/>
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
                                                <div className="font-semibold text-sm text-orange-300">{lang['Close Event']}</div>
                                                <div className="text-xs text-orange-300">
                                                    {lang['People can not RSVP the event']}
                                                </div>
                                            </div>
                                            <Switch checked={draft.status === 'closed'}
                                                onClick={() => {
                                                    setDraft({...draft, status: draft.status === 'closed' ? (event.status === 'closed' ? 'open' : event.status) : 'closed'})
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}
