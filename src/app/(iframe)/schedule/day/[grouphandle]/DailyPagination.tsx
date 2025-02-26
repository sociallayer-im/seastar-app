'use client'

import dayjs from "@/libs/dayjs"

interface WeeklyPaginationProps {
    currStartDate: string,
    timezone: string,
}

export default function DailyPagination({currStartDate, timezone}: WeeklyPaginationProps) {
    const currStartDateObj = dayjs.tz(currStartDate, timezone)

    const toNextDay = () => {
        const nextWeek = dayjs.tz(currStartDate, timezone).add(1, 'day').format('YYYY-MM-DD')
        const url = new URL(location.href)
        url.searchParams.set('start_date', nextWeek)
        location.href = url.toString()
    }

    const toPrevDay = () => {
        const prevWeek = dayjs.tz(currStartDate, timezone).subtract(1, 'day').format('YYYY-MM-DD')
        const url = new URL(location.href)
        url.searchParams.set('start_date', prevWeek)
        location.href = url.toString()
    }

    return <>
        <div onClick={toPrevDay}
            className="w-[100px] text-2xl rounded-lg cursor-pointer hover:bg-gray-200 active:scale-95">
            <i className="uil-angle-left"/>
        </div>
        <div className="w-[100px]">
            <span>{currStartDateObj.format('ddd')}</span>
            <strong className="ml-4">{currStartDateObj.format('DD')}</strong></div>
        <div  onClick={toNextDay}
            className="w-[100px] text-2xl rounded-lg cursor-pointer hover:bg-gray-200 active:scale-95">
            <i className="uil-angle-right"/>
        </div>
    </>
}
