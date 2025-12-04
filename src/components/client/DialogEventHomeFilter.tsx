import {EventListFilterProps, GroupDetail, EventKind} from '@sola/sdk'
import {Dictionary} from '@/lang'
import {Button} from '@/components/shadcn/Button'
import {useEffect, useMemo, useState} from 'react'
import {Checkbox} from '@/components/shadcn/Checkbox'
import {getRangeFromTimeProps, getTimePropsFromRange} from '@/utils'
import DropdownMenu from '@/components/client/DropdownMenu'
import {Input} from '@/components/shadcn/Input'
import TagsFilter from '@/components/client/TagsFilter'
import TagGroupsFilter from '@/components/client/TagGroupsFilter'
import { tagsGroupNeeded } from '@/app/configForSpecifyGroup'
import { eventKinds } from '@/app/configForSpecifyGroup'
import { VenueDetail } from '@sola/sdk'

export interface DialogEventHomeFilterProp {
    filterOpts: EventListFilterProps,
    groupDetail: GroupDetail,
    unionVenues: VenueDetail[],
    lang: Dictionary,
    close?: () => void,
    onFilterChange: (filter: EventListFilterProps) => void,
    dialogMode?: 'dialog' | 'modal'
}

export default function DialogEventHomeFilter({filterOpts, groupDetail, unionVenues, close, lang, onFilterChange, dialogMode='dialog'}: DialogEventHomeFilterProp) {
    const [opts, setOpts] = useState(filterOpts)

    useEffect(() => {
        setOpts(filterOpts)
    }, [filterOpts])

    const TimeRangeOpts = [{
        value: 'all_time',
        label:  lang['All Time']
    }, {
        value: 'today',
        label: lang['Today']
    }, {
        value: 'week',
        label: lang['Week']
    }, {
        value: 'month',
        label: lang['Month']
    }]

    const selectedRange = useMemo(() => {
        return getRangeFromTimeProps(opts.start_date, opts.end_date)
    }, [opts])

    const updateTimeRange = (range: string) => {
        const newOpts = {
            ...opts,
            ...getTimePropsFromRange(groupDetail.timezone!, range, opts.collection)
        }
        setOpts(newOpts)
        dialogMode === 'modal' && onFilterChange(newOpts)
    }

    const handleReset = () => {
        const newOpts = {
            ...opts,
            skip_recurring: undefined,
            skip_multi_day: undefined,
            start_date: undefined,
            end_date: undefined,
            venue_id: undefined,
            tags: undefined,
            track_id: undefined,
            kind: undefined
        }
        setOpts(newOpts)
        dialogMode === 'modal' && onFilterChange(newOpts)
    }

    const handleChangeTags = (tags?: string[]) => {
        const newOpts = {
            ...opts,
            tags: tags?.[0] ? tags.join(',') : undefined
        }
        setOpts(newOpts)
        dialogMode === 'modal' && onFilterChange(newOpts)
    }
    
    const handleApply = () => {
        onFilterChange(opts)
        close && close()
    }

    const className = dialogMode === 'dialog' ? 'w-[350px] p-3 bg-background shadow rounded-lg' : ''

    return <div className={className}>
        <div className="flex-row-item-center justify-between mb-4">
            <div className="font-semibold text-2xl">{lang['Filter']}</div>
            <Button onClick={handleReset}
                    variant="ghost" size={'sm'} className="!font-normal text-sm text-primary-foreground">
                {lang['Reset Filter']}
            </Button>
        </div>

        <div className="my-3 text-sm">
            {tagsGroupNeeded(groupDetail.id) ? '' : <div className="font-semibold mb-1">{lang['Programs']}</div>}          
                <DropdownMenu
                    options={groupDetail.tracks}
                    renderOption={opt => <div className="max-w-[274px] line-clamp-1">{opt!.title}{opt.kind === 'private' && <i className="uil uil-lock text-sm ml-1"/>}</div>}
                    valueKey={'id'}
                    onSelect={(opt) => {
                        if (opt[0]) {
                            const newOpts = {
                                ...opts,
                                track_id: opt[0].id.toString()
                            }
                            setOpts(newOpts)
                            dialogMode === 'modal' && onFilterChange(newOpts)
                        }
                    }}
                    value={opts.track_id ? [groupDetail.tracks.find(v => v.id.toString() === opts.track_id)!] : undefined}
                >
                    <Input
                        type="text"
                        readOnly
                        value={groupDetail.tracks.find((v => v.id.toString() === opts.track_id))?.title || lang['All Programs']}
                        className="cursor-pointer w-full"
                        endAdornment={<i className="uil-angle-down text-lg"/>}
                    />
                </DropdownMenu>
        </div>

        <div className="my-3 text-sm">
            <div className="font-semibold mb-1">{lang['Kind']}</div>
            <DropdownMenu
                options={eventKinds}
                value={opts.kind ? eventKinds.filter(k => k.value === opts.kind) : undefined}
                onSelect={(kind) => {
                    const newOpts = {
                        ...opts,
                        kind: kind[0].value ? kind[0].value as string : undefined
                    }
                    setOpts(newOpts)
                    dialogMode === 'modal' && onFilterChange(newOpts)
                }}
                renderOption={(option) => option.label}
                valueKey="value">
                <Input
                  readOnly
                  endAdornment={<img src="/images/dropdown_icon.svg" alt="" />}
                  value={opts.kind || ''}
                  className="w-full capitalize"
                  placeholder={lang['Select Kind']} />
              </DropdownMenu>
        </div>

        
        <div className={`${dialogMode === 'dialog' ? 'max-h-[calc(100vh-200px)] overflow-y-auto' : ''}`}>
            {!!groupDetail.event_tags?.length &&
                <div className="my-3 text-sm">
                    {tagsGroupNeeded(groupDetail.id) ? '' : <div className="font-semibold mb-2">{lang['Tags']}</div>}
                    <div className="my-2">
                        {tagsGroupNeeded(groupDetail.id) ?
                            <TagGroupsFilter
                                lang={lang}
                                onSelected={(tags) => {
                                    handleChangeTags(tags)
                                }}
                                multiple={true}
                                values={opts.tags ? opts.tags.split(',') : []}
                                tags={groupDetail.event_tags || []}/>
                                :   <TagsFilter
                                lang={lang}
                                onSelected={(tags) => {
                                    handleChangeTags(tags)
                                }}
                                multiple={true}
                                values={opts.tags ? opts.tags.split(',') : []}
                                tags={groupDetail.event_tags || []}/>
                        }
                    
                    </div>
                </div>
            }

            <div className="flex-row-item-center justify-between my-3 text-sm"
                onClick={() => {
                    const newOpts = {...opts, skip_recurring: opts.skip_recurring ? undefined : '1'}
                    setOpts(newOpts)
                    dialogMode === 'modal' && onFilterChange(newOpts)
                }}
            >
                <div className="font-semibold">{lang['Repeating Events']}</div>
                <Checkbox checked={!opts.skip_recurring}/>
            </div>

            <div className="flex-row-item-center justify-between my-3 text-sm"
                onClick={() => {
                    const newOpts = {...opts, skip_multi_day: opts.skip_multi_day ? undefined : '1'}
                    setOpts(newOpts)
                    dialogMode === 'modal' && onFilterChange(newOpts)
                }}
            >
                <div className="font-semibold">{lang['Multi-day Events']}</div>
                <Checkbox checked={!opts.skip_multi_day}/>
            </div>

            <div className="my-3 text-sm">
                <div className="font-semibold mb-2">{lang['Time Range']}</div>
                {
                    TimeRangeOpts.map((item, index) => {
                        return <Button key={index}
                                    onClick={() => {
                                        updateTimeRange(item.value)
                                    }}
                                    variant={'outline'}
                                    className={`${selectedRange === item.value ? '' : 'border-gray-300'} mr-1 text-xs `} size={'sm'}>
                            {item.label}
                        </Button>
                    })
                }
            </div>

            <div className="my-3 text-sm">
                <div className="font-semibold mb-1">{lang['Venues']}</div>
                <DropdownMenu
                    options={[...groupDetail.venues, ...unionVenues]}
                    renderOption={opt => <div className="max-w-[274px] line-clamp-1">{opt!.title}</div>}
                    valueKey={'id'}
                    onSelect={(opt) => {
                        if (opt[0]) {
                            const newOpts = {
                                ...opts,
                                venue_id: opt[0].id.toString()
                            }
                            setOpts(newOpts)
                            dialogMode === 'modal' && onFilterChange(newOpts)
                        }
                    }}
                    value={opts.venue_id ? [[...groupDetail.venues, ...unionVenues].find(v => v.id.toString() === opts.venue_id)!] : undefined}
                >
                    <Input
                        type="text"
                        readOnly
                        value={[...groupDetail.venues, ...unionVenues].find((v => v.id.toString() === opts.venue_id))?.title || lang['All Venues']}
                        className="cursor-pointer w-full"
                        endAdornment={<i className="uil-angle-down text-lg"/>}
                    />
                </DropdownMenu>
            </div>
        </div>

        {
            dialogMode === 'dialog' &&
            <div className="grid grid-cols-2 gap-3 mt-4">
                <Button variant="secondary" onClick={close}>{lang['Cancel']}</Button>
                <Button variant="primary" onClick={handleApply}>{lang['Show Events']}</Button>
            </div>
        }
    </div>
}