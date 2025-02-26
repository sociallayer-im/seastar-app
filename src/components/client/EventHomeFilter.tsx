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

export interface EventHomeFilterProps {
    filterOpts: EventListFilterProps
    groupDetail: GroupDetail
    lang: Dictionary
    isManager?: boolean
}

export default function EventHomeFilter({filterOpts, groupDetail, lang, isManager}: EventHomeFilterProps) {
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
            || !!filterOpts.start_date
            || !!filterOpts.end_date
            || !!filterOpts.venue_id
    }, [filterOpts])

    return <>
        <div className="flex-row-item-center">
            <a href="?collection=upcoming"
               className={`relative mr-4${filterOpts.collection === 'upcoming' ? ' font-semibold text-2xl' : ''}`}>
                {lang['Upcoming']}
                {filterOpts.collection === 'upcoming' &&
                    <img src="/images/title_hightlight.png"
                         className="absolute left-0 top-0 translate-x-[-12px]"
                         alt=""/>
                }
            </a>
            <a href="?collection=past"
               className={`relative mr-4${filterOpts.collection === 'past' ? ' font-semibold text-2xl' : ''}`}>
                {lang['Past']}
                {filterOpts.collection === 'past' &&
                    <img src="/images/title_hightlight.png"
                         className="absolute left-0 top-0 translate-x-[-12px]"
                         alt=""/>
                }
            </a>
            {isManager &&
                <a href="?private_event=1"
                   className={`relative mr-4${filterOpts.private_event ? ' font-semibold text-2xl' : ''}`}>
                    {lang['Private']}
                    {!!filterOpts.private_event &&
                        <img src="/images/title_hightlight.png"
                             className="absolute left-0 top-0 translate-x-[-12px]"
                             alt=""/>
                    }
                </a>
            }
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