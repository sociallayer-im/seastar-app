'use client'

import {Button} from "@/components/shadcn/Button"
import CardEvent from "@/components/CardEvent"
import NoData from "@/components/NoData"
import {EventWithJoinStatus} from '@sola/sdk'
import {Dictionary} from '@/lang'
import useTabParam from '@/hooks/useTabParam'

export interface EventTabProps {
    lang: Dictionary,
    attends: EventWithJoinStatus[]
    hosting: EventWithJoinStatus[]
    stared: EventWithJoinStatus[]
    coHosting: EventWithJoinStatus[]
}

export default function Tabs({attends, hosting, stared, coHosting, lang}: EventTabProps) {
    // All four lists arrive together from the server, so switching is free —
    // it just needs to be linkable. `list` rather than `tab`, which the page's
    // own tabs own.
    const lists = [
        {key: 'attended', label: lang['Attended'], events: attends},
        {key: 'created', label: lang['Hosting'], events: hosting},
        {key: 'cohosting', label: lang['Co-hosting'], events: coHosting},
        ...(stared.length ? [{key: 'star', label: lang['Starred'], events: stared}] : [])
    ]

    const [tab, setTab] = useTabParam('list', lists.map(l => l.key))
    const current = lists.find(l => l.key === tab) || lists[0]

    return <div className="py-4">
        <div className="flex flex-row-item-center">
            {lists.map(l =>
                <Button key={l.key}
                    variant={current.key === l.key ? 'outline' : 'ghost'}
                    className={'font-normal'}
                    size={'sm'}
                    onClick={() => setTab(l.key)}>
                    <span className="font-normal text-sm">{l.label}</span>
                </Button>
            )}
        </div>

        <div className="grid grid-cols-1 gap-3 py-4">
            {current.events.map((event, i) => <CardEvent key={i} event={event} lang={lang}/>)}
        </div>

        {/* Checked against the list being shown. The old version tested
            `hosting` for the co-hosting tab, so an empty co-hosting list said
            nothing at all whenever the user happened to host something. */}
        {!current.events.length && <NoData/>}
    </div>
}
