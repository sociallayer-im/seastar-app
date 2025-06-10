'use client'

import {useState} from "react"
import {Button} from "@/components/shadcn/Button"
import CardEvent from "@/components/CardEvent"
import NoData from "@/components/NoData"
import {EventWithJoinStatus} from '@sola/sdk'
import {Dictionary} from '@/lang'


export interface EventTabProps {
    lang: Dictionary,
    attends: EventWithJoinStatus[]
    hosting: EventWithJoinStatus[]
    stared: EventWithJoinStatus[]
    coHosting: EventWithJoinStatus[]
}

export default function Tabs({attends, hosting, stared, coHosting, lang}: EventTabProps) {
    const [tab, setTab] = useState<'attended' | 'created' | 'star' | 'cohosting'>('attended')
    return <div className="py-4">
        <div className="flex flex-row-item-center">
            <Button variant={tab === 'attended' ? 'outline' : 'ghost'}
                size={'sm'}
                onClick={() => setTab('attended')}>
                <span className="font-normal text-sm">{lang['Attended']}</span>
            </Button>
            <Button variant={tab === 'created' ? 'outline' : 'ghost'}
                className={'font-normal'}
                size={'sm'}
                onClick={() => setTab('created')}>
                <span className="font-normal text-sm">{lang['Hosting']}</span>
            </Button>
            <Button variant={tab === 'cohosting' ? 'outline' : 'ghost'}
                    className={'font-normal'}
                    size={'sm'}
                    onClick={() => setTab('cohosting')}>
                <span className="font-normal text-sm">{lang['Co-hosting']}</span>
            </Button>
            {!!stared.length &&
                <Button variant={tab === 'star' ? 'outline' : 'ghost'}
                    className={'font-normal'}
                    size={'sm'}
                    onClick={() => setTab('star')}>
                    <span className="font-normal text-sm">{lang['Starred']}</span>
                </Button>
            }
        </div>

        { tab === 'attended' &&
            <div className="grid grid-cols-1 gap-3 py-4">
                {
                    attends.map((event, i) => {
                        return <CardEvent key={i} event={event} lang={lang} />
                    })
                }
            </div>
        }

        { tab === 'created' &&
            <div className="grid grid-cols-1 gap-3 py-4">
                {
                    hosting.map((event, i) => {
                        return <CardEvent key={i} event={event} lang={lang} />
                    })
                }
            </div>
        }

        { tab === 'star' &&
            <div className="grid grid-cols-1 gap-3 py-4">
                {
                    stared.map((event, i) => {
                        return <CardEvent key={i} event={event} lang={lang} />
                    })
                }
            </div>
        }

        { tab === 'star' &&
            <div className="grid grid-cols-1 gap-3 py-4">
                {
                    stared.map((event, i) => {
                        return <CardEvent key={i} event={event} lang={lang} />
                    })
                }
            </div>
        }

        { tab === 'cohosting' &&
            <div className="grid grid-cols-1 gap-3 py-4">
                {
                    coHosting.map((event, i) => {
                        return <CardEvent key={i} event={event} lang={lang} />
                    })
                }
            </div>
        }


        {
            ((!attends.length && tab === 'attended') ||
                (!hosting.length && tab === 'created') ||
                (!hosting.length && tab === 'cohosting') ||
                (!stared.length && tab === 'star')) && <NoData />
        }
    </div>
}
