'use client'

import {Dictionary} from "@/lang"
import {Switch} from "@/components/shadcn/Switch"
import {Button} from "@/components/shadcn/Button"
import {useEffect, useState} from "react"
import ProfileInput from "@/components/client/ProfileInput"
import {Input} from "@/components/shadcn/Input"


export interface SendBadgeFormProps {
    badgeClass: Solar.BadgeClass
    lang: Dictionary
    reason?: string
}

export default function SendBadgeForm({badgeClass, lang}: SendBadgeFormProps) {
    const [isVoucher, setIsVoucher] = useState(false)
    const [receivers, setReceivers] = useState<Solar.ProfileSample[]>([])
    const [counter, setCounter] = useState('')

    useEffect(() => {
        console.log('receivers', receivers)
    }, [receivers])


    useEffect(() => {
        // prevent wheel event for input which type equals number
        const preventWheel = (e: WheelEvent) => {
            if (e.target instanceof HTMLInputElement && e.target.type === 'number') {
                e.preventDefault()
            }
        }

        window.addEventListener('wheel', preventWheel, {passive: false})

        return () => {
            window.removeEventListener('wheel', preventWheel)
        }
    }, [])

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width min-h-[calc(100svh-48px)] px-3 pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Send Badge']}</div>

            <div className="flex flex-col max-w-[500px] mx-auto">
                <div className="mb-8 rounded-lg h-[200px] bg-secondary flex flex-col justify-center items-center">
                    <img src={badgeClass.image_url!}
                        className="w-24 h-24 rounded-full mb-2 border-2 border-white shadow" alt=""/>
                    <div className="font-semibold">{badgeClass.title}</div>
                </div>
            </div>

            <div className="flex flex-col max-w-[500px] mx-auto rounded-lg">
                <div className="flex-row-item-center justify-between py-4">
                    <div className="font-semibold">Select receivers</div>
                    <Switch checked={!isVoucher} onClick={() => setIsVoucher(!isVoucher)}/>
                </div>
                {!isVoucher &&
                    <ProfileInput
                        lang={lang}
                        value={receivers}
                        onChange={setReceivers}
                    />
                }

                <div className="flex-row-item-center justify-between py-4">
                    <div className="font-semibold">Badge amount</div>
                    <Switch checked={isVoucher} onClick={() => setIsVoucher(!isVoucher)}/>
                </div>
                {isVoucher &&
                    <>
                        <Input
                            placeholder={'Unlimited'}
                            type="number"
                            value={counter}
                            onChange={e => setCounter(e.target.value)}
                        />
                        <div className="my-2 text-sm text-gray-500">{lang['Leave empty to set the quantity as unlimited']}</div>
                    </>
                }
            </div>

            <div className="grid grid-cols-1 gap-2 mt-4 max-w-[500px] mx-auto rounded-lg">
                <Button variant="special">Send</Button>
                <Button variant="secondary">later</Button>
            </div>
        </div>
    </div>
}