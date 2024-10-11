'use client'

import useModal from "@/components/client/Modal/useModal"
import ScheduleFilter from "@/components/client/ScheduleFilter"
import {Filter} from "@/app/(iframe)/schedule/data"

interface FilterBtnProps {
    filters: Filter,
    list: {
        tags: string[]
        venues: Solar.Venue[]
        tracks: Solar.Track[]
    }
}

export default function FilterBtn({filters, list}: FilterBtnProps) {
    const {openModal} = useModal()
    const isFiltered = filters.tags.length > 0
        || !!filters.venueId
        || !!filters.trackId
        || !!filters.applied

    const showFilter = () => {
        openModal({
            content: (close) => <ScheduleFilter
                close={close}
                filters={filters}
                list={list}/>
        })
    }

    return <button onClick={showFilter} className="flex-row-item-center !inline-flex btn btn-outline btn-sm justify-between relative">
        <span>Filter</span>
        {isFiltered && <i className="w-[10px] h-[10px] bg-red-500 rounded-full"/>}
        <i className="uil-angle-down hidden sm:block"/>
    </button>
}
