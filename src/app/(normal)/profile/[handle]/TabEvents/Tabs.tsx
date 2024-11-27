'use client'

import {SampleEventWithCreatorAndJoinStatus} from "@/app/(normal)/profile/[handle]/TabEvents/data"
import {useState} from "react"
import {Button} from "@/components/shadcn/Button"
import CardEvent from "@/components/CardEvent"
import NoData from "@/components/NoData"

export interface EventTabProps {
    attends: SampleEventWithCreatorAndJoinStatus[]
    hosting: SampleEventWithCreatorAndJoinStatus[]
    stared: SampleEventWithCreatorAndJoinStatus[]
    labels?: {attended?: string, created?: string, star?: string}
}

export default function Tabs({attends, hosting, stared, labels}: EventTabProps) {
    const [tab, setTab] = useState<'attended' | 'created' | 'star'>('attended')
    return <div className="py-4">
        <div className="flex flex-row-item-center">
            <Button variant={tab === 'attended' ? 'outline' : 'ghost'}
                size={'sm'}
                onClick={() => setTab('attended')}>
                <span className="font-normal text-sm">{labels?.attended || 'Attended'}</span>
            </Button>
            <Button variant={tab === 'created' ? 'outline' : 'ghost'}
                className={'font-normal'}
                size={'sm'}
                onClick={() => setTab('created')}>
                <span className="font-normal text-sm">{labels?.created || 'Created'}</span>
            </Button>
            {!!stared.length &&
                <Button variant={tab === 'star' ? 'outline' : 'ghost'}
                    className={'font-normal'}
                    size={'sm'}
                    onClick={() => setTab('star')}>
                    <span className="font-normal text-sm">{labels?.star || 'Star'}</span>
                </Button>
            }
        </div>

        { tab === 'attended' &&
            <div className="grid grid-cols-1 gap-3 py-4">
                {
                    attends.map((event, i) => {
                        return <CardEvent key={i} event={event} />
                    })
                }
            </div>
        }

        { tab === 'created' &&
            <div className="grid grid-cols-1 gap-3 py-4">
                {
                    hosting.map((event, i) => {
                        return <CardEvent key={i} event={event} />
                    })
                }
            </div>
        }

        { tab === 'star' &&
            <div className="grid grid-cols-1 gap-3 py-4">
                {
                    stared.map((event, i) => {
                        return <CardEvent key={i} event={event} />
                    })
                }
            </div>
        }


        {
            ((!attends.length && tab === 'attended') ||
                (!hosting.length && tab === 'created') ||
                (!stared.length && tab === 'star')) && <NoData />
        }
    </div>
}
