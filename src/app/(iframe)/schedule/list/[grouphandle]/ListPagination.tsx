'use client'

import dayjs, {DayjsType} from "@/libs/dayjs"
import {useEffect, useMemo} from "react"
import { IframeSchedulePageSearchParams } from "@/app/(iframe)/schedule/utils"
interface WeeklyPaginationProps {
    currStartDate: string,
    timezone: string,

    onChange?: (searchParams: IframeSchedulePageSearchParams) => void
    onSelectDate?: (searchParams: IframeSchedulePageSearchParams) => void
}

export default function ListPagination({currStartDate, timezone, onChange, onSelectDate}: WeeklyPaginationProps) {
    const toNextWeek = () => {
        const nextWeek = dayjs.tz(currStartDate, timezone).add(1, 'week').startOf('week').format('YYYY-MM-DD')
        const url = new URL(location.href)
        url.searchParams.set('start_date', nextWeek)
        if (!!onChange) {
            onChange(Object.fromEntries(url.searchParams.entries()) as IframeSchedulePageSearchParams)
        } else {
            location.href = url.toString()
        }
    }

    const toPrevWeek = () => {
        const prevWeek = dayjs.tz(currStartDate, timezone).subtract(1, 'week').startOf('week').format('YYYY-MM-DD')
        const url = new URL(location.href)
        url.searchParams.set('start_date', prevWeek)
        if (!!onChange) {
            onChange(Object.fromEntries(url.searchParams.entries()) as IframeSchedulePageSearchParams)
        } else {
            location.href = url.toString()
        }
    }

    const toSelected = (date: DayjsType) => {
        const selected = date.format('YYYY-MM-DD')
        const url = new URL(location.href)
        url.searchParams.set('start_date', selected)
        if (!!onSelectDate) {
            onSelectDate(Object.fromEntries(url.searchParams.entries()) as IframeSchedulePageSearchParams)
        } else {
            location.href = url.toString()
        }
    }

    const interval = useMemo(() => {
        const interval = []
        const curr = dayjs.tz(currStartDate, timezone).startOf('week')
        for (let i = 0; i < 7; i++) {
            interval.push(curr.add(i, 'day'))
        }
        return interval
    }, [timezone, currStartDate])

    return <div className="flex-row-item-center sticky top-[0] left-0 right-0 z-[999] my-3 sm:my-6 bg-[#F8F9F8]">
        <button className="btn btn-ghost h-[54px] rounded-sm" onClick={toPrevWeek}>
            <i className="uil-angle-left text-3xl"></i>
        </button>
        <div className="flex-row-item-center bg-[#F8F9F8] w-[1000px] flex-1 overflow-auto h-[54px] overflow-y-hidden">
            {
                interval.map((day, index) => {
                    const isSelected = day.format('YYYY-MM-DD') === currStartDate
                    return <div
                        onClick={() => toSelected(day)}
                        id={isSelected ? 'selected' : ''}
                        style={isSelected ? {backgroundColor: '#EFFFF9'} : {}}
                        className="px-8 flex-1 flex-shrink-0 cursor-pointer h-[52px] leading-[52px] text-center sm:border border-[#F1F1F1]"
                        key={index}>
                        <strong>{day.format('DD')}</strong>
                        <span className="ml-1">{day.format('ddd')}</span>
                    </div>
                })
            }
        </div>
        <button className="btn btn-ghost h-[52px] rounded-sm" onClick={toNextWeek}>
            <i className="uil-angle-right text-3xl"></i>
        </button>
    </div>
}