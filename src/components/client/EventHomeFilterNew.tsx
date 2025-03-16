'use client'

import {EventListFilterProps, GroupDetail} from '@sola/sdk'
import {Input} from '@/components/shadcn/Input'
import {Button, buttonVariants} from '@/components/shadcn/Button'
import AddToCalendarAppBtn from '@/components/client/AddtoCalendarApp'
import TagsFilterNew from '@/components/client/TagsFilterNew'
import TracksFilterNew from '@/components/client/TracksFilterNew'
import {Dictionary} from '@/lang'
import {useEffect, useMemo, useState} from 'react'
import useModal from '@/components/client/Modal/useModal'
import DialogEventHomeFilter from '@/components/client/DialogEventHomeFilter'
import CalendarFilter from '@/app/(normal)/event/[grouphandle]/CalendarFilter'
import Dayjs from '@/libs/dayjs'

export interface EventHomeFilterProps {
    filterOpts: EventListFilterProps
    groupDetail: GroupDetail
    lang: Dictionary
    isManager?: boolean
    onFiltered?: (filterOpts: EventListFilterProps) => void
}

export default function EventHomeFilterNew({filterOpts, groupDetail, lang, onFiltered}: EventHomeFilterProps) {
    const [search, setSearch] = useState(filterOpts.search_title || '')
    const [currFilterOpts, setCurrFilterOpts] = useState(filterOpts)
    const {openModal} = useModal()

    const isFiltered = useMemo(() => {
        return !!currFilterOpts.skip_recurring
            || !!currFilterOpts.skip_multi_day
            || !!currFilterOpts.venue_id
    }, [currFilterOpts])

    const updateFilterOptsToSearchParams = (filterOpts: EventListFilterProps) => {
        const searchParams = new URLSearchParams()
        const keys = Object.keys(filterOpts) as Array<keyof EventListFilterProps>
        keys.forEach((key) => {
            if (filterOpts[key]) {
                searchParams.set(key, filterOpts[key])
            } else {
                searchParams.delete(key)
            }
        })
        searchParams.delete('group_id')
        searchParams.delete('timezone')
        const url = new URL(window.location.href)
        url.search = searchParams.toString()
        window.history.replaceState(null, '', url.toString())
        setCurrFilterOpts(filterOpts)
        !!onFiltered && onFiltered(filterOpts)
    }

    const showFilterDialog = () => {
        openModal({
            content: (close) => <DialogEventHomeFilter
                mode={'async'}
                lang={lang}
                filterOpts={currFilterOpts}
                groupDetail={groupDetail}
                onFilterChange={updateFilterOptsToSearchParams}
                close={close!}/>
        })
    }

    return <>
        <div className="">
            <CalendarFilter
                onChange={(dateStr: string) => {
                    const newFilterOpts = {...currFilterOpts, start_date: dateStr, end_date: dateStr}
                    updateFilterOptsToSearchParams(newFilterOpts)
                }}
                scheduleUrl={`/event/${groupDetail.handle}/schedule/list`}
                lang={lang}
                initDate={filterOpts.start_date || Dayjs().format('YYYY-MM-DD')}
            />
        </div>

        <div className="flex-row-item-center my-7">
            <Input
                type={'search'}
                className="flex-1 !border-[#EDEDED] !border-[1px]"
                value={search}
                onInput={(e) => setSearch(e.currentTarget.value)}
                onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                        const newFilterOpts = {...currFilterOpts, search_title: e.currentTarget.value.trim()}
                        updateFilterOptsToSearchParams(newFilterOpts)
                    }
                }}
                startAdornment={<i className="uil-search text-lg"/>}
                placeholder={'Search...'}/>
            <Button variant="outline"
                    onClick={showFilterDialog}
                    className="ml-3 relative rounded-xl !bg-[#F8F9F8] !border-[#CECED3]">
                <i className="uil-filter text-lg"/>
                {isFiltered &&
                    <i className="w-2.5 h-2.5 bg-red-500 rounded-full block absolute right-1.5 top-1.5"/>
                }
            </Button>
            <a className={`ml-3 ${buttonVariants({variant: 'outline'})} rounded-xl !bg-[#F8F9F8] !border-[#CECED3]`}
               href={`/event/${groupDetail.handle}/schedule/list`}>
                <i className="uil-calender text-lg"/>
            </a>
            <AddToCalendarAppBtn
                className={'rounded-xl !bg-[#F8F9F8] !border-[#CECED3]'}
                groupHandle={groupDetail.handle} lang={lang}/>
        </div>

        {
            !!groupDetail.event_tags?.length &&
            <div className="my-2">
                <TagsFilterNew
                    lang={lang}
                    onSelected={(tags) => {
                        if (tags && tags[0]) {
                            const newFilterOpts = {...currFilterOpts, tags: tags[0]}
                            updateFilterOptsToSearchParams(newFilterOpts)
                        } else {
                            const newFilterOpts = {...currFilterOpts, tags: undefined}
                            updateFilterOptsToSearchParams(newFilterOpts)
                        }
                    }}
                    values={currFilterOpts.tags ? currFilterOpts.tags.split(',') : []}
                    tags={groupDetail.event_tags || []}/>
            </div>
        }
        {
            !!groupDetail.tracks.length &&
            <div className="my-2">
                <TracksFilterNew
                    lang={lang}
                    onSelect={(trackIds) => {
                        if (trackIds && trackIds[0]) {
                            const newFilterOpts = {...currFilterOpts, track_id: trackIds[0] + ''}
                            updateFilterOptsToSearchParams(newFilterOpts)
                        } else {
                            const newFilterOpts = {...currFilterOpts, track_id: undefined}
                            updateFilterOptsToSearchParams(newFilterOpts)
                        }
                    }}
                    values={currFilterOpts.track_id ? [parseInt(currFilterOpts.track_id)] : undefined}
                    tracks={groupDetail.tracks}/>
            </div>
        }
    </>
}