'use client'
// The star state comes from the auth cookie, so the button is client-only to
// avoid a hydration mismatch. Next 15 only allows `ssr: false` inside a client
// component, so the dynamic() call lives here instead of in the (server) page.
import dynamic from 'next/dynamic'

export default dynamic(() => import('@/components/client/StarEventBtn'), {ssr: false})
