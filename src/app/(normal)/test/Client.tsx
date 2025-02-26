'use client'

import {useEffect, useState} from "react"
import {getProfileDetailByHandle} from "@sola/sdk"

export default function TextClient() {
    const [data, setData] = useState<any>(null)



    return <div>
        <div>1</div>
        {data ? JSON.stringify(data) : ''}</div>
}