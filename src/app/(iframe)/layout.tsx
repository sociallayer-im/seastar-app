import type {Metadata} from "next"
import Script from 'next/script'
import "@/styles/globals.css"
import Head from 'next/head'
import {ReactNode} from "react"
import {Toaster} from '@/components/client/shadcn/Toast/toaster'
import Modals from '@/components/client/Modal/Modals'
import {selectLang} from '@/app/actions'
import {poppins} from "@/app/fonts"

export const metadata: Metadata = {
    title: "Social Layer",
    description: "Social Layer",
}

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
}

export default async function IframeLayout({
    children,
}: Readonly<{ children: ReactNode }>) {
    const langType = (await selectLang()).type

    return (
        <html lang={langType} className={poppins.className}>
            <Head key={'head'}>
                <link rel="icon" type="image/svg+xml" href="/images/favicon.svg"/>
            </Head>
            <Script data-domain="portal.sola.day" src="https://analytics.wamo.club/js/script.js" />
            <body className={`antialiased`}>
                <div className="min-h-[100svh]">
                    {children}
                </div>
                <div className="relative z-[9998]"><Modals/></div>
                <div className="relative z-[9999]"><Toaster/></div>
            </body>
        </html>
    )
}
