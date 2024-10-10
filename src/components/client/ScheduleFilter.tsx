import {useMemo, useState} from "react"
import {getLabelColor} from "@/utils/label_color"
import {Filter} from "@/app/(iframe)/iframe/schedule/data"

interface ScheduleFilterProps {
    filters: Filter,
    list: {
        tags: string[]
        venues: Solar.Venue[]
        tracks: Solar.Track[]
    }
    close?: () => void
}

export default function ScheduleFilter(props: ScheduleFilterProps) {
    const [filters, setFilters] = useState(props.filters)
    const [tagSearch, setTagSearch] = useState('')

    const ifChanged = useMemo(() => {
        return JSON.stringify(filters) !== JSON.stringify(props.filters)
    }, [filters, props])

    const handleClear = () => {
        setFilters({
            tags: [],
            trackId: undefined,
            venueId: undefined,
            applied: false
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
        filters.applied && filters.profileId ? currSearchParams.set('applied', 'true') : currSearchParams.delete('applied')
        window.location.href = `${window.location.pathname}?${currSearchParams.toString()}`
    }

    const selectedVenue = props.list.venues.find(venue => venue.id === filters.venueId)
    const selectedTrack = props.list.tracks.find(track => track.id === filters.trackId)

    return <div className="bg-[--background] shadow rounded-lg p-5 w-[365px]">
        <div className="flex-row-item-center justify-between">
            <div className="text-xl font-semibold">Filters</div>
            <button
                onClick={handleClear}
                className="btn btn-ghost btn-sm text-[#6CD7B2] font-normal hover:bg-white">
                Clear All
            </button>
        </div>

        <div className="max-h-[70svh] overflow-auto">
            <div className="font-semibold mt-6 mb-3">Tags</div>
            <label
                className={`input flex my-3 flew-row w-full bg-gray-100 focus-within:outline-none focus-within:border-primary`}>
                <input
                    placeholder={'Search tags'}
                    className="flex-1" type="text" name="title"
                    value={tagSearch}
                    onChange={e => {
                        setTagSearch(e.target.value)
                    }}/>
            </label>
            <div className="flex-row-item-center justify-between cursor-pointer"
                onClick={() => updateTags()}>
                <div className="flex-row-item-center text-[#6CD7B2] font-semibold">
                    <i className="mr-2 w-[10px] h-[10px] rounded-full"
                        style={{background: '#333'}}/>
                    All Tags
                </div>
                <input
                    type="checkbox"
                    readOnly
                    checked={!filters.tags.length}
                    className="mr-2 checkbox checkbox-sm"/>
            </div>
            {
                props.list.tags
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
                            <input
                                type="checkbox"
                                readOnly
                                checked={filters.tags.includes(tag)}
                                className="mr-2 checkbox checkbox-sm"/>
                        </div>
                    })
            }

            { !!filters.profileId &&
                <div className="flex-row-item-center justify-between font-semibold mt-6 mb-3">
                    <div>Applied</div>
                    <input
                        type="checkbox"
                        onChange={() => setFilters({
                            ...filters,
                            applied: !filters.applied
                        })}
                        checked={!!filters.applied}
                        className="mr-2 checkbox checkbox-sm"/>
                </div>
            }

            {
                props.list.venues.length > 0 &&
                <>
                    <div className="font-semibold mt-6 mb-3">Venues</div>
                    <div className="dropdown w-full">
                        <div tabIndex={0} role="button"
                            className="flex-row-item-center btn w-full justify-between">
                            <div className="w-full whitespace-nowrap text-left overflow-hidden overflow-ellipsis">
                                {selectedVenue?.title || 'All venue'}
                            </div>
                            <i className="uil-angle-down hidden sm:block"></i>
                        </div>
                        <ul tabIndex={0}
                            className="max-h-[200px] overflow-auto flex-nowrap w-full dropdown-content menu bg-white rounded-box z-[9999] p-2 shadow">
                            <li className="cursor-pointer w-full"
                                onClick={() => updateVenue()}>
                                <div className="flex-row-item-center">
                                    <div className="w-[230px] whitespace-nowrap overflow-hidden overflow-ellipsis">
                                        All Venue
                                    </div>
                                    <div className="w-[20px] shrink-0 grow-0">
                                        {!filters.venueId &&
                                            <input type="checkbox" checked readOnly
                                                className="checkbox checkbox-sm shrink-0 grow-0"/>
                                        }
                                    </div>
                                </div>
                            </li>

                            {props.list.venues.map((venue) => {
                                return <li className="cursor-pointer w-full"
                                    key={venue.id}
                                    onClick={() => updateVenue(venue.id)}>
                                    <div className="flex-row-item-center">
                                        <div className="w-[230px] whitespace-nowrap overflow-hidden overflow-ellipsis">
                                            {venue.title}
                                        </div>
                                        <div className="w-[20px] shrink-0 grow-0">
                                            {filters.venueId === venue.id &&
                                                <input type="checkbox" checked readOnly
                                                    className="checkbox checkbox-sm shrink-0 grow-0"/>
                                            }
                                        </div>
                                    </div>
                                </li>
                            })}
                        </ul>
                    </div>
                </>
            }

            {props.list.tracks.length > 0 &&
                <>
                    <div className="font-semibold mt-6 mb-3">Tracks</div>
                    <div className="dropdown w-full">
                        <div tabIndex={0} role="button"
                            className="flex-row-item-center btn w-full justify-between">
                            <div className="w-full whitespace-nowrap text-left overflow-hidden overflow-ellipsis">
                                {selectedTrack?.title || 'All Tracks'}
                            </div>
                            <i className="uil-angle-down hidden sm:block"></i>
                        </div>
                        <ul tabIndex={0}
                            className="max-h-[200px] overflow-auto flex-nowrap w-full dropdown-content menu bg-white rounded-box z-[9999] p-2 shadow">
                            <li className="cursor-pointer w-full"
                                onClick={() => updateTrack()}>
                                <div className="flex-row-item-center">
                                    <div className="w-[230px] whitespace-nowrap overflow-hidden overflow-ellipsis">
                                        All Venue
                                    </div>
                                    <div className="w-[20px] shrink-0 grow-0">
                                        {!filters.trackId &&
                                            <input type="checkbox" checked readOnly
                                                className="checkbox checkbox-sm shrink-0 grow-0"/>
                                        }
                                    </div>
                                </div>
                            </li>

                            {props.list.tracks.map((track) => {
                                return <li className="cursor-pointer w-full"
                                    key={track.id}
                                    onClick={() => updateTrack(track.id)}>
                                    <div className="flex-row-item-center">
                                        <div className="w-[230px] whitespace-nowrap overflow-hidden overflow-ellipsis">
                                            {track.title}
                                        </div>
                                        <div className="w-[20px] shrink-0 grow-0">
                                            {filters.trackId === track.id &&
                                                <input type="checkbox" checked readOnly
                                                    className="checkbox checkbox-sm shrink-0 grow-0"/>
                                            }
                                        </div>
                                    </div>
                                </li>
                            })}
                        </ul>
                    </div>
                </>
            }
        </div>


        <div className="flex-row-item-center mt-6 justify-center">
            <button className="btn flex-1"
                onClick={() => {props.close && props.close()}}>
                Cancel
            </button>
            <button className="btn btn-primary flex-1 ml-2"
                onClick={handleConfirm}>
                Show Events
            </button>
        </div>
    </div>
}
