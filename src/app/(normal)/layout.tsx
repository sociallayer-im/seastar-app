import type {Metadata} from "next"
import "@/styles/globals.css"
import Head from 'next/head'
import {ReactNode} from "react"
import {Toaster} from '@/components/shadcn/Toast/toaster'
import Modals from '@/components/client/Modal/Modals'
import {getCurrProfile, selectLang} from '@/app/actions'
import Header from "@/components/Header"
import {icon, poppins, media_icons, editor_icons} from "@/app/fonts"
import Subscription from '@/components/client/Subscription'
// import { TrackJSInstall } from "@/app/trackjs_loader"
import { headers } from "next/headers"

// TrackJSInstall()

export const metadata: Metadata = {
    title: process.env.NEXT_PUBLIC_APP_TITLE || "Social Layer",
    description: process.env.NEXT_PUBLIC_APP_TITLE || "Social Layer",
}

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
}

export default async function RootLayout({
                                             children,
                                         }: Readonly<{ children: ReactNode }>) {
    const {type: langType, lang} = await selectLang()
    const currProfile = await getCurrProfile()
    const headersList = headers()
    const currentPath = headersList.get('x-current-path')
    const isSchedule = currentPath?.includes('/schedule')

    return (
        <html lang={langType}
              className={`${poppins.className} ${icon.variable} ${media_icons.variable} ${editor_icons.variable}`}>
        <head>
            <script src="https://analytics.wamo.club/js/script.js" async data-domain="app.sola.day" type="text/javascript" />
        </head>
        <Head>
            <link rel="icon" type="image/svg+xml" href="/images/favicon.svg"/>
        </Head>
        <body className={`antialiased`}>
        <div className="min-h-[100svh]">
            <Header sticky={!isSchedule} />
            <div className="relative">
                {children}
            </div>
        </div>
        <div className="relative z-[9998]"><Modals/></div>
        <div className="relative z-[9999]"><Toaster/></div>
        {!!currProfile && <Subscription lang={lang} profile={currProfile}/>}
        </body>
        </html>
    )
}
