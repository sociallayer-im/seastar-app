'use client'

import {useEffect, useMemo, useRef, useState} from 'react'
import dayjs, {Dayjs} from 'dayjs'
import {Dictionary} from '@/lang'
import {buttonVariants} from '@/components/shadcn/Button'

interface CalendarProps  {
    lang: Dictionary
    scheduleUrl: string,
    initDate: string, // 'YYYY/MM/DD'
    onChange?: (dateStr: string) => void,
}

export default function CalendarFilter({lang, ...props}: CalendarProps) {
    const [currDate, setCurrDate] = useState(dayjs(props.initDate.replace(/-/g, '/')))
    const barRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const currMonthDateList = useMemo<Dayjs[]>(() => {
        const monthStart = currDate.startOf('month')
        const monthEnd = currDate.endOf('month')

        const dateList = []
        for (let i = monthStart; i.isBefore(monthEnd); i = i.add(1, 'day')) {
            dateList.push(i)
        }
        return dateList

    }, [currDate])

    const prevMonth = () => {
        const newDate = currDate.subtract(1, 'month').startOf('month')
        setCurrDate(newDate)
        const url = new URL(location.href)
        url.searchParams.set('start_date', newDate.format('YYYY-MM-DD'))
        url.searchParams.set('end_date', newDate.format('YYYY-MM-DD'))
        location.href = url.href
    }

    const nextMonth = () => {
        const newDate = currDate.add(1, 'month').startOf('month')
        setCurrDate(newDate)
        const url = new URL(location.href)
        url.searchParams.set('start_date', newDate.format('YYYY-MM-DD'))
        url.searchParams.set('end_date', newDate.format('YYYY-MM-DD'))
        location.href = url.href
    }

    const today = () => {
        const newDate = dayjs()
        setCurrDate(newDate)
        const url = new URL(location.href)
        url.searchParams.set('start_date', newDate.format('YYYY-MM-DD'))
        url.searchParams.set('end_date', newDate.format('YYYY-MM-DD'))
        location.href = url.href
    }

    const handleSelectDate = (dateStr: string) => {
        const url = new URL(location.href)
        url.searchParams.set('start_date', dateStr)
        url.searchParams.set('end_date', dateStr)
        location.href = url.href
    }

    useEffect(() => {
        if (barRef.current) {
            const target = barRef.current.querySelector(`[data-date="${dayjs(props.initDate).format('YYYY/MM/DD')}"]`)
            if (target) {
                // scroll to the selected date in the middle
                const scrollLeft = target.getBoundingClientRect().left - barRef.current.getBoundingClientRect().left
                barRef.current!.scrollLeft = scrollLeft
            }
        }

        const handleScroll = (e: Event) => {
            barRef.current!.scrollLeft = barRef.current!.scrollLeft + (e as WheelEvent).deltaY
        }

        const a = setInterval(() => {
            if (!!barRef.current) {
                barRef.current?.addEventListener('wheel', handleScroll)
                clearInterval(a)
            }
        }, 100)

        const b = setInterval(() => {
            if (!!containerRef.current) {
                containerRef.current?.addEventListener('wheel', (e)=> e.preventDefault())
                clearInterval(a)
            }
        }, 100)

        return () => {
            clearInterval(a)
            barRef.current?.removeEventListener('wheel', handleScroll)
        }
    }, [])

    return <div ref={containerRef} className="w-full px-3 pb-3 shadow pt-2 bg-white rounded-lg">
        <div className="flex-row-item-center justify-between">
            <div className="flex-row-item-center">
                <i className="uil-calender text-primary-foreground mr-1 text-xl" />
                <div className="font-semibold">{lang['Event Schedule']}</div>
            </div>
            <div className="flex flex-row justify-between items-center text-base font-semibold">
                <div>{currMonthDateList[0]?.format('MMM')}</div>
                <div className="ml-1">{currMonthDateList[0]?.format('YYYY')}</div>

                <i className="uil-angle-left text-2xl cursor-pointer active:scale-95" onClick={prevMonth}/>
                <svg className="cursor-pointer active:scale-95" onClick={today}
                     xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40"
                     fill="none" id="bui7__anchor">
                    <circle cx="14" cy="20" r="3" fill="#272928" />
                </svg>
                <i className="uil-angle-right text-2xl cursor-pointer active:scale-95" onClick={nextMonth}/>
            </div>
        </div>


        <div ref={barRef} className={`flex flex-row overflow-auto text-sm hide-scroll rounded-lg`}>
            {
                currMonthDateList.map((date, index) => {
                    const selected = dayjs(props.initDate).format('YYYY/MM/DD') === date.format('YYYY/MM/DD')

                    return <div key={index}
                                data-date={date.format('YYYY/MM/DD')}
                                className={`w-[50px] shrink-0 flex justify-center items-center flex-col text-center cursor-pointer`}
                                onClick={() => {
                                    handleSelectDate(dayjs(date).format('YYYY-MM-DD'))
                                }}>
                        <div className="text-gray-500 mb-1 text-xs">{date.format('ddd')}</div>
                        <div className={`${selected ? 'text-primary-foreground' : ''} font-semibold `}>{date.format('DD')}</div>
                    </div>
                })
            }
        </div>
        <a className={`${buttonVariants({variant: 'secondary', size: 'sm'})} mt-2 w-full text-sm`} href={props.scheduleUrl}>{lang['All Schedule']}</a>
    </div>
}