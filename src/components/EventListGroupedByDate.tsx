import {GroupDetail} from '@sola/sdk'
import dayjs from '@/libs/dayjs'
import {useMemo} from 'react'
import CardEvent from '@/components/CardEvent'
import {EventWithJoinStatus} from '@/utils'
import NoData from '@/components/NoData'

export default function EventListGroupedByDate({group, events}: {
    group?: GroupDetail,
    events: EventWithJoinStatus[]
}) {
    const listGroupedByDate = useMemo(() => {
        let res: {
            date: string,
            events: EventWithJoinStatus[]
        }[] = []

        const timezone = dayjs.tz.guess()
        events
            .forEach((event) => {
                const date = dayjs.tz(new Date(event.start_time!).getTime(), group?.timezone || timezone).format('DD MMMM, ddd')
                const index = res.findIndex(r => r.date === date)
                if (index === -1) {
                    res.push({
                        date,
                        events: [event]
                    })
                } else {
                    res[index].events.push(event)
                }
            })

        return res
    }, [group, events])

    return <div className="grid grid-cols-1 gap-3">
        {!listGroupedByDate.length && <NoData/>}
        {listGroupedByDate.map((item, index) => {
            return <div className="pl-4 mb-5 relative" key={index}>
                <i className="block w-4 h-4 border-4 z-10 absolute rounded-full left-0 top-1.5 bg-background translate-x-[-7px]"/>
                <i className="block w-[1px] h-[calc(100%-12px)] absolute left-0 top-3 border-l-2 border-dashed"/>
                <div className="text-lg font-semibold mb-2">{item.date}</div>
                {
                    item.events.map((event, index) => {
                        return <CardEvent className="mb-3" key={index} event={event}/>
                    })
                }
            </div>
        })}
    </div>
}