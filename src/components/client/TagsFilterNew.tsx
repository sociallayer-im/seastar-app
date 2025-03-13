'use client'

import {Button} from '@/components/shadcn/Button'
import {getLabelColor} from '@/utils/label_color'
import {Dictionary} from '@/lang'
import {useEffect, useRef} from 'react'
import dayjs from 'dayjs'

export interface TagsFilterProps {
    lang: Dictionary
    allowResetBtn?: boolean
    tags: string[]
    multiple?: boolean
    values?: string[]
    onSelected?: (tags: string[] | undefined) => void
}

export default function TagsFilterNew({tags, values, onSelected, multiple, lang, allowResetBtn=true}: TagsFilterProps) {
    const barRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleSelect = (tag: string) => {
        if (values?.includes(tag)) {
            const newValues = values.filter(v => v !== tag)
            onSelected?.(newValues.length ? newValues : undefined)
        } else {
            multiple ? onSelected?.([...values!, tag]) : onSelected?.([tag])
        }
    }

    useEffect(() => {
        if (barRef.current) {
            const target = barRef.current.querySelector(`[data-tag="${values?.[0]}"]`)
            if (target) {
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

    const style = {
        active: {
            color: '#fff',
            borderColor: '#292526',
            backgroundColor: '#292526'
        },
        normal: {
            borderColor: '#EDEDED',
            backgroundColor: 'transparent'
        }
    }

    return <div ref={containerRef} className="w-full py-3">
        <div ref={barRef} className="flex-row-item-center overflow-auto hide-scroll">
            {allowResetBtn &&
                <Button onClick={() => {
                    onSelected?.(undefined)
                }}
                        variant={'outline'}
                        className="select-none hover:brightness-95 mr-1 mb-1 border-foreground border"
                        size={'sm'}
                        style={values?.length ?  style.normal: style.active}>
                    <div className="text-xs font-normal">
                        <div className="font-semibold">{lang['All Tags']}</div>
                    </div>
                </Button>
            }
            {tags.filter((t, index) => !t.startsWith(':'))
                .map((t, index) => {
                    const color = getLabelColor(t)
                    const selected = values?.includes(t)

                    return <Button
                        data-tag={t}
                        key={index}
                        onClick={() => handleSelect(t)}
                        variant="outline"
                        size={'sm'}
                        style={selected ? style.active: style.normal}
                        className="select-none hover:brightness-95 mr-1 mb-1">
                        <div className="text-xs font-normal">
                            <div className="font-semibold">{t}</div>
                        </div>
                    </Button>
                })}
        </div>
    </div>
}