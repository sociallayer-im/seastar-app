'use client'

import { Dictionary } from '@/lang'
import { Button } from '@/components/shadcn/Button'
import useModal from '@/components/client/Modal/useModal'
import { useToast } from '@/components/shadcn/Toast/use-toast'
import { getAuth } from '@/utils'
import { EventDraftType, updateEvent, Event, Ticket } from '@sola/sdk'
import { CLIENT_MODE } from '@/app/config'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import { useState } from 'react'

export default function HighLightEventBtn({ event, lang, className, onHighlighted, compact }: {
    event: Event,
    lang: Dictionary,
    className?: string
    compact?: boolean
    onHighlighted?: (highlighted: boolean) => void
}) {
    const { showLoading, closeModal } = useModal()
    const { toast } = useToast()
    const { showConfirmDialog } = useConfirmDialog()

    const [highlighted, setHighlighted] = useState(event.pinned)

    const handleHighlightEvent = async (e: MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        const loading = showLoading()
        try {

            // for test
            // throw new Error('group membership required for Edge Esmeralda')

            const authToken = getAuth()
            await updateEvent({
                params: {
                    authToken: authToken!,
                    eventDraft: {
                        id: event.id,
                        pinned: !highlighted,
                        tickets: [] as Ticket[]
                    } as unknown as EventDraftType
                },
                clientMode: CLIENT_MODE
            })
            toast({
                title: highlighted ? lang['Unhighlighted'] : lang['Highlighted'],
                variant: 'success'
            })
            setHighlighted(!highlighted)
            if (onHighlighted) {
                onHighlighted(!highlighted)
            }
        } catch (e: unknown) {
            console.error('[handleAttendEvent]: ', e)

            const message = e instanceof Error ? e.message : 'Failed to attend event'

            if (message.includes('group membership required for Edge Esmeralda')) {
                showConfirmDialog({
                    lang,
                    title: 'Join Event',
                    content: 'Please purchase the ticket to join the event. <br /><a style="color: #097eff; text-decoration: underline; white-space: nowrap;" href="https://citizen-portal-ten.vercel.app/auth" target="_blank">Go to Purchase Ticket</a>',
                    type: 'info'
                })
                return
            }

            toast({
                title: message,
                variant: 'destructive'
            })
        } finally {
            closeModal(loading)
        }
    }

    return !compact ?
        <Button variant={'ghost'}
            onClick={(e) => handleHighlightEvent(e as unknown as MouseEvent)}
            className={`${className} flex items-center gap-2`}>
            {highlighted
                ? <svg className="!w-[18px] !h-[18px]" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="26" height="26"><path fill="rgb(219 39 119)" d="M442.624 630.101333l-241.322667 241.365334A42.666667 42.666667 0 1 1 140.928 811.093333l241.365333-241.322666L201.301333 388.693333A298.325333 298.325333 0 0 1 465.066667 305.92L623.658667 147.370667a85.333333 85.333333 0 0 1 120.661333 0l120.704 120.661333a85.333333 85.333333 0 0 1 0 120.704l-158.549333 158.549333a298.325333 298.325333 0 0 1-82.816 263.808l-181.034667-180.992z" p-id="16531"></path></svg>

                : <svg className="!w-[18px] !h-[18px]" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="26" height="26"><path fill="rgb(219 39 119)" d="M645.376 590.762667l-7.850667-44.202667 191.573334-191.616-121.642667-121.685333-191.658667 191.573333-44.16-7.850667a215.466667 215.466667 0 0 0-116.650666 11.477334l278.954666 278.912a215.466667 215.466667 0 0 0 11.434667-116.608z m-181.333333 68.437333L220.586667 902.570667a43.008 43.008 0 0 1-60.842667-60.842667l243.413333-243.370667L220.586667 415.786667a300.842667 300.842667 0 0 1 266.069333-83.541334l159.872-159.872a86.058667 86.058667 0 0 1 121.728 0l121.685333 121.728a86.058667 86.058667 0 0 1 0 121.685334l-159.872 159.872a300.842667 300.842667 0 0 1-83.541333 266.069333L464.042667 659.2z" p-id="16773"></path></svg>
            }
            {!compact && <span className='text-sm font-normal text-pink-600'>{lang['Highlight']}</span>}
        </Button>
        : <div className={`${className} flex items-center gap-2 cursor-pointer`} onClick={(e) => handleHighlightEvent(e as unknown as MouseEvent)}>
            {highlighted
                ? <img src="/images/pinned.png" alt="" className='w-[20px] h-[20px]' />
                : <img src="/images/unpinned.png" alt="" className='w-[20px] h-[20px]' />
            }
        </div>


}

