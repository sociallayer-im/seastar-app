'use client'

import {Dictionary} from "@/lang"
import {Button} from "@/components/shadcn/Button"
import {Checkbox} from "@/components/shadcn/Checkbox"
import {useEffect, useState} from "react"
import ProfileInput from "@/components/client/ProfileInput"
import {Input} from "@/components/shadcn/Input"
import {Textarea} from "@/components/shadcn/Textarea"


export interface SendBadgeFormProps {
    badgeClass: Solar.BadgeClass
    lang: Dictionary
}

export default function SendBadgeForm({badgeClass, lang}: SendBadgeFormProps) {
    const [isVoucher, setIsVoucher] = useState(true)
    const [receivers, setReceivers] = useState<Solar.ProfileSample[]>([])
    const [counter, setCounter] = useState('')
    const [reason, setReason] = useState('')

    useEffect(() => {
        console.log('receivers', receivers)
    }, [receivers])

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width min-h-[calc(100svh-48px)] px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Send Badge']}</div>

            <div className="flex flex-col max-w-[500px] mx-auto">
                <div className="mb-8 rounded-lg h-[200px] bg-secondary flex flex-col justify-center items-center">
                    <img src={badgeClass.image_url!}
                        className="w-24 h-24 rounded-full mb-2 border-2 border-white shadow" alt=""/>
                    <div className="font-semibold">{badgeClass.title}</div>
                </div>
            </div>

            <div className="flex flex-col max-w-[500px] mx-auto mb-8">
                <div className="font-semibold mb-1">{lang['Reason (Optional)']}</div>
                <Textarea value={reason}
                    placeholder={lang['Reason (Optional)']}
                    onChange={e => setReason(e.target.value)}/>
            </div>


            <div className="flex flex-col max-w-[500px] mx-auto rounded-lg">
                <div className={`${isVoucher ? 'border' : ''} p-3 rounded-lg`}>
                    <div className="flex-row-item-center justify-between">
                        <div className="font-semibold">Badge amount</div>
                        <Checkbox checked={isVoucher}
                            className="mr-1"
                            onClick={() => setIsVoucher(!isVoucher)}/>
                    </div>
                    <div className="max-h-0 overflow-auto mt-3"
                        style={isVoucher ? {maxHeight: 'initial'} : undefined}>
                        <Input
                            placeholder={'Unlimited'}
                            type="number"
                            onWheel={(e) => e.currentTarget.blur()}
                            className="w-full"
                            value={counter}
                            onChange={e => setCounter(e.target.value)}
                        />
                        <div
                            className="my-2 text-sm text-gray-500">{lang['Leave empty to set the quantity as unlimited']}</div>
                    </div>
                </div>


                <div className={`${!isVoucher ? 'border' : ''} p-3 rounded-lg`}>
                    <div className="flex-row-item-center justify-between">
                        <div className="font-semibold">Select receivers</div>
                        <Checkbox checked={!isVoucher}
                            className="mr-1"
                            onClick={() => setIsVoucher(!isVoucher)}/>
                    </div>
                    <div className="max-h-0 overflow-auto mt-3"
                        style={!isVoucher ? {maxHeight: 'initial'} : undefined}>
                        <ProfileInput
                            lang={lang}
                            value={receivers}
                            onChange={setReceivers}
                        />
                    </div>
                </div>


            </div>

            <div className="grid grid-cols-1 gap-2 mt-4 max-w-[500px] mx-auto rounded-lg">
                <Button variant="special">Send</Button>
                <Button variant="secondary">later</Button>
            </div>
        </div>
    </div>
}