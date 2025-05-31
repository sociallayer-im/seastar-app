import {useEffect, useMemo, useState} from "react"
import {getLabelColor} from "@/utils/label_color"
import {Checkbox} from '@/components/shadcn/Checkbox'
import {Button} from "@/components/shadcn/Button"
import DropdownMenu from '@/components/client/DropdownMenu'
import {Input} from '@/components/shadcn/Input'
import {getAuth} from '@/utils'
import { IframeSchedulePageSearchParams, Filter } from "./utils"

export interface ScheduleFilterLabels {
    filters?: string
    tags?: string
    venues?: string
    tracks?: string
    joined?: string
    recurring?: string
    multiDay?: string,
    cancel?: string,
    showEvents?: string
}

interface ScheduleFilterProps {
    filters: Filter,
    list: {
        tags: string[]
        venues: Solar.Venue[]
        tracks: Solar.Track[]
    }
    close?: () => void,
    labels?: ScheduleFilterLabels,
    onChange?: (searchParams: IframeSchedulePageSearchParams) => void
}

export default function ScheduleFilter(props: ScheduleFilterProps) {
    const [filters, setFilters] = useState(props.filters)
    const [tagSearch, setTagSearch] = useState('')

    const ifChanged = useMemo(() => {
        return JSON.stringify(filters) !== JSON.stringify(props.filters)
    }, [filters, props])

    const handleClear = () => {
        setFilters({
            ...filters,
            tags: [],
            trackId: undefined,
            venueId: undefined,
            applied: false,
            skipMultiDay: false,
            skipRecurring: false
        })
    }

    const updateTags = (tag?: string) => {
        if (!tag) {
            return setFilters({
                ...filters,
                tags: []
            })
        }

        const isChecked = filters.tags.includes(tag)
        setFilters({
            ...filters,
            tags: isChecked
                ? filters.tags.filter(t => t !== tag)
                : [...filters.tags, tag]
        })
    }

    const updateVenue = (venueId?: number) => {
        setFilters({
            ...filters,
            venueId
        })
        ;(document.activeElement as HTMLInputElement)?.blur()
    }

    const updateTrack = (trackId?: number) => {
        setFilters({
            ...filters,
            trackId
        })
        ;(document.activeElement as HTMLInputElement)?.blur()
    }

    const handleConfirm = () => {
        if (!ifChanged) {
            props.close?.()
            return
        }

        const currSearchParams = new URLSearchParams(window.location.search)
        filters.tags.length ? currSearchParams.set('tags', filters.tags.join(',')) : currSearchParams.delete('tags')
        filters.venueId ? currSearchParams.set('venue', filters.venueId.toString()) : currSearchParams.delete('venue')
        filters.trackId ? currSearchParams.set('track', filters.trackId.toString()) : currSearchParams.delete('track')
        filters.applied ? currSearchParams.set('applied', 'true') : currSearchParams.delete('applied')
        filters.skipRecurring ? currSearchParams.set('skip_repeat', 'true') : currSearchParams.delete('skip_repeat')
        filters.skipMultiDay ? currSearchParams.set('skip_multi_day', 'true') : currSearchParams.delete('skip_multi_day')
        if (!!props.onChange) {
            props.onChange(Object.fromEntries(currSearchParams.entries()) as IframeSchedulePageSearchParams)
        } else {
            window.location.href = `${window.location.pathname}?${currSearchParams.toString()}`
        }
    }

    const selectedVenue = props.list.venues.find(venue => venue.id === filters.venueId)
    const selectedTrack = props.list.tracks.find(track => track.id === filters.trackId)

    useEffect(() => {
        function setPosition() {
            const dropdowns = document.querySelectorAll('.event-filter-content .dropdown')
            const dialog = document.querySelector('.filter-dialog') as HTMLElement
            const dialogRect = dialog.getBoundingClientRect()
            dropdowns.forEach(dropdown => {
                const dropdownRect = dropdown.getBoundingClientRect()
                const top = dropdownRect.top - dialogRect.top
                const menu = dropdown.querySelector('.dropdown-content') as HTMLElement
                const menuRect = menu.getBoundingClientRect()
                if (window.innerHeight - dropdownRect.bottom <= 230) {
                    menu.style.top = `${top - menuRect.height - 6}px`
                } else {
                    menu.style.top = `${top + 48}px`
                }
            })
        }


        document.querySelector('.event-filter-content')?.addEventListener('scroll', setPosition)

        return () => {
            document.querySelector('.event-filter-content')?.removeEventListener('scroll', setPosition)
        }
    })

    const authToken = getAuth()

    return <div className="filter-dialog bg-[--background] shadow rounded-lg p-5 max-w-[520px] w-[100vw]">
        <div className="flex-row-item-center justify-between">
            <div className="text-xl font-semibold">{props.labels?.filters || 'Filters'}</div>
            <button
                onClick={handleClear}
                className="btn btn-ghost btn-sm text-[#6CD7B2] font-normal hover:bg-white">
                Clear All
            </button>
        </div>

        <div className="event-filter-content max-h-[70svh] overflow-x-hidden overflow-y-auto">
            <div>
                <div className="font-semibold mt-6 mb-3">{props.labels?.tags || 'Tags'}</div>
                <Input type="text"
                    startAdornment={<i className="uil-search"/>}
                    className="w-full mb-3"
                    placeholder="Search tags"
                    value={tagSearch}
                    onChange={e => {
                        setTagSearch(e.target.value)
                    }} />
                <div className="flex-row-item-center justify-between cursor-pointer"
                    onClick={() => updateTags()}>
                    <div className="flex-row-item-center text-[#6CD7B2] font-semibold">
                        <i className="mr-2 w-[10px] h-[10px] rounded-full"
                            style={{background: '#333'}}/>
                        All Tags
                    </div>
                    <Checkbox checked={!filters.tags.length}/>
                </div>
                {props.list.tags
                    .filter(tag => tag.toLowerCase().includes(tagSearch.trim().toLowerCase()))
                    .map((tag, index) => {
                        return <div key={index}
                            onClick={() => updateTags(tag)}
                            className="flex-row-item-center justify-between my-3 cursor-pointer">
                            <div className="flex-row-item-center">
                                <i className="mr-2 w-[10px] h-[10px] rounded-full"
                                    style={{background: getLabelColor(tag)}}/>
                                {tag}
                            </div>
                            <Checkbox checked={filters.tags.includes(tag)}/>
                        </div>
                    })
                }
            </div>

            {!!authToken &&
                <div className="flex-row-item-center justify-between font-semibold mt-6 mb-3">
                    <div>{props.labels?.joined || 'Joined'}</div>
                    <Checkbox checked={!!filters.applied} onCheckedChange={(checked) => setFilters({
                        ...filters,
                        applied: !!checked
                    })}/>
                </div>
            }

            <div className="flex-row-item-center justify-between font-semibold mt-6 mb-3">
                <div>{props.labels?.recurring || 'Repeating Events'}</div>
                <Checkbox checked={!filters.skipRecurring} onCheckedChange={(checked) => setFilters({
                    ...filters,
                    skipRecurring: !checked
                })}/>
            </div>

            <div className="flex-row-item-center justify-between font-semibold mt-6 mb-3">
                <div>{props.labels?.multiDay || 'Multi-day Events'}</div>
                <Checkbox checked={!filters.skipMultiDay} onCheckedChange={(checked) => setFilters({
                    ...filters,
                    skipMultiDay: !checked
                })}/>
            </div>

            {props.list.venues.length > 0 &&
                <>
                    <div className="font-semibold mt-6 mb-3">{props.labels?.venues || 'Venues'}</div>
                    <div className="w-full">
                        <DropdownMenu
                            value={selectedVenue ? [selectedVenue] : []}
                            options={[{id: 0, title: 'All venue'} as Solar.Venue, ...props.list.venues]}
                            valueKey="id"
                            onSelect={(values) => {
                                values.length && updateVenue(values[0].id)
                            }}
                            renderOption={(option) => {
                                return <div>{option.title}</div>
                            }}>
                            <Button variant="secondary" className="w-full">
                                <div className="flex flex-row justify-between w-full">
                                    {selectedVenue?.title || 'All venue'}
                                    <i className="uil-angle-down"/>
                                </div>
                            </Button>
                        </DropdownMenu>
                    </div>
                </>
            }

            {props.list.tracks.length > 0 &&
                <>
                    <div className="font-semibold mt-6 mb-3">{props.labels?.tracks || 'Tracks'}</div>
                    <div className="w-full">
                        <DropdownMenu
                            value={selectedVenue ? [selectedVenue] : []}
                            options={[{id: 0, title: 'All Tracks'} as Solar.Venue, ...props.list.tracks]}
                            valueKey="id"
                            onSelect={(values) => {
                                values.length && updateTrack(values[0].id)
                            }}
                            renderOption={(option) => {
                                return <div>{option.title}</div>
                            }}>
                            <Button variant="secondary" className="w-full">
                                <div className="flex flex-row justify-between w-full">
                                    {selectedTrack?.title || 'All Tracks'}
                                    <i className="uil-angle-down"/>
                                </div>
                            </Button>
                        </DropdownMenu>
                    </div>
                </>
            }

        </div>


        <div className="flex-row-item-center mt-6 justify-center">
            <Button variant="secondary" className="flex-1"
                onClick={() => {
                    props.close && props.close()
                }}>
                {props.labels?.cancel || 'Cancel'}
            </Button>
            <Button variant="primary" className="ml-2 flex-1"
                onClick={handleConfirm}>
                {props.labels?.showEvents || 'Show Events'}
            </Button>
        </div>
    </div>
}
