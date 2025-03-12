'use client'

import {buttonVariants} from '@/components/shadcn/Button'
import DropdownMenu from '@/components/client/DropdownMenu'

export default function ScheduleViewSwitcher({weeklyUrl, dailyUrl, compactUrl, listingUrl, currView, dropdown}: {
    weeklyUrl: string,
    dailyUrl: string,
    listingUrl: string,
    compactUrl: string,
    currView: 'week' | 'day' | 'list' | 'compact',
    dropdown?: boolean
}) {
    const activeStyle = {
        background: '#fff',
        color:'#272928',
        boxShadow: '0px 1.988px 18px 0px rgba(0, 0, 0, 0.10)'
    }

    const opts = [
        {label: 'List', value: 'list', href: listingUrl},
        {label: 'Compact', value: 'compact', href: compactUrl},
        {label: 'Week', value: 'week', href: weeklyUrl},
       //  {label: 'Day', value: 'day', href: dailyUrl}
    ]

    const selected = opts.find(({value}) => value === currView)

    return !dropdown ? <div className="flex-row-item-center rounded-[8px] bg-[#ececec] py-[5px] px-[5px] ml-4">
            {
                opts.map(({label, value, href}) => {
                    return <a className={`${buttonVariants({ variant: "ghost", size: 'sm' })} ${value==='compact' ? 'w-[94px]': 'w-[74px]'} rounded-[6px] text-[#C3C7C3] hover:text-[#272928]`}
                              href={href}
                              key={value}
                              style={currView === value ? activeStyle : {}}>{label}</a>
                })
            }
    </div>
        : <DropdownMenu
            options={opts}
            valueKey={'label'}
            value={[selected!]}
            renderOption={(opt) => <div>{opt.label}</div>}
            onSelect={(opt) => {window.location.href=opt[0].href}}
        >
            <div className={`${buttonVariants({variant: 'ghost', size: 'sm'})} bg-white`}>
                {selected!.label}
                <i className="uil-angle-down text-lg" />
            </div>
        </DropdownMenu>
}

