import {useEffect, useState} from 'react'
import dayjs from '@/libs/dayjs'

export default function DisplayDateTime(props: {dataTimeStr: string, tz?: string}) {
    const [str, setStr] = useState('')

    useEffect(() => {
        if (typeof window !== 'undefined') {
          const date = props.tz ? dayjs.tz(props.dataTimeStr, props.tz) : dayjs(props.dataTimeStr)
          setStr(date.format('YYYY-MM-DD HH:mm'))
        }
    }, []);


    return str
}