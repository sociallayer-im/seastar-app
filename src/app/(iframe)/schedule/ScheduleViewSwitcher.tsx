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
    return <div className="flex-row-item-center rounded-[8px] bg-[#ececec] py-1 px-1 ml-4">
        <a  style={currView === 'week' ? activeStyle:{}}
            className="btn btn-xs btn-ghost text-sm w-[74px] rounded-[6px] hover:text-[#272928] text-[#C3C7C3] mr-1" href={weeklyUrl}>Week</a>
        <a style={currView === 'day' ? activeStyle:{}}
            className="btn btn-xs btn-ghost text-sm w-[74px] rounded-[6px] hover:text-[#272928] text-[#C3C7C3] mr-1" href={dailyUrl}>Day</a>
        <a style={currView === 'list' ? activeStyle:{}}
            className="btn btn-xs btn-ghost text-sm w-[74px] rounded-[6px] hover:text-[#272928] text-[#C3C7C3]" href={listingUrl}>List</a>
    </div>
}
