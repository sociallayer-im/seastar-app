'use client'

import {Dictionary} from "@/lang"
import {Textarea} from "@/components/shadcn/Textarea"
import {buttonVariants} from "@/components/shadcn/Button"
import {useState} from "react"

export default function SendAgainForm({lang, badgeClass}: {badgeClass: Solar.BadgeClass, lang: Dictionary}) {
    const [reason, setReason] = useState(badgeClass.content || '')

    const reasonSearchParams = reason ? `?reason=${reason}` : ''

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width min-h-[calc(100svh-48px)] px-3 pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Sand Again']}</div>

            <div className="flex flex-col max-w-[500px] mx-auto">
                <div className="mb-8 rounded-lg h-[200px] bg-secondary flex flex-col justify-center items-center">
                    <img src={badgeClass.image_url!}
                        className="w-24 h-24 rounded-full mb-2 border-2 border-white shadow" alt=""/>
                    <div className="font-semibold">{badgeClass.title}</div>
                </div>
                <div className="font-semibold mb-1">{lang['Reason (Optional)']}</div>
                <Textarea value={reason}
                    onChange={e => setReason(e.target.value)}/>
                <a className={`${buttonVariants({variant: 'special'})} w-full mt-6`}
                    href={`/badge-class/${badgeClass.id}/send-badge${reasonSearchParams}`}>
                    {lang['Next']}
                </a>
            </div>
        </div>
    </div>
}