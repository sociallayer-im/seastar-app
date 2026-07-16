'use client'

import {useEffect, useState} from "react"
import {getProfileDetailByName, getSdkConfig} from "@sola/sdk"

export default function TextClient() {
    const [data, setData] = useState<any>(null)



    return <div>
        <div>2</div>
        {data ? JSON.stringify(data) : ''}
    </div>
}