'use client'

import dayjs from "@/libs/dayjs"

interface WeeklyPaginationProps {
    currStartDate: string,
    timezone: string
}

export default function MonthPagination({currStartDate, timezone}: WeeklyPaginationProps) {

    const toNextMonth = () => {
        const nextWeek = dayjs.tz(currStartDate, timezone).add(1, 'month').startOf('week').format('YYYY-MM-DD')
        const url = new URL(location.href)
        url.searchParams.set('start_date', nextWeek)
        location.href = url.toString()
    }

    const toPrevMonth = () => {
        const prevWeek = dayjs.tz(currStartDate, timezone).subtract(1, 'month').startOf('week').format('YYYY-MM-DD')
        const url = new URL(location.href)
        url.searchParams.set('start_date', prevWeek)
        location.href = url.toString()
    }

    const toCurrMonth = () => {
        const nextWeek = dayjs.tz(dayjs(), timezone).startOf('week').format('YYYY-MM-DD')
        const url = new URL(location.href)
        url.searchParams.set('start_date', nextWeek)
        location.href = url.toString()
    }

    return <>
        <div onClick={toPrevMonth}
            className="leading-7 h-7 rounded-lg active:scale-95 cursor-pointer hover:bg-gray-200 text-3xl w-12 flex flex-row justify-center items-center">
            <i className="uil-angle-left leading-7" />
        </div>
        <div onClick={toCurrMonth}
            className="leading-7 h-7 rounded-lg active:scale-95 cursor-pointer hover:bg-gray-200 text-3xl w-8 flex flex-row justify-center items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40"
                fill="none" id="bui7__anchor">
                <circle cx="14" cy="20" r="3" fill="#272928" />
            </svg>
        </div>
        <div onClick={toNextMonth}
            className="leading-7 h-7 rounded-lg active:scale-95 cursor-pointer hover:bg-gray-200 text-3xl w-12 flex flex-row justify-center items-center">
            <i className="uil-angle-right leading-7" />
        </div>
    </>
}
