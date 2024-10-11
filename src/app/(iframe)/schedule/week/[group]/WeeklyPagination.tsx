'use client'

import dayjs from "@/libs/dayjs"

interface WeeklyPaginationProps {
    currStartDate: string,
    timezone: string
}

export default function WeeklyPagination({currStartDate, timezone}: WeeklyPaginationProps) {

    const toNextWeek = () => {
        const nextWeek = dayjs.tz(currStartDate, timezone).add(1, 'week').format('YYYY-MM-DD')
        location.href = `${location.pathname}?start_date=${nextWeek}`
    }

    const toPrevWeek = () => {
        const prevWeek = dayjs.tz(currStartDate, timezone).subtract(1, 'week').format('YYYY-MM-DD')
        location.href = `${location.pathname}?start_date=${prevWeek}`
    }

    const toCurrWeek = () => {
        const nextWeek = dayjs.tz(dayjs(), timezone).startOf('week').format('YYYY-MM-DD')
        location.href = `${location.pathname}?start_date=${nextWeek}`
    }

    return <>
        <div onClick={toPrevWeek}
            className="rounded-lg active:scale-95 cursor-pointer hover:bg-gray-200 text-3xl w-12 h-12 flex flex-row justify-center items-center">
            <i className="uil-angle-left"></i>
        </div>
        <div onClick={toCurrWeek}
            className="rounded-lg active:scale-95 cursor-pointer hover:bg-gray-200 text-3xl w-8 h-12 flex flex-row justify-center items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40"
                fill="none" id="bui7__anchor">
                <circle cx="14" cy="20" r="3" fill="#272928"></circle>
            </svg>
        </div>
        <div onClick={toNextWeek}
            className="rounded-lg active:scale-95 cursor-pointer hover:bg-gray-200 text-3xl w-12 h-12 flex flex-row justify-center items-center">
            <i className="uil-angle-right"></i>
        </div>
    </>
}