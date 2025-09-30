'use client'

import {EventDetail} from '@sola/sdk'
import useModal from '@/components/client/Modal/useModal'
import {Dictionary} from '@/lang'
import {Button} from '@/components/shadcn/Button'
import {to_plain_text} from '@/utils/markdown'
import {google, outlook, office365, yahoo, ics, CalendarEvent} from "calendar-link"

export interface AddSingleEventToCalendarAppProps {
    event: EventDetail,
    lang: Dictionary
    className?: string

}

export default function AddSingleEventToCalendarAppBtn({event, lang, className}: AddSingleEventToCalendarAppProps) {
    const {openModal} = useModal()

    const showDialog = () => {
        openModal({
            content: (close) => <DialogAddSingleEventToCalendarApp
                close={close!}
                event={event}
                lang={lang}/>
        })
    }

    return <Button variant={'secondary'} className={className}
                   onClick={showDialog}>
        <i className="uil-calendar-alt text-base"></i>
        <span>{lang['Add to Calendar']}</span>
    </Button>
}

function DialogAddSingleEventToCalendarApp({event, lang, close}: {
    event: EventDetail,
    lang: Dictionary, close: () => void
}) {
    const toLing = (type: string) => {
        const eventInfo = {
            title: event.title,
            description: to_plain_text(event.content || '').replace(/\n/g, ' '),
            start: event.start_time,
            duration: [(new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / 1000 / 60 / 60, "hour"],
            location: event.location,
            url: window.location.origin + `/event/detail/${event.id}`,
        } as CalendarEvent

        let url = ''
        if (type === 'google_calendar') {
            url = google(eventInfo)
        } else if (type === 'outlook') {
            url = outlook(eventInfo)
        } else if (type === 'office365') {
            url = office365(eventInfo)
        } else if (type === 'yahoo') {
            url = yahoo(eventInfo)
        } else if (type === 'ics') {
            url = ics(eventInfo)
        }

        const a = document.createElement('a')
        a.href = url
        a.download = `${event.title}.ics`
        a.target = '_blank'
        a.click()
        close()
    }


    return <div className="bg-background rounded-lg shadow w-[300px] p-3">
        <div className="flex-row-item-center justify-between mb-4 ">
            <div className="font-semibold text-lg">{lang['Add to Calendar']}</div>
            <i className="uil-times-circle text-xl cursor-pointer" onClick={close}/>
        </div>
        <div className="grid grid-cols-1 gap-1">
            <Button variant={'secondary'} onClick={e => {
                toLing('google_calendar')
            }}>Google Calendar</Button>
            <Button variant={'secondary'} onClick={e => {
                toLing('ics')
            }}>Apple Calendar</Button>
            <Button variant={'secondary'} onClick={e => {
                toLing('yahoo')
            }}>Yahoo</Button>
            <Button variant={'secondary'} onClick={e => {
                toLing('outlook')
            }}>Outlook.com</Button>
            <Button variant={'secondary'} onClick={e => {
                toLing('office365')
            }}>Office365</Button>
            <Button variant={'secondary'} onClick={e => {
                toLing('ics')
            }}>ICS file</Button>
        </div>
    </div>
}