import dayjs from '@/libs/dayjs'

export default function DisplayDateTime(props: { dataTimeStr: string, tz?: string, format?: string }) {
    let str = props.dataTimeStr.endsWith('Z') && props.dataTimeStr.includes('T') ? props.dataTimeStr : props.dataTimeStr + 'Z'
    str = str.replace(/-/g, '/')
    const date = props.tz ? dayjs.tz(str, props.tz) : dayjs(str)
    return date.format(props.format || 'YYYY-MM-DD HH:mm')
}