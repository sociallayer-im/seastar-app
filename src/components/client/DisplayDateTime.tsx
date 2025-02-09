import dayjs from '@/libs/dayjs'

export default function DisplayDateTime(props: { dataTimeStr: string, tz?: string, format?: string }) {
    let str = props.dataTimeStr
    if (str.includes('T')) {
        if (!str.endsWith('Z')) {
            str = str + 'Z'
        }
    } else {
        str = str.replace(/-/g, '/')
    }
    const date = props.tz ? dayjs.tz(new Date(str).getTime(), props.tz) : dayjs(str)
    return date.format(props.format || 'YYYY-MM-DD HH:mm')
}