'use client'

import useModal from "@/components/client/Modal/useModal"
import ScheduleFilter, {ScheduleFilterLabels} from "@/app/(iframe)/schedule/ScheduleFilter"
import {Filter} from "@/app/(iframe)/schedule/data"
import {Button} from "@/components/shadcn/Button"
import { IframeSchedulePageSearchParams } from "./utils"

interface FilterBtnProps {
    filters: Filter,
    list: {
        tags: string[]
        venues: Solar.Venue[]
        tracks: Solar.Track[]
    },
    compact?: boolean,
    isFiltered: boolean,
    labels?: { filter?: string, filterDialog?: ScheduleFilterLabels },
    onChange?: (searchParams: IframeSchedulePageSearchParams) => void
}

export default function FilterBtn({filters, list, isFiltered, labels, compact, onChange}: FilterBtnProps,) {
    const {openModal} = useModal()

    const showFilter = () => {
        openModal({
            content: (close) => <ScheduleFilter
                onChange={onChange}
                labels={labels?.filterDialog}
                close={close}
                filters={filters}
                list={list}/>
        })
    }

    return <>
        {!compact
            ? <Button onClick={showFilter} variant={'outline'} className='h-11 text-base'>
                <span>{labels?.filter || 'Filter'}</span>
                {isFiltered && <i className="w-[10px] h-[10px] bg-red-500 rounded-full"/>}
            </Button>
            : <Button
                size={'sm'}
                onClick={showFilter} variant={'ghost'} className='h-11 text-base bg-white'>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                        d="M15.3332 2.38086H4.66657C4.06036 2.38086 3.47898 2.62168 3.05033 3.05033C2.62168 3.47898 2.38086 4.06036 2.38086 4.66657V5.558C2.38075 5.87263 2.4456 6.18388 2.57134 6.47229V6.518C2.67898 6.76255 2.83144 6.98479 3.02086 7.17324L7.71419 11.8361V16.857C7.71393 16.9865 7.74668 17.1139 7.80933 17.2273C7.87199 17.3406 7.96249 17.436 8.07229 17.5047C8.19354 17.5798 8.33345 17.6194 8.4761 17.619C8.59537 17.6182 8.7128 17.5895 8.81895 17.5351L11.8666 16.0113C11.9922 15.948 12.0979 15.8511 12.1719 15.7315C12.2458 15.6118 12.2852 15.4739 12.2856 15.3332V11.8361L16.9485 7.17324C17.1379 6.98479 17.2904 6.76255 17.398 6.518V6.47229C17.5342 6.18614 17.6095 5.87479 17.619 5.558V4.66657C17.619 4.06036 17.3781 3.47898 16.9495 3.05033C16.5208 2.62168 15.9394 2.38086 15.3332 2.38086ZM10.9828 10.9828C10.9121 11.054 10.8563 11.1384 10.8184 11.2312C10.7805 11.324 10.7612 11.4234 10.7618 11.5237V14.8609L9.238 15.6228V11.5237C9.23858 11.4234 9.21936 11.324 9.18145 11.2312C9.14353 11.1384 9.08766 11.054 9.01705 10.9828L4.97895 6.95229H15.0209L10.9828 10.9828ZM16.0951 5.42848H3.90467V4.66657C3.90467 4.4645 3.98494 4.27071 4.12783 4.12783C4.27071 3.98494 4.4645 3.90467 4.66657 3.90467H15.3332C15.5353 3.90467 15.7291 3.98494 15.872 4.12783C16.0149 4.27071 16.0951 4.4645 16.0951 4.66657V5.42848Z"
                        fill="#272928"/>
                </svg>
            </Button>
        }
    </>
}
