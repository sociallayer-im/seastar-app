'use client'

import {CreatePopupCityStepProps} from '@/app/(normal)/popup-city/create/Step0'
import {Input} from '@/components/shadcn/Input'
import {Button} from '@/components/shadcn/Button'

export default function Step1({lang, popupCityState, onNext, onBack}: CreatePopupCityStepProps) {
    return  <div className="w-full max-w-[500px] mx-auto p-4">
        <div className="font-semibold text-2xl">{lang['Choose a name for your Popup-City']}</div>
        <div className="mt-1 text-secondary-foreground">
            {lang['You can create events with your buddies.']}
        </div>
        <div className="my-4">
            <Input placeholder={lang['Input name']}
                   className="w-full"
                   value={popupCityState[0].title || ''}
                   onChange={e => popupCityState[1]({...popupCityState[0], title: e.target.value})}
            />

            <div className="flex-row-item-center mt-4">
                <Button
                    onClick={onBack}
                    variant={'secondary'}
                    className="w-full mr-3">
                    {lang['Back']}
                </Button>
                <Button
                    disabled={!popupCityState[0].title.trim()}
                    onClick={onNext}
                    variant={'primary'}
                    className="w-full">
                    {lang['Next']}
                </Button>
            </div>
        </div>
    </div>
}