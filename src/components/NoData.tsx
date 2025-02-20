export default function NoData({label}:{label?:string}) {
    return <div className="flex flex-col items-center justify-center p-8 w-full">
        <img src="/images/empty.svg" alt=""/>
        <div className='text-[#999]'>{label || 'No Data'}</div>
    </div>
}
