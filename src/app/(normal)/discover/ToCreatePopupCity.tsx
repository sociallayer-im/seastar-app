'use client'

import {Button} from '@/components/shadcn/Button'
import {Dictionary} from '@/lang'
import {clientToSignIn, getAuth} from '@/utils'

export default function ToCreatePopupCity({lang}: { lang: Dictionary }) {

    const handleToCreatePopupCity = () => {
        const auth = getAuth()
        if (!auth) {
            clientToSignIn()
            return
        }

        window.location.href = '/popup-city/create'
    }

    return <div style={{background: 'url(/images/popup_city_bg.jpg)', backgroundSize: '100% 100%'}}
                className="bg-cover h-auto  py-6 px-4 sm:py-0 sm:h-[230px] w-full rounded-lg mb-6 flex flex-col justify-center items-center">
        <div className="font-semibold sm:text-2xl text-base mb-4 text-center">{lang['Want to create your own Pop-up City?']}</div>
        <div className="sm:max-w-[400px] max-w-[300px] text-center mb-4 sm:text-base text-xs">{lang['Start now and let more people freely organize and participate in your exciting events!']}
        </div>
        <Button onClick={handleToCreatePopupCity}
                variant='ghost'
                className="bg-[#EFFFF9] text-sm sm:text-base">
            {lang['Create Now']}
        </Button>
    </div>
}