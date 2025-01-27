import {Input} from "@/components/shadcn/Input"
import type {Dictionary} from "@/lang"
import DatePicker from "@/components/client/DatePicker"
import TimePicker from "@/components/client/TimePicker"
import {useEffect, useMemo} from "react"
import dayjs from "@/libs/dayjs"
import {calculateDuration} from "@/utils"
import TimezonePicker from "@/components/client/TimezonePicker"
import {EventDraftType, VenueDetail} from '@sola/sdk'

export interface EventDateTimeInputProps {
    lang: Dictionary
    venues: VenueDetail[],
    state: { event: EventDraftType, setEvent: (event: EventDraftType) => void }
}

export default function EventDateTimeInput({state: {event, setEvent}, lang, venues}: EventDateTimeInputProps) {
    useEffect(() => {
        if (!event.timezone && typeof window !== 'undefined') {
            setEvent({
                ...event,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            })
        }
    }, [event, setEvent])

    const venueHasTimeslots = useMemo(() => {
        return !!venues.find(v => v.id === event.venue_id)?.venue_timeslots?.length
    }, [event.venue_id, venues])

    const setStartDate = (dateStr: string) => {
        const timeStr = dayjs.tz(new Date(event.start_time).getTime(), event.timezone!).format('HH:mm')
        const result = dayjs.tz(`${dateStr} ${timeStr}`, event.timezone!)

        if (venueHasTimeslots) {
            // if the venue has timeslots, the start date should be the same as the end date
            const dateStr = result.format('YYYY/MM/DD')
            const endTimeStr = dayjs.tz(new Date(event.end_time).getTime(), event.timezone!).format('HH:mm')
            setEvent({
                ...event,
                end_time: dayjs.tz(`${dateStr} ${endTimeStr}`, event.timezone!).toISOString(),
                start_time: result.toISOString()
            })
            return
        }

        if (result.toISOString() > event.end_time) {
            const startTimeStr = dayjs(result).format('HH:mm')
            const endTimeStr = dayjs(event.end_time).format('HH:mm')

            if (endTimeStr > startTimeStr) {
                const [hours, minutes] = endTimeStr.split(':')
                const newEndTime = dayjs(result).hour(Number(hours)).minute(Number(minutes))
                setEvent({
                    ...event,
                    end_time: newEndTime.toISOString(),
                    start_time: result.toISOString()
                })
            } else {
                const newEndTime = dayjs(event.end_time).date(dayjs(result).date() + 1)
                setEvent({
                    ...event,
                    end_time: newEndTime.toISOString(),
                    start_time: result.toISOString()
                })
            }
        } else {
            setEvent({
                ...event,
                start_time: result.toISOString()
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
        const startTimeStr = dayjs.tz(new Date(event.start_time).getTime(), event.timezone!).format('YYYY/MM/DD')
        const endTimeStr = dayjs.tz(new Date(event.end_time).getTime(), event.timezone!).format('YYYY/MM/DD')

        if (startTimeStr !== endTimeStr) return ''

        const [hours, minutes] = timeStr.split(':')
        const newEndTime = dayjs.tz(new Date(event.end_time).getTime(), event.timezone!).hour(Number(hours)).minute(Number(minutes)).toDate()
        return calculateDuration(new Date(event.start_time), newEndTime)
    }

    const toDatePickerFilterFn = (dateStr: string) => {
        const startTimeStr = dayjs.tz(new Date(event.start_time).getTime(), event.timezone!).format('HH:mm')
        const endTimeStr = dayjs.tz(new Date(event.end_time).getTime(), event.timezone!).format('HH:mm')
        const res = startTimeStr < endTimeStr && endTimeStr !== '00:00'
            ? dateStr >= toDateInputStr(event.start_time, event.timezone!)
            : dateStr > toDateInputStr(event.start_time, event.timezone!)

        return res
    }

    const toTimePickerFilterFn = (timeStr: string) => {
        const startDateStr = dayjs.tz(new Date(event.start_time).getTime(), event.timezone!).format('YYYY/MM/DD')
        const endDateStr = dayjs.tz(new Date(event.end_time).getTime(), event.timezone!).format('YYYY/MM/DD')
        return startDateStr !== endDateStr || timeStr > displayTime(event.start_time, event.timezone!)
    }

    const fromDatePickerFilterFn = (dateStr: string) => {
        return dateStr >= dayjs().format('YYYY/MM/DD')
    }

    const setToAllDayEvent = () => {
        const date = dayjs.tz(new Date(event.start_time).getTime(), event.timezone!)
        setEvent({
            ...event,
            start_time: date.startOf('day').toISOString(),
            end_time: date.endOf('day').toISOString()
        })
    }

    const isAllDayEvent = useMemo(() => {
        const start = dayjs.tz(new Date(event.start_time).getTime(), event.timezone!)
        const end = dayjs.tz(new Date(event.end_time).getTime(), event.timezone!)
        return start.isSame(start.startOf('day')) && end.isSame(end.endOf('day'))
    },[event.end_time, event.start_time, event.timezone])

    const setTimezone = (tz: string) => {
        const startDateTimeStr = dayjs.tz(new Date(event.start_time).getTime(), event.timezone!).format('YYYY/MM/DD HH:mm')
        const endDateTimeStr = dayjs.tz(new Date(event.end_time).getTime(), event.timezone!).format('YYYY/MM/DD HH:mm')
        setEvent({
            ...event,
            timezone: tz,
            start_time: dayjs.tz(startDateTimeStr, tz).toISOString(),
            end_time: dayjs.tz(endDateTimeStr, tz).toISOString(),
        })
    }

    useEffect(() => {
        if (!venueHasTimeslots) return
        const startDateTime = dayjs.tz(new Date(event.start_time).getTime(), event.timezone!)
        const endDateTime = dayjs.tz(new Date(event.end_time).getTime(), event.timezone!)

        if (!startDateTime.isSame(endDateTime, 'date')) {
            setEvent({
                ...event,
                end_time: dayjs.tz(new Date(event.end_time).getTime(), event.timezone!).set('date', startDateTime.date()).toISOString()
            })
        }
    }, [venueHasTimeslots])

    return event.timezone ? <div>
        {venueHasTimeslots &&
            <div className="text-orange-300 text-xs flex-row-item-center bg-orange-50 px-2 my-2 py-0.5 rounded-lg">
                <i className="uil-info-circle text-lg mr-1"/>
                {lang['Due to the timeslot settings of the venue, only same-day events can be created']}
            </div>
        }
        <div className="flex-row-item-center">
            <div className="w-11 text-center mr-1">{lang['From']}</div>
            <DatePicker
                filterFn={fromDatePickerFilterFn}
                onChange={(data) => setStartDate(data)}
                initDate={toDateInputStr(event.start_time, event.timezone)}>
                <Input
                    className="w-[180px] ml-2 mr-2"
                    value={displayDate(event.start_time, event.timezone!)}
                    readOnly
                    startAdornment={<i className="uil-calendar-alt text-lg"/>}
                />
            </DatePicker>
            <TimePicker
                initTime={displayTime(event.start_time, event.timezone)}
                onChange={(timeStr) => setStartTime(timeStr)}/>

        </div>
        <div className="flex-row-item-center mt-2">
            <div className="w-11 text-center mr-1">{lang['To']}</div>
            <DatePicker
                disabled={venueHasTimeslots}
                filterFn={toDatePickerFilterFn}
                onChange={(data) => setEndDate(data)}
                initDate={toDateInputStr(event.end_time, event.timezone)}>
                <Input
                    className={`w-[180px] ml-2 mr-2${venueHasTimeslots ? ' opacity-40 pointer-events-none' : ''}`}
                    value={displayDate(event.end_time, event.timezone!)}
                    readOnly
                    endAdornment={venueHasTimeslots ? <i className="uil-lock text-lg"/> : undefined}
                    startAdornment={<i className="uil-calendar-alt text-lg"/>}/>
            </DatePicker>
            <TimePicker
                filterFn={toTimePickerFilterFn}
                initTime={displayTime(event.end_time, event.timezone)}
                durationFn={durationFn}
                onChange={(timeStr) => setEndTime(timeStr)}/>

            <div className="text-gray-500 hidden sm:block ml-2">
                {durationFn(displayTime(event.end_time, event.timezone!))}
            </div>
        </div>

        <div className="mt-2 flex-row-item-center select-none">
            <div
                className={`${isAllDayEvent? 'text-green-500 ' : ''}flex-shrink-0 cursor-pointer hover:bg-secondary px-2 rounded text-xs flex-row-item-center font-semibold active:brightness-90`}
                onClick={setToAllDayEvent}>
                <i className="uil-clock-three text-lg mr-0.5"/>
                {lang['All Day Event']}
            </div>

            <TimezonePicker value={event.timezone} onChange={tz => setTimezone(tz)}>
                <div
                    className="break-all cursor-pointer hover:bg-secondary px-2 rounded text-xs flex-row-item-center font-semibold active:brightness-90">
                    <i className="uil-globe text-lg mr-0.5"/>
                    <div className="webkit-box-clamp-1 max-w-34">{displayTimezone(event.timezone)}</div>
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
