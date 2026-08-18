'use client'
// Next 16 only allows `ssr: false` inside a client component, so the dynamic()
// call lives here instead of in the (server) page.
import dynamic from 'next/dynamic'

export default dynamic(() => import('@/app/(normal)/event/[grouphandle]/create/CreateEventForm'), {ssr: false})
