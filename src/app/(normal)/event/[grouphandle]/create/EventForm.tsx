'use client'

import type {Dictionary} from "@/lang"
import {CreateEventPageDataType, EventDraftType} from "@/app/(normal)/event/[grouphandle]/create/data"
import {useState} from "react"
import {Button} from "@/components/shadcn/Button"
import useUploadImage from "@/hooks/useUploadImage"
import {Input} from "@/components/shadcn/Input"
import {getLabelColor} from "@/utils/label_color"
import dynamic from 'next/dynamic'
import {Switch} from "@/components/shadcn/Switch"

const RichTextEditorDynamic = dynamic(() => import('@/components/client/Editor/RichTextEditor'),{ssr: false})

export default function EventForm({lang, event, data}: { lang: Dictionary , event: EventDraftType, data: CreateEventPageDataType}) {
    const [draft, setDraft] = useState<EventDraftType>(event)
    const {uploadImage} = useUploadImage()

    const [enableNote, setEnableNote] = useState(false)

    const setCover = async () => {
        const picUrl =  await uploadImage()
        setDraft({...draft, cover_url: picUrl})
    }

    return <div className="min-h-[100svh] w-full">
        <div className="page-width min-h-[100svh] px-3 pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{event.id ? lang['Edit Event'] : lang['Create Event']}</div>

            <div className="flex flex-col sm:flex-row w-full">
                <div className="sm:order-2 mt-4 sm:mt-0 mb-8">
                    {!draft.cover_url ?
                        <div className="mb-4 flex-shrink-0 w-[324px] h-[324px] overflow-hidden mx-auto">
                            <div className="default-cover w-[452px] h-[452px]" style={{transform: 'scale(0.72)'}}>
                                <div
                                    className="font-semibold text-[27px] max-h-[80px] w-[312px] absolute left-[76px] top-[78px]">
                                    {draft.title || 'Event Name'}
                                </div>
                                <div className="text-lg absolute font-semibold left-[76px] top-[178px]">MON, AUG 26,
                                    2024 <br/>
                                    03:30 — 04:00 GMT-6
                                </div>
                                <div className="text-lg absolute font-semibold left-[76px] top-[240px]">泰国清迈</div>
                            </div>
                        </div>
                        :<img src={draft.cover_url} alt=""  className="w-[324px] h-auto mb-4"/>
                    }
                    <Button onClick={setCover}
                        variant={'secondary'} className="block btn mx-auto w-[324px]">
                        Upload Cover
                    </Button>
                </div>

                <div className="sm:order-1 mr-8 flex-1">
                    {!!data.tracks.length && <>
                        <div className="font-semibold mb-1">{lang['Event Track']}</div>
                        <div className='flex-row flex flex-wrap items-center mb-8'>
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
                    <div className="mb-3 w-full">
                        <RichTextEditorDynamic
                            initText={draft.content || ''}
                            onChange={md => {
                                setDraft({...draft, content: md})
                            }}/>
                    </div>

                    <div className="mb-8">
                        <Button className='mb-3 w-full'
                            variant={'ghost'}
                            onClick={() => {
                                setEnableNote(!enableNote)
                            }}>
                            <div className="flex flex-row items-center justify-between w-full">
                                <div className="text-sm">
                                    {lang['Event Note (Display after confirming attendance)']}
                                </div>
                                <Switch checked={enableNote} aria-readonly/>
                            </div>
                        </Button>
                        <div id="event-notes" className={`${enableNote ? '' : 'h-0'} overflow-hidden`}>
                            <RichTextEditorDynamic
                                onChange={(md) => {
                                    setDraft({...event, notes: md})
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}
