'use client'

import {useState, MouseEvent} from 'react'
import {EventWithJoinStatus, getAuth} from '@/utils'
import {starEvent, unstarEvent} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {useToast} from '@/components/shadcn/Toast/use-toast'

export default function EventCardStarBtn({event}: { event: EventWithJoinStatus }) {
    const [isStared, setIsStared] = useState(event.isStarred)
    const {toast} = useToast()
    const authToken = getAuth()

    const handleStar = async (e: MouseEvent) => {
        e.preventDefault()
        try {
            isStared
                ? await unstarEvent({params: {eventId: event.id, authToken: authToken!}, clientMode: CLIENT_MODE})
                : await starEvent({params: {eventId: event.id, authToken: authToken!}, clientMode: CLIENT_MODE})

            setIsStared(!isStared)
        } catch (e: unknown) {
            console.error(e)
            toast({
                title: 'Failed to star event',
                variant: 'destructive'
            })
        }
    }

    return authToken ? <i title={event.isStarred ? 'Starred' : 'Star'}
                          onClick={(e) => {handleStar(e)}}
                          className={`uil-star text-2xl cursor-pointer absolute right-4 top-3 text-shadow ${!isStared ? 'text-white' : 'text-yellow-200'} z-10 `}/>
        : null
}