'use client'
import Dayjs from "@/libs/dayjs"

export default function FormatTime(props: {time: string}) {
    const _time = props.time.endsWith('z') ? props.time : props.time + 'z'
    return <span>{Dayjs(new Date(_time).getTime()).format('YYYY-MM-DD HH:mm')}</span>
}