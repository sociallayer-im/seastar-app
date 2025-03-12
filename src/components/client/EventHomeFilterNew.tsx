'use client'

import {EventListFilterProps, GroupDetail} from '@sola/sdk'
import {Input} from '@/components/shadcn/Input'
import {Button, buttonVariants} from '@/components/shadcn/Button'
import AddToCalendarAppBtn from '@/components/client/AddtoCalendarApp'
import TagsFilter from '@/components/client/TagsFilter'
import TracksFilter from '@/components/client/TracksFilter'
import {Dictionary} from '@/lang'
import {useMemo, useState} from 'react'
import useModal from '@/components/client/Modal/useModal'
import DialogEventHomeFilter from '@/components/client/DialogEventHomeFilter'
import CalendarFilter from '@/app/(normal)/event/[grouphandle]/CalendarFilter'
import Dayjs from '@/libs/dayjs'

export interface EventHomeFilterProps {
    filterOpts: EventListFilterProps
    groupDetail: GroupDetail
    lang: Dictionary
    isManager?: boolean
}

export default function EventHomeFilterNew({filterOpts, groupDetail, lang, isManager}: EventHomeFilterProps) {
    const [search, setSearch] = useState(filterOpts.search_title || '')
    const {openModal} = useModal()

    const showFilterDialog = () => {
        openModal({
            content: (close) => <DialogEventHomeFilter
                lang={lang}
                filterOpts={filterOpts}
                groupDetail={groupDetail}
                close={close!}/>
        })
    }

    const isFiltered = useMemo(() => {
        return !!filterOpts.skip_recurring
            || !!filterOpts.skip_multi_day
            || !!filterOpts.venue_id
    }, [filterOpts])

    return <>
        <div className="">
            <CalendarFilter
                scheduleUrl={`/event/${groupDetail.handle}/schedule/list`}
                lang={lang}
                initDate={filterOpts.start_date || Dayjs().format('YYYY-MM-DD')}
            />
        </div>

        <div className="flex-row-item-center my-3">
            <Input
                type={'search'}
                className="flex-1"
                value={search}
                onInput={(e) => setSearch(e.currentTarget.value)}
                onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                        const keyword = e.currentTarget.value.trim()
                        const url = new URL(window.location.href)
                        if (keyword) {
                            url.searchParams.set('search_title', keyword)
                        } else {
                            url.searchParams.delete('search_title')
                        }
                        window.location.href = url.toString()
                    }
                }}
                startAdornment={<i className="uil-search text-lg"/>}
                placeholder={'Search...'}/>
            <Button variant="outline"
                    onClick={showFilterDialog}
                    className="ml-3 relative">
                <i className="uil-filter text-lg"/>
                {isFiltered &&
                    <i className="w-2.5 h-2.5 bg-red-500 rounded-full block absolute right-1.5 top-1.5"/>
                }
            </Button>
            <a className={`ml-3 ${buttonVariants({variant: 'outline'})}`}
               href={`/event/${groupDetail.handle}/schedule/list`}>
                <i className="uil-calender text-lg"/>
            </a>
            <AddToCalendarAppBtn groupHandle={groupDetail.handle} lang={lang}/>
        </div>

        {
            !!groupDetail.event_tags?.length &&
            <div className="my-2">
                <TagsFilter
                    lang={lang}
                    onSelected={(tags) => {
                        const url = new URL(window.location.href)
                        if (tags && tags[0]) {
                            url.searchParams.set('tags', tags[0])
                        } else {
                            url.searchParams.delete('tags')
                        }
                        window.location.href = url.toString()
                    }}
                    values={filterOpts.tags ? filterOpts.tags.split(',') : []}
                    tags={groupDetail.event_tags || []}/>
            </div>
        }
        {
            !!groupDetail.tracks.length &&
            <div className="my-2">
                <TracksFilter
                    lang={lang}
                    onSelect={(trackIds) => {
                        const url = new URL(window.location.href)
                        if (trackIds && trackIds[0]) {
                            url.searchParams.set('track_id', trackIds[0].toString())
                        } else {
                            url.searchParams.delete('track_id')
                        }
                        window.location.href = url.toString()
                    }}
                    values={filterOpts.track_id ? [parseInt(filterOpts.track_id)] : undefined}
                    tracks={groupDetail.tracks}/>
            </div>
        }
    </>
}