'use client'

import useModal from "@/components/client/Modal/useModal"
import ScheduleFilter from "@/components/client/ScheduleFilter"

interface FilterBtnProps {
    filters: {
        tags: string[]
        venueId?: number
        trackId?: number
    },
    list: {
        tags: string[]
        venues: Solar.Venue[]
        tracks: Solar.Track[]
    }
}

export default function FilterBtn({filters, list}: FilterBtnProps) {
    const {openModal} = useModal()
    const isFiltered = filters.tags.length > 0 || !!filters.venueId || !!filters.trackId

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
