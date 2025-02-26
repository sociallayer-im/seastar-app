import {formatEventTime} from '@/utils'

export default function FormatEventTime({dateTimeStr, tz}: {dateTimeStr: string, tz?:null | string}) {
    return <span>{formatEventTime(dateTimeStr, tz)}</span>
}