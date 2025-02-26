'use client'

import TimezonePicker from "@/components/client/TimezonePicker"
import {buttonVariants} from "@/components/shadcn/Button"

export default function TimezoneForm({value, onSelect}: { value: string | null, onSelect: (tz: string) => void }) {
    return <TimezonePicker value={value || 'UTC'} className='w-full'
                           onChange={(tz) => onSelect(tz)}
    >
        <div className={`${buttonVariants({variant: 'secondary'})} w-full`}>
            <div className='w-full flex-row-item-center justify-between'>
                <div>{value}</div>
                <i className="uil-angle-down text-2xl"/>
            </div>
        </div>
    </TimezonePicker>
}