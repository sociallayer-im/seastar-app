'use client'

import TimezonePicker from "@/components/client/TimezonePicker"
import {buttonVariants} from "@/components/shadcn/Button"

export default function TimezoneForm() {
    return <TimezonePicker value={'UTC'} className='w-full'>
        <div className={`${buttonVariants({variant: 'secondary'})} w-full`}>
            <div className='w-full flex-row-item-center justify-between'>
                <div>UTC</div>
                <i className="uil-angle-down text-2xl" />
            </div>
        </div>
    </TimezonePicker>
}