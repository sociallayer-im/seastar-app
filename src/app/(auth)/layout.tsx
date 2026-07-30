import type {Metadata} from "next"
import "@/styles/globals.css"
import {ReactNode} from "react"
import Image from 'next/image'
import {Toaster} from '@/components/shadcn/Toast/toaster'
import Modals from '@/components/client/Modal/Modals'
import LangSwitcher from '@/components/client/LangSwitcher'
import {selectLang} from '@/app/actions'
import {icon, poppins} from "@/app/fonts"

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

/**
 * The auth screens get their own shell rather than the app's (normal) layout,
 * which renders the full Header — including a "Sign In" button, which is absurd
 * on the sign-in page, and a profile menu that reads getCurrProfile (null until
 * a username exists, so it would flicker signed-out mid-flow). This mirrors what
 * the standalone auth app showed: logo, language switcher, nothing else.
 */
export default async function AuthLayout({children}: Readonly<{children: ReactNode}>) {
    const {type: langType} = await selectLang()

    return (
        <html lang={langType} className={`${poppins.className} ${icon.variable}`}>
            <body className="antialiased">
                <div className="min-h-[100svh]">
                    <header className="w-full h-[48px] shadow sticky top-0 bg-[var(--background)] z-[999]">
                        <div className="page-width w-full flex-row-item-center justify-between items-center h-[48px]">
                            <a href="/">
                                <Image src="/images/logo_horizontal.svg" width={102} height={32} alt="Social Layer"/>
                            </a>
                            <div className="flex-row-item-center text-xs cursor-pointer">
                                <LangSwitcher value={langType} refresh={true}/>
                            </div>
                        </div>
                    </header>
                    <div className="relative">{children}</div>
                </div>
                <div className="relative z-[9998]"><Modals/></div>
                <div className="relative z-[9999]"><Toaster/></div>
            </body>
        </html>
    )
}
