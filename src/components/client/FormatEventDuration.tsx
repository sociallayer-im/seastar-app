import {formatEventDuration} from '@/utils'

export default function FormatEventDuration(props: {startDate: string, endDate: string, tz?: null | string}) {
    return formatEventDuration(props.startDate, props.endDate, props.tz)
}