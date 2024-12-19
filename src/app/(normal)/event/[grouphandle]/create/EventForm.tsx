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
import {eventCoverTimeStr} from "@/utils"
import SelectedEventHost from "@/components/client/SelectedEventHost"
import SelectTag from "@/components/client/SelectTag"

const RichTextEditorDynamic = dynamic(() => import('@/components/client/Editor/RichTextEditor'), {ssr: false})

export interface EventFormProps {
    lang: Dictionary
    event: EventDraftType
    data: CreateEventPageDataType,
}

export default function EventForm({lang, event, data}: EventFormProps) {
    const [draft, setDraft] = useState<EventDraftType>(event)
    const {uploadImage} = useUploadImage()

    const [enableNote, setEnableNote] = useState(false)

    const setCover = async () => {
        const picUrl = await uploadImage()
        setDraft({...draft, cover_url: picUrl})
    }

    useEffect(() => {
        console.log(draft)
    }, [draft])

    return <div className="min-h-[100svh] w-full">
        <div className="page-width min-h-[100svh] px-3 pb-12 pt-0">
            <div
                className="py-6 font-semibold text-center text-xl">{event.id ? lang['Edit Event'] : lang['Create Event']}</div>

            <div className="flex flex-col sm:flex-row w-full">
                <div className="sm:order-2 mt-4 sm:mt-0 mb-8">
                    {!draft.cover_url ?
                        <div className="mb-4 flex-shrink-0 w-[324px] h-[324px] overflow-hidden mx-auto">
                            <div className="default-cover w-[452px] h-[452px]" style={{transform: 'scale(0.72)'}}>
                                <div
                                    className="font-semibold text-[27px] max-h-[80px] w-[312px] absolute left-[76px] top-[78px]">
                                    {draft.title || lang['Event Name']}
                                </div>
                                <div className="text-lg absolute font-semibold left-[76px] top-[178px]">{eventCoverTimeStr(draft.start_time!, draft.timezone!).date} <br/>
                                    {eventCoverTimeStr(draft.start_time!, draft.timezone!).time}
                                </div>
                                <div className="text-lg absolute font-semibold left-[76px] top-[240px]">{draft.location}</div>
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
                                }} checked={enableNote} aria-readonly />
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
                            value={draft.tags || []} />
                    </div>
                </div>
            </div>
        </div>
    </div>
}
