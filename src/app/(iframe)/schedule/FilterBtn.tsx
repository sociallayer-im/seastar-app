'use client'

import useModal from "@/components/client/Modal/useModal"
import ScheduleFilter, {ScheduleFilterLabels} from "@/app/(iframe)/schedule/ScheduleFilter"
import {Filter} from "@/app/(iframe)/schedule/data"
import {Button} from "@/components/shadcn/Button"

interface FilterBtnProps {
    filters: Filter,
    list: {
        tags: string[]
        venues: Solar.Venue[]
        tracks: Solar.Track[]
    },
    isFiltered: boolean,
    labels?: {filter?: string, filterDialog?: ScheduleFilterLabels}
}

export default function FilterBtn({filters, list, isFiltered, labels}: FilterBtnProps) {
    const {openModal} = useModal()

    const showFilter = () => {
        openModal({
            content: (close) => <ScheduleFilter
                labels={labels?.filterDialog}
                close={close}
                filters={filters}
                list={list}/>
        })
    }

    return <>
        <Button onClick={showFilter} variant={'outline'} className='h-11 text-base'>
            <span>{labels?.filter || 'Filter'}</span>
            {isFiltered && <i className="w-[10px] h-[10px] bg-red-500 rounded-full"/>}
            <i className="uil-angle-down hidden sm:block text-lg"/>
        </Button>
    </>
}
