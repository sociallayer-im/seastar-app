'use client'

import dayjs from "@/libs/dayjs"
import { IframeSchedulePageSearchParams } from "@/app/(iframe)/schedule/utils"

interface WeeklyPaginationProps {
    currStartDate: string,
    timezone: string,
    onChange?: (searchParams: IframeSchedulePageSearchParams) => void
}

export default function WeeklyPagination({currStartDate, timezone, onChange}: WeeklyPaginationProps) {

    const toNextWeek = () => {
        const nextWeek = dayjs.tz(currStartDate, timezone).add(1, 'week').format('YYYY-MM-DD')
        const url = new URL(location.href)
        url.searchParams.set('start_date', nextWeek)
        if (onChange) {
            onChange(Object.fromEntries(url.searchParams.entries()) as IframeSchedulePageSearchParams)
        } else {
            location.href = url.toString()
        }
    }

    const toPrevWeek = () => {
        const prevWeek = dayjs.tz(currStartDate, timezone).subtract(1, 'week').format('YYYY-MM-DD')
        const url = new URL(location.href)
        url.searchParams.set('start_date', prevWeek)
        if (onChange) {
            onChange(Object.fromEntries(url.searchParams.entries()) as IframeSchedulePageSearchParams)
        } else {
            location.href = url.toString()
        }
    }

    const toCurrWeek = () => {
        const nextWeek = dayjs.tz(dayjs(), timezone).startOf('week').format('YYYY-MM-DD')
        const url = new URL(location.href)
        url.searchParams.set('start_date', nextWeek)
        if (onChange) {
            onChange(Object.fromEntries(url.searchParams.entries()) as IframeSchedulePageSearchParams)
        } else {
            location.href = url.toString()
        }
    }

    return <>
        <div onClick={toPrevWeek}
            className="leading-7 h-7 rounded-lg active:scale-95 cursor-pointer hover:bg-gray-200 text-3xl w-12 flex flex-row justify-center items-center">
            <i className="uil-angle-left leading-7" />
        </div>
        <div onClick={toCurrWeek}
            className="leading-7 h-7 rounded-lg active:scale-95 cursor-pointer hover:bg-gray-200 text-3xl w-8 flex flex-row justify-center items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40"
                fill="none" id="bui7__anchor">
                <circle cx="14" cy="20" r="3" fill="#272928" />
            </svg>
        </div>
        <div onClick={toNextWeek}
            className="leading-7 h-7 rounded-lg active:scale-95 cursor-pointer hover:bg-gray-200 text-3xl w-12 flex flex-row justify-center items-center">
            <i className="uil-angle-right leading-7" />
        </div>
    </>
}
