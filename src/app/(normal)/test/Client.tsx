'use client'

import {useEffect, useState} from "react"
import {getProfileDetailByHandle} from "@sola/sdk"

export default function TextClient() {
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        ;(async () => {
            const profile = await getProfileDetailByHandle('zfd')
            setData(profile)
        })()
    }, [])

    return <div>{data ? JSON.stringify(data) : ''}</div>
}