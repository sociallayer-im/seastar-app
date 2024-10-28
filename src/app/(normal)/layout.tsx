import type {Metadata} from "next"
import "@/styles/globals.css"
import Head from 'next/head'
import {ReactNode} from "react"
import {Toaster} from '@/components/client/shadcn/Toast/toaster'
import Modals from '@/components/client/Modal/Modals'
import {selectLang} from '@/app/actions'
import Header from "@/components/Header"

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
    const langType = (await selectLang()).type

    return (<html lang={langType}>
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
        </body>
    </html>
    )
}
