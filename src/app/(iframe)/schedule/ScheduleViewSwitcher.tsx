import {buttonVariants} from '@/components/shadcn/Button'

export default function ScheduleViewSwitcher({weeklyUrl, dailyUrl, listingUrl, currView}: {
    weeklyUrl: string,
    dailyUrl: string,
    listingUrl: string,
    currView: 'week' | 'day' | 'list'
}) {
    const activeStyle = {
        background: '#fff',
        color:'#272928',
        boxShadow: '0px 1.988px 18px 0px rgba(0, 0, 0, 0.10)'
    }
    return <div className="flex-row-item-center rounded-[8px] bg-[#ececec] py-[5px] px-[5px] ml-4">
        <a className={`${buttonVariants({ variant: "ghost", size: 'sm' })}  w-[74px] rounded-[6px] text-[#C3C7C3] hover:text-[#272928]`} href={listingUrl} style={currView === 'list' ? activeStyle : {}}>List</a>
        <a className={`${buttonVariants({ variant: "ghost", size: 'sm' })}  w-[74px] rounded-[6px] text-[#C3C7C3] hover:text-[#272928]`} href={weeklyUrl} style={currView === 'week' ? activeStyle : {}}>Week</a>
        <a className={`${buttonVariants({ variant: "ghost", size: 'sm' })}  w-[74px] rounded-[6px] text-[#C3C7C3] hover:text-[#272928]`} href={dailyUrl} style={currView === 'day' ? activeStyle : {}}>Day</a>
    </div>
}
