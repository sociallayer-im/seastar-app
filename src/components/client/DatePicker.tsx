import {ReactNode, useMemo, useState} from "react"
import dayjs, {Dayjs} from "dayjs"
import updateLocale from "dayjs/plugin/updateLocale"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/shadcn/Popover"

dayjs.extend(updateLocale)
dayjs.updateLocale('en', {weekStart: 1})

interface DatePickerProps {
    initDate: string, // 'YYYY/MM/DD'
    onChange?: (dateStr: string) => void,
    filterFn?: (dateStr: string) => boolean,
    children?: ReactNode,
    disabled?: boolean,
    className?: string
    format?: string //YYYY/MM/DD'
}

interface CalendarProps extends Omit<DatePickerProps, 'children'> {
    close: () => void
}

export function Calendar(props: CalendarProps) {
    const [currDate, setCurrDate] = useState(dayjs(props.initDate.replace(/-/g, '/')))
    const monthsName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

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
        setCurrDate(currDate.subtract(1, 'month'))
    }

    const nextMonth = () => {
        setCurrDate(currDate.add(1, 'month'))
    }

    return <div className="w-[316px] h-[308px] p-2">
        <div className="flex flex-row justify-between items-center py-2 text-base font-semibold">
            <i className="uil-angle-left text-2xl cursor-pointer active:scale-95" onClick={prevMonth}/>
            <div>{currMonthDateList[0]?.format('MMMM')}</div>
            <div>{currMonthDateList[0]?.format('YYYY')}</div>
            <i className="uil-angle-right text-2xl cursor-pointer active:scale-95" onClick={nextMonth}/>
        </div>

        <div className="w-[300px] grid grid-cols-7 text-sm mb-2 gap-x-2">
            {
                monthsName.map((name) => {
                    return <div key={name} className="text-center text-gray-500">{name.toUpperCase().slice(0, 2)}</div>
                })
            }
        </div>

        <div className="w-[300px] grid grid-cols-7 text-sm gap-x-2">
            {
                currMonthDateList.map((date, index) => {
                    const enabled = !props.filterFn || props.filterFn(date.format('YYYY/MM/DD'))
                    const selected = dayjs(props.initDate).format('YYYY/MM/DD') === date.format('YYYY/MM/DD')

                    return <div key={index}
                        className={`${enabled ? '' : 'opacity-30 pointer-events-none '}${selected ? 'bg-primary ' : ''}h-9 flex-col flex justify-center text-center cursor-pointer rounded-full hover:border hover:border-gray-800`}
                        style={{gridColumnStart: date.day() || 7}}
                        onClick={() => {
                            props.onChange?.(dayjs(date).format(props.format || 'YYYY/MM/DD'))
                            props.close()
                        }}
                    >
                        {date.format('DD')}
                    </div>
                })
            }
        </div>
    </div>
}

export default function DatePicker(props: DatePickerProps) {
    const {children, disabled, ...rest} = props
    const [open, setOpen] = useState(false)

    return <Popover open={open}>
        <PopoverTrigger disabled={disabled} onClick={() => !disabled && setOpen(true)} className={props.className}>
            {children}
        </PopoverTrigger>
        <PopoverContent align="start" className="bg-background" style={{zIndex: '9999'}} onInteractOutside={() => {setOpen(false)}}>
            <Calendar {...rest}  close={() => {setOpen(false)}}/>
        </PopoverContent>
    </Popover>
}
