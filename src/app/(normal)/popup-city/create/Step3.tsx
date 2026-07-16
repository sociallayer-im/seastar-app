'use client'

import {buttonVariants} from '@/components/shadcn/Button'
import {GroupDetail, PopupCity} from '@sola/sdk'
import {Dictionary} from '@/lang'


export default function Step3({lang, groupName, popupCityName}: {
    lang: Dictionary
    groupName: string,
    popupCityName: string
}) {

    return <div className="w-full max-w-[500px] mx-auto p-4">
        <div className="font-semibold text-2xl">{'Created successfully  🎉'}</div>
        <div className="mt-1 text-secondary-foreground">{lang['You have create a Popup-City']}
            <span className="whitespace-nowrap mx-1 font-semibold ">{popupCityName}</span>!
        </div>
        <div className="text-secondary-foreground">Next, you can :</div>
        <div className="my-6 grid grid-cols-1 gap-3">
            <a href={`/event/${groupName}/create`}
               className={`${buttonVariants({variant: 'primary'})} w-full`}>
                {lang['Create an Event']}
            </a>

            <a href={`/event/${groupName}`}
               className={`${buttonVariants({variant: 'secondary'})} w-full`}>
                {lang['View Event Home Page']}
            </a>

            <a  href={`/event/${groupName}/permission`}
                className={`${buttonVariants({variant: 'secondary'})} w-full`}>
                {lang['Set Event Permission']}
            </a>

            <a href={`/group/${groupName}/management/invite`}
                className={`${buttonVariants({variant: 'secondary'})} w-full`}>
                {lang['Invite Managers']}
            </a>
        </div>
    </div>
}