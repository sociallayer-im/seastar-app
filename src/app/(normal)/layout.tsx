import type {Metadata} from "next"
import "@/styles/globals.css"
import {ReactNode} from "react"
import {Toaster} from '@/components/shadcn/Toast/toaster'
import Modals from '@/components/client/Modal/Modals'
import {getCurrProfile, selectLang} from '@/app/actions'
import Header from "@/components/Header"
import StartupChecks from "@/components/client/StartupChecks"
import {icon, poppins, media_icons, editor_icons} from "@/app/fonts"
import { headers } from "next/headers"
import {CANONICAL_ORIGIN} from '@/app/config'

export const metadata: Metadata = {
    // Open Graph images are given as site-relative paths (getAvatar falls back
    // to /images/default_avatar/*.png), and Next resolves those against
    // metadataBase. Unset, its fallback is http://localhost:3000 — so every
    // group or profile without an uploaded avatar shipped an unfetchable
    // og:image on both deployments. Only groups that happened to have an
    // avatar hid it.
    metadataBase: new URL(CANONICAL_ORIGIN),
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
    const headersList = await headers()
    const currentPath = headersList.get('x-current-path')
    const isSchedule = currentPath?.includes('/schedule')

    return (
        <html lang={langType}
              className={`${poppins.className} ${icon.variable} ${media_icons.variable} ${editor_icons.variable}`}>
        <head>
            {/* data-domain is Plausible's SITE IDENTIFIER, not a URL — it has to
                match a site that exists in the Plausible instance or events are
                silently dropped. It deliberately still says app.sola.day after
                the move to sola.day: renaming it splits the history in two, and
                the rename has to happen in Plausible first either way. Override
                with NEXT_PUBLIC_PLAUSIBLE_DOMAIN once that site is renamed. */}
            <script src="https://analytics.wamo.club/js/script.js" async
                    data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || 'app.sola.day'}
                    type="text/javascript" />
        </head>
        <body className={`antialiased`}>
        <div className="min-h-svh">
            <Header sticky={!isSchedule} />
            <div className="relative">
                {children}
            </div>
        </div>
        {!!currProfile && <StartupChecks lang={lang} profile={currProfile}/>}
        <div className="relative z-9998"><Modals/></div>
        <div className="relative z-9999"><Toaster/></div>
        </body>
        </html>
    )
}
