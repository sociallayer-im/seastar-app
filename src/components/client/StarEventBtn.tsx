'use client'

import {useState, MouseEvent} from 'react'
import {getAuth} from '@/utils'
import {starEvent, unstarEvent} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {Dictionary} from '@/lang'

export default function StarEventCardStarBtn({eventId, starred, label, compact = true}: {
    eventId: number,
    starred: boolean,
    label?: string
    compact?: boolean
}) {
    const [isStared, setIsStared] = useState(starred)
    const {toast} = useToast()
    const authToken = getAuth()

    const handleStar = async (e: MouseEvent) => {
        e.preventDefault()
        try {
            isStared
                ? await unstarEvent({params: {eventId: eventId, authToken: authToken!}, clientMode: CLIENT_MODE})
                : await starEvent({params: {eventId: eventId, authToken: authToken!}, clientMode: CLIENT_MODE})

            setIsStared(!isStared)
        } catch (e: unknown) {
            console.error(e)
            toast({
                title: 'Failed to star event',
                variant: 'destructive'
            })
        }
    }

    return authToken ?
        compact ? <i onClick={(e) => {
                         handleStar(e)
                     }}
                     className={`uil-star text-2xl cursor-pointer absolute right-4 top-3 text-shadow ${!isStared ? 'text-white' : 'text-yellow-200'} z-10 `}/>
            : <div onClick={(e) => {
                handleStar(e)
            }}
                   className="cursor-pointer hover:bg-gray-300 flex-row-item-center ml-2 h-8 font-semibold text-base bg-gray-200 rounded-lg px-2">
                <i className={`uil-star  ${!isStared ? 'text-foreground' : 'text-orange-400'}`}/>
                <span className="sm:inline hidden ml-1 ">{label}</span>
            </div>
        : null
}