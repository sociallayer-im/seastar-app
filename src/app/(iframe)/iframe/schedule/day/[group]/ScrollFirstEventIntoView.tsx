'use client'

import {useEffect} from "react"

export default function ScrollFirstEventIntoView() {
    useEffect(() => {
        const firstEvent = document.querySelector('.grid-events div:first-child')
        if (firstEvent) {
            firstEvent.scrollIntoView({behavior: 'smooth', block: 'center'})
        }
    }, [])

    return <></>
}
