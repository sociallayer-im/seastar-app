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

import { Provider as RollbarProvider } from '@rollbar/react'
import { clientConfig } from '@/rollbar'

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

export default async function RootLayout({
    children,
}: Readonly<{ children: ReactNode }>) {
    const {type: langType, lang} = await selectLang()
    const currProfile = await getCurrProfile()

    return (
        <RollbarProvider config={clientConfig}>
            <html lang={langType} className={`${poppins.className} ${icon.variable} ${media_icons.variable} ${editor_icons.variable}`}>
            <Head>
                <link rel="icon" type="image/svg+xml" href="/images/favicon.svg"/>
            </Head>
            <body className={`antialiased`}>
            <div className="min-h-[100svh]">
                <Header/>
                <div className="relative">
                    {children}
                </div>
            </div>
            <div className="relative z-[9998]"><Modals/></div>
            <div className="relative z-[9999]"><Toaster/></div>
            {!!currProfile && <Subscription lang={lang} profile={currProfile} />}
            </body>
            </html>
        </RollbarProvider>
    )
}
