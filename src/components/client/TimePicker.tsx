import {useEffect, useId, useMemo, useRef, useState} from "react"
import dayjs, {Dayjs} from "dayjs"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/shadcn/Popover"
import {Input} from "@/components/shadcn/Input"
import {className} from 'postcss-selector-parser'

interface TimePickerProps {
    initTime: string,
    className?: string,
    onChange?: (timeStr: string) => void,
    filterFn?: (datetimeStr: string) => boolean
    durationFn?: (timeStr: string) => string,
}

interface TimeListProps extends Omit<TimePickerProps, 'children'> {
    close: () => void
}

export function TimeList(props: TimeListProps) {
    const minutesStep = 30
    const id = useId()

    const timeList = useMemo(() => {
        const dateStr = dayjs().format('YYYY/MM/DD')
        const timeStart = dayjs(`${dateStr} 00:00`)
        const timeEnd = dayjs(`${dateStr} 23:59`)
        const list: Dayjs[] = []
        for (let i = timeStart; i.isBefore(timeEnd); i = i.add(minutesStep, 'minute')) {
            list.push(i)
        }
        return list
    }, [])

    // scroll to selected time
    useEffect(() => {
        const interval = setInterval(() => {
            const content = document.getElementById(id)
            const selected = content?.querySelector('.selected')
            if (selected) {
                const itemHeight = selected.clientHeight
                const index = parseInt(selected.getAttribute('data-index') || '0')
                content?.scrollTo({top: itemHeight * (index - 2)})
            }
            clearInterval(interval)
        }, 0)

        return () => clearInterval(interval)
    }, [id])


    return <div id={id} className="max-h-[200px] overflow-auto">
        <div>{
            timeList.map((time, index) => {
                const enabled = !props.filterFn || props.filterFn(time.format('HH:mm'))
                const selected = props.initTime === time.format('HH:mm')
                const duration = props.durationFn?.(time.format('HH:mm'))

                return <div key={index}
                    data-index={index}
                    className={`${enabled ? '' : 'opacity-30 pointer-events-none '}${selected ? 'font-semibold bg-gray-100 selected ' : ''}cursor-pointer py-2 px-2 hover:bg-gray-200 active:scale-95 rounded-lg  whitespace-nowrap flex flex-row items-center`}
                    onClick={(e) => {
                        e.preventDefault()
                        props.onChange?.(dayjs(time).format('HH:mm'))
                        props.close()
                    }}>
                    <span className={'w-10'}>{time.format('HH:mm')}</span>
                    {
                        !!duration && <span className="ml-2 text-xs opacity-30">{duration}</span>
                    }
                </div>
            })
        }
        </div>
    </div>
}

export default function TimePicker(props: TimePickerProps) {
    const [open, setOpen] = useState(false)

    const inputRef = useRef<HTMLInputElement | null>(null)
    const contentRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (open && !!inputRef.current) {
            const interval = setInterval(() => {
                if (document.activeElement !== inputRef.current) {
                    clearInterval(interval)
                } else {
                    inputRef.current?.focus()
                }
            }, 0)
            // 点击input 以外的地方关闭
            const close = (e: MouseEvent) => {
                if (!e.composedPath().includes(inputRef.current!) && !e.composedPath().includes(contentRef.current!)) {
                    clearInterval(interval)
                    inputRef.current?.blur()
                    setOpen(false)
                }
            }
            window.addEventListener('mousedown', close)

            return () => {
                clearInterval(interval)
                window.removeEventListener('mousedown', close)
            }
        } else {
            inputRef.current?.blur()
        }
    }, [open])

    return <div className={`flex-row-item-center flex-1 ${props.className}`}>
        <Input className={`flex-1`}
            ref={inputRef}
            value={props.initTime}
            type="time" variant="textCenter"
            onFocus={() => {
                setOpen(true)
            }}
            onChange={e => {
                !!props.onChange && props.onChange(e.target.value)
            }}
        />
        <Popover open={open}>
            <PopoverTrigger>
                <div className="h-12"></div>
            </PopoverTrigger>
            <PopoverContent ref={contentRef} align="end" className="bg-background">
                <TimeList {...props} close={() => {
                    setOpen(false)
                }}/>
            </PopoverContent>
        </Popover>
    </div>
}
