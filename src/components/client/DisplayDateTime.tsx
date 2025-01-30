import dayjs from '@/libs/dayjs'

export default function DisplayDateTime(props: { dataTimeStr: string, tz?: string, format?: string }) {
    const str = props.dataTimeStr.endsWith('Z') ? props.dataTimeStr : props.dataTimeStr + 'Z'
    const date = props.tz ? dayjs.tz(str, props.tz) : dayjs(str)
    return date.format(props.format || 'YYYY-MM-DD HH:mm')
}