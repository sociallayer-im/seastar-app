'use client'

import {useEffect, useState} from "react"
import {getProfileDetailByHandle, setSdkConfig, getSdkConfig} from "@sola/sdk"

export default function TextClient() {
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        ;(async () => {
            console.log(setSdkConfig({clientMode: 'dev'}))
            const profile = await getProfileDetailByHandle('zfd')
            setData(profile)
        })()
    }, [])

    return <div>
        <div>1</div>
        {data ? JSON.stringify(data) : ''}</div>
}