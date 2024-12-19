import {EventDraftType} from "@/app/(normal)/event/[grouphandle]/create/data"
import {Input} from "@/components/shadcn/Input"
import type {Dictionary} from "@/lang"
import DatePicker from "@/components/client/DatePicker"
import TimePicker from "@/components/client/TimePicker"
import {useEffect} from "react"
import dayjs from "@/libs/dayjs"
import {calculateDuration} from "@/utils"
import TimezonePicker from "@/components/client/TimezonePicker"

export interface EventDateTimeInputProps {
    lang: Dictionary
    venues: Solar.Venue[],
    state: { event: EventDraftType, setEvent: (event: EventDraftType) => void }
}

export default function EventDateTimeInput({state: {event, setEvent}, lang}: EventDateTimeInputProps) {
    useEffect(() => {
        if (!event.timezone && typeof window !== 'undefined') {
            setEvent({
                ...event,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            })
        }
    }, [event, setEvent])

    const setStartDate = (dateStr: string) => {
        const timeStr = dayjs.tz(new Date(event.start_time).getTime(), event.timezone!).format('HH:mm')
        const result = dayjs.tz(`${dateStr} ${timeStr}`, event.timezone!).toISOString()

        if (result > event.end_time) {
            const startTimeStr = dayjs(result).format('HH:mm')
            const endTimeStr = dayjs(event.end_time).format('HH:mm')

            if (endTimeStr > startTimeStr) {
                const [hours, minutes] = endTimeStr.split(':')
                const newEndTime = dayjs(result).hour(Number(hours)).minute(Number(minutes))
                setEvent({
                    ...event,
                    end_time: newEndTime.toISOString(),
                    start_time: result
                })
            } else {
                const newEndTime = dayjs(event.end_time).date(dayjs(result).date() + 1)
                setEvent({
                    ...event,
                    end_time: newEndTime.toISOString(),
                    start_time: result
                })
            }
        } else {
            setEvent({
                ...event,
                start_time: result
            })
        }
    }

    const setEndDate = (dateStr: string) => {
        const timeStr = dayjs.tz(new Date(event.end_time).getTime(), event.timezone!).format('HH:mm')
        const result = dayjs.tz(`${dateStr} ${timeStr}`, event.timezone!).toISOString()

        setEvent({
            ...event,
            end_time: result
        })
    }

    const setStartTime = (timeStr: string) => {
        const dateStr = dayjs.tz(new Date(event.start_time).getTime(), event.timezone!).format('YYYY/MM/DD')
        const result = dayjs.tz(`${dateStr} ${timeStr}`, event.timezone!).toISOString()
        setEvent({
            ...event,
            start_time: result
        })
    }

    const setEndTime = (timeStr: string) => {
        const dateStr = dayjs.tz(new Date(event.end_time).getTime(), event.timezone!).format('YYYY/MM/DD')
        const result = dayjs.tz(`${dateStr} ${timeStr}`, event.timezone!).toISOString()
        setEvent({
            ...event,
            end_time: result
        })
    }

    const durationFn = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':')
        const newEndTime = dayjs.tz(event.end_time, event.timezone!).hour(Number(hours)).minute(Number(minutes)).toDate()
        return calculateDuration(new Date(event.start_time), new Date(newEndTime))
    }

    const toDatePickerFilterFn = (dateStr: string) => {
        const startTimeStr = dayjs(event.start_time).format('HH:mm')
        const endTimeStr = dayjs(event.end_time).format('HH:mm')
        if (startTimeStr < endTimeStr) {
            return dateStr >= toDateInputStr(event.start_time, event.timezone!)
        } else {
            return dateStr > toDateInputStr(event.start_time, event.timezone!)
        }
    }

    const fromDatePickerFilterFn =  (dateStr: string) => {
        return dateStr >= dayjs().format('YYYY/MM/DD')
    }

    const setToAllDayEvent = () => {
        const date = dayjs.tz(new Date(event.start_time), event.timezone!)
        setEvent({
            ...event,
            start_time: date.startOf('day').toISOString(),
            end_time: date.endOf('day').toISOString()
        })
    }

    const setTimezone = (tz: string) => {
        const startDateTimeStr = dayjs.tz(new Date(event.start_time).getTime(), event.timezone!).format('YYYY/MM/DD HH:mm')
        const endDateTimeStr = dayjs.tz(new Date(event.end_time).getTime(), event.timezone!).format('YYYY/MM/DD HH:mm')
        console.log(startDateTimeStr, endDateTimeStr)
        setEvent({
            ...event,
            timezone: tz,
            start_time: dayjs.tz(startDateTimeStr, tz).toISOString(),
            end_time: dayjs.tz(endDateTimeStr, tz).toISOString(),
        })
    }

    return event.timezone ? <div>
        <div className="flex-row-item-center relative">
            <i className="uil-lock absolute text-lg left-3 top-9" />
            <div className="w-11 text-center mr-1">{lang['From']}</div>
            <DatePicker
                filterFn={fromDatePickerFilterFn}
                onChange={(data) => setStartDate(data)}
                initDate={toDateInputStr(event.start_time, event.timezone)}>
                <Input
                    className="w-[180px] ml-2 mr-2"
                    value={displayDate(event.start_time, event.timezone!)}
                    readOnly
                    startAdornment={<i className="uil-calendar-alt"/>}/>
            </DatePicker>
            <TimePicker initTime={displayTime(event.start_time, event.timezone)}
                onChange={(timeStr) => setStartTime(timeStr)}/>

        </div>
        <div className="flex-row-item-center mt-2">
            <div className="w-11 text-center mr-1">{lang['To']}</div>
            <DatePicker
                filterFn={toDatePickerFilterFn}
                onChange={(data) => setEndDate(data)}
                initDate={toDateInputStr(event.end_time, event.timezone)}>
                <Input
                    className="w-[180px] ml-2 mr-2"
                    value={displayDate(event.end_time, event.timezone!)}
                    readOnly
                    startAdornment={<i className="uil-calendar-alt"/>}/>
            </DatePicker>
            <TimePicker
                filterFn={(timeStr => {
                    const startDateStr = dayjs(event.start_time).format('YYYY/MM/DD')
                    const endDateStr = dayjs(event.end_time).format('YYYY/MM/DD')
                    return startDateStr !== endDateStr || timeStr > displayTime(event.start_time, event.timezone!)
                })}
                initTime={displayTime(event.end_time, event.timezone)}
                durationFn={durationFn}
                onChange={(timeStr) => setEndTime(timeStr)}/>

            <div className="text-gray-500 hidden sm:block ml-2">
                {calculateDuration(new Date(event.start_time), new Date(event.end_time))}
            </div>
        </div>

        <div className="mt-2 flex-row-item-center select-none">
            <div
                className="cursor-pointer hover:bg-secondary px-2 rounded text-sm flex-row-item-center font-semibold active:brightness-90"
                onClick={setToAllDayEvent}>
                <i className="uil-clock-three text-lg mr-0.5"/>
                {lang['All Day Event']}
            </div>

            <TimezonePicker value={event.timezone} onChange={tz => setTimezone(tz)}>
                <div
                    className="cursor-pointer hover:bg-secondary px-2 rounded text-sm flex-row-item-center font-semibold active:brightness-90">
                    <i className="uil-globe text-lg mr-0.5"/>
                    {displayTimezone(event.timezone)}
                    <img src="/images/dropdown_icon.svg" alt=""/>
                </div>
            </TimezonePicker>
        </div>
    </div> : null
}

function displayDate(dateStr: string, timezone: string) {
    return dayjs.tz((new Date(dateStr).getTime()), timezone).format('ddd, MMM DD')
}

function displayTime(dateStr: string, timezone: string) {
    return dayjs.tz((new Date(dateStr).getTime()), timezone).format('HH:mm')
}

function toDateInputStr(date: string, timezone: string) {
    return dayjs.tz(new Date(date).getTime(), timezone).format('YYYY/MM/DD')
}

function displayTimezone(tz: string) {
    const offset = dayjs.tz(new Date(), tz).utcOffset() / 60
    return `(GMT${offset >= 0 ? `+` + offset : offset}) ${tz}`
}
