'use client'
// FormatTime renders in the viewer's timezone, so it must not be server
// rendered. Next 15 only allows `ssr: false` inside a client component, so the
// dynamic() call lives here instead of in the (server) page.
import dynamic from 'next/dynamic'

export default dynamic(() => import('./FormatTime'), {ssr: false})
