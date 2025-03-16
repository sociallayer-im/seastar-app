import {EventListFilterProps, GroupDetail} from '@sola/sdk'
import {Dictionary} from '@/lang'
import {Button} from '@/components/shadcn/Button'
import {useMemo, useState} from 'react'
import {Checkbox} from '@/components/shadcn/Checkbox'
import {getRangeFromTimeProps, getTimePropsFromRange} from '@/utils'
import DropdownMenu from '@/components/client/DropdownMenu'
import {Input} from '@/components/shadcn/Input'


export interface DialogEventHomeFilterProp {
    filterOpts: EventListFilterProps,
    groupDetail: GroupDetail,
    lang: Dictionary,
    mode?: 'reload' | 'async'
    onFilterChange?: (filterOpts: EventListFilterProps) => void
    close: () => void
}

export default function DialogEventHomeFilter({filterOpts, groupDetail, close, lang, mode='reload', onFilterChange}: DialogEventHomeFilterProp) {
    const [opts, setOpts] = useState(filterOpts)

    const TimeRangeOpts = [{
        value: 'all_time',
        label: lang['All Time']
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
        setOpts({
            ...opts,
            ...getTimePropsFromRange(range)
        })
    }

    const handleReset = () => {
        setOpts({
            ...opts,
            skip_recurring: undefined,
            skip_multi_day: undefined,
            // start_date: undefined,
            // end_date: undefined,
            venue_id: undefined
        })
    }

    const handleApply = () => {
        const searchParams = new URLSearchParams()
        const omitOpts = {
            ...opts,
            group_id: undefined,
            timezone: undefined
        }

        for (const key in omitOpts) {
            const _key = key as keyof typeof omitOpts
            if (omitOpts[_key]) {
                searchParams.append(key, omitOpts[_key])
            }
        }
        onFilterChange?.(opts)
        if (mode ==='reload') {
            window.location.href = `?${searchParams.toString()}`
        } else {
            close()
        }
    }


    return <div className="w-[350px] p-3 bg-background shadow rounded-lg">
        <div className="flex-row-item-center justify-between  mb-4">
            <div className="font-semibold text-2xl">{lang['Filter']}</div>
            <Button onClick={handleReset}
                    variant="ghost" size={'sm'} className="!font-normal text-sm text-blue-500">
                <i className="uil-repeat text-lg"/>{lang['Reset']}
            </Button>
        </div>


        <div className="flex-row-item-center justify-between my-3 text-sm"
             onClick={() => setOpts({...opts, skip_recurring: opts.skip_recurring ? undefined : '1'})}
        >
            <div className="font-semibold">Repeating Events</div>
            <Checkbox checked={!opts.skip_recurring}/>
        </div>

        <div className="flex-row-item-center justify-between my-3 text-sm"
             onClick={() => setOpts({...opts, skip_multi_day: opts.skip_multi_day ? undefined : '1'})}
        >
            <div className="font-semibold">Multi-day Events</div>
            <Checkbox checked={!opts.skip_multi_day}/>
        </div>

        {/*<div className="my-3 text-sm">*/}
        {/*    <div className="font-semibold mb-1">Times</div>*/}
        {/*    {*/}
        {/*        TimeRangeOpts.map((item, index) => {*/}
        {/*            return <Button key={index}*/}
        {/*                           onClick={() => updateTimeRange(item.value)}*/}
        {/*                           variant={selectedRange === item.value ? 'normal' : 'outline'}*/}
        {/*                           className="mr-1 text-sm" size={'sm'}>*/}
        {/*                {item.label}*/}
        {/*            </Button>*/}
        {/*        })*/}
        {/*    }*/}
        {/*</div>*/}

        <div className="my-3 text-sm">
            <div className="font-semibold mb-1">Venue</div>
            <DropdownMenu
                options={groupDetail.venues}
                renderOption={opt => <div className="max-w-[274px] line-clamp-1">{opt!.title}</div>}
                valueKey={'id'}
                onSelect={(opt) => {
                    if (opt[0]) {
                        setOpts({
                            ...opts,
                            venue_id: opt[0].id.toString()
                        })
                    }
                }}
                value={opts.venue_id ? [groupDetail.venues.find(v => v.id.toString() === opts.venue_id)!] : undefined}
            >
                <Input
                    type="text"
                    readOnly
                    value={groupDetail.venues.find((v => v.id.toString() === opts.venue_id))?.title || 'All Venues'}
                    className="cursor-pointer w-full"
                    endAdornment={<i className="uil-angle-down text-lg"/>}
                />
            </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
            <Button variant="secondary" onClick={close}>{lang['Cancel']}</Button>
            <Button variant="primary" onClick={handleApply}>{lang['Show Events']}</Button>
        </div>
    </div>
}