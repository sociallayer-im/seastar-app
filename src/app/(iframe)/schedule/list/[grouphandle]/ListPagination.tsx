'use client'

import dayjs, {DayjsType} from "@/libs/dayjs"
import {useEffect, useMemo} from "react"

interface WeeklyPaginationProps {
    currStartDate: string,
    timezone: string,
}

export default function ListPagination({currStartDate, timezone}: WeeklyPaginationProps) {
    const toNextWeek = () => {
        const nextWeek = dayjs.tz(currStartDate, timezone).add(1, 'week').startOf('week').format('YYYY-MM-DD')
        const url = new URL(location.href)
        url.searchParams.set('start_date', nextWeek)
        location.href = url.toString()
    }

    const toPrevWeek = () => {
        const prevWeek = dayjs.tz(currStartDate, timezone).subtract(1, 'week').startOf('week').format('YYYY-MM-DD')
        const url = new URL(location.href)
        url.searchParams.set('start_date', prevWeek)
        location.href = url.toString()
    }

    const toSelected = (date: DayjsType) => {
        const selected = date.format('YYYY-MM-DD')
        const url = new URL(location.href)
        url.searchParams.set('start_date', selected)
        location.href = url.toString()
    }

    const interval = useMemo(() => {
        const interval = []
        const curr = dayjs.tz(currStartDate, timezone).startOf('week')
        for (let i = 0; i < 7; i++) {
            interval.push(curr.add(i, 'day'))
        }
        return interval
    }, [timezone, currStartDate])

    useEffect(() => {
        const selected = document.getElementById('selected')
        if (selected) {
            selected.scrollIntoView({behavior: 'smooth', block: 'center'})
        }
    }, [])

    return <div className="flex-row-item-center sticky top-0 left-0 right-0 z-[999] my-3 sm:my-6 bg-[#F8F9F8]">
        <div className="grid gap-2 sticky top-0 z-[999] grid-cols-7 bg-[#F8F9F8] w-[1000px]">
            {
                interval.map((day, index) => {
                    const isSelected = day.format('YYYY-MM-DD') === dayjs.tz(new Date().getTime(), timezone).format('YYYY-MM-DD')
                    return <div
                        id={isSelected ? 'selected' : ''}
                        style={isSelected ? {backgroundColor: '#EFFFF9'} : {}}
                        className="h-[52px] leading-[52px] text-center"
                        key={index}>
                        <strong>{day.format('DD')}</strong>
                        <span className="ml-1">{day.format('ddd')}</span>
                    </div>
                })
            }
        </div>
    </div>
}
