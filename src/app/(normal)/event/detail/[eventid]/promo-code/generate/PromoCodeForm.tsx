'use client'

import {Checkbox} from "@/components/shadcn/Checkbox"
import {Input} from "@/components/shadcn/Input"
import {Button} from "@/components/shadcn/Button"
import {Dictionary} from "@/lang"

export default async function PromoCodeForm({lang}: {lang: Dictionary}) {
    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width-md min-h-[calc(100svh-48px) px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Generate Promo Code']}</div>

            <div className="mb-4">
                <div className="flex-row-item-center justify-between">
                    <div className="font-semibold">Discount off</div>
                    <Checkbox checked={true}
                        className="mr-1"/>
                </div>
                <div className="max-h-0 overflow-auto mt-3"
                    style={true ? {maxHeight: 'initial'} : undefined}>
                    <Input
                        placeholder={'Unlimited'}
                        type="number"
                        className="w-full"
                        value={1}
                        endAdornment={'% OFF'}
                    />
                </div>
            </div>

            <div className="mb-4">
                <div className="flex-row-item-center justify-between">
                    <div className="font-semibold">Amount off</div>
                    <Checkbox checked={false}
                        className="mr-1"/>
                </div>
                <div className="max-h-0 overflow-auto mt-3"
                    style={true ? {maxHeight: 'initial'} : undefined}>
                    <Input
                        placeholder={'Unlimited'}
                        type="number"
                        className="w-full"
                        value={1}
                        endAdornment={'USD'}
                    />
                </div>
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Can be used']}</div>
                <Input className="w-full"
                    type={'number'}
                    inputMode="none"
                    onWheel={(e) => e.currentTarget.blur()}
                    endAdornment={lang['Times']}/>
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Description (Optional)']}</div>
                <Input className="w-full"/>
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Valid date']}</div>
                <Input className="w-full"/>
            </div>

            <div className="mt-6 flex-row-item-center justify-center">
                <Button variant={'secondary'} className="mr-3 flex-1">{lang['Cancel']}</Button>
                <Button variant={'primary'} className="mr-3 flex-1">{lang['Generate']}</Button>
            </div>
        </div>
    </div>
}