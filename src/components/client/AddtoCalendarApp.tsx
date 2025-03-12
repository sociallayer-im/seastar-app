'use client'

import {getEventIcsUrl} from '@sola/sdk'
import useModal from '@/components/client/Modal/useModal'
import {Button, buttonVariants} from '@/components/shadcn/Button'
import {Dictionary} from '@/lang'
import CopyText from '@/components/client/CopyText'
import {CLIENT_MODE} from '@/app/config'

export default function AddToCalendarAppBtn({groupHandle, lang, className}: { groupHandle: string, lang: Dictionary, className?: string }) {
    const {openModal} = useModal()

    const urls = getEventIcsUrl({
        params: {groupHandle: groupHandle},
        clientMode: CLIENT_MODE
    })

    const showAddToCalendarDialog = () => {
        openModal({
            content: (close) => <DialogAddToCalendar
                lang={lang}
                urls={urls}/>
        })
    }

    return <Button variant="outline" className={`ml-3 ${className}`} onClick={showAddToCalendarDialog}>
        <i className="uil-rss text-lg mt-[-2px] translate-x-0.5"/>
    </Button>
}

function DialogAddToCalendar({urls, lang}: {
    urls: ReturnType<typeof getEventIcsUrl>,
    lang: Dictionary
}) {
    const isMac = navigator.platform.indexOf('Mac') > -1 || /iPad|iPhone|iPod/.test(navigator.userAgent)

    return <div className="p-3 shadow rounded-lg w-[300px] bg-background">
        <div className="font-semibold mb-3">{lang['Add iCal Subscription']}</div>
        <div className="text-sm mb-3">{lang['Add events to your calendar to stay updated.']}</div>

        <div className="grid grid-cols-1 gap-2">
            <a className={`${buttonVariants({variant: "secondary"})}`}
               href={urls.googleCalendarLink} target="_blank">
                <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
                    <path
                        d="M6.3243 11.5646L5.80218 13.5138L3.89381 13.5542C3.32349 12.4964 3 11.2861 3 9.99995C3 8.75627 3.30246 7.58346 3.83859 6.55078H3.839L5.53798 6.86226L6.28223 8.55105C6.12646 9.00517 6.04156 9.49267 6.04156 9.99995C6.04162 10.5505 6.14134 11.078 6.3243 11.5646Z"
                        fill="#FBBB00"/>
                    <path
                        d="M17.8693 8.59863C17.9555 9.05232 18.0004 9.52087 18.0004 9.99972C18.0004 10.5367 17.9439 11.0604 17.8364 11.5657C17.4713 13.2849 16.5173 14.7861 15.1957 15.8485L15.1953 15.8481L13.0554 15.7389L12.7525 13.8482C13.6294 13.3339 14.3147 12.5291 14.6757 11.5657H10.6653V8.59863H14.7342H17.8693Z"
                        fill="#518EF8"/>
                    <path
                        d="M15.1946 15.8486L15.195 15.849C13.9097 16.8821 12.277 17.5002 10.4997 17.5002C7.64354 17.5002 5.16032 15.9038 3.89355 13.5545L6.32404 11.5649C6.95741 13.2553 8.58804 14.4586 10.4997 14.4586C11.3214 14.4586 12.0912 14.2365 12.7517 13.8487L15.1946 15.8486Z"
                        fill="#28B446"/>
                    <path
                        d="M15.2867 4.22663L12.8571 6.21576C12.1734 5.78844 11.3653 5.54159 10.4995 5.54159C8.54457 5.54159 6.88344 6.80009 6.28181 8.55107L3.83854 6.5508H3.83813C5.08635 4.14422 7.60089 2.5 10.4995 2.5C12.3193 2.5 13.9878 3.14822 15.2867 4.22663Z"
                        fill="#F14336"/>
                </svg>
                <span>Google Calendar</span>
            </a>

            <a className={`${buttonVariants({variant: "secondary"})}`}
               href={urls.outlookCalendarLink} target="_blank">
                <img
                    src="https://res.public.onecdn.static.microsoft/owamail/hashed-v1/resources/images/Mail_22px-hash-ef494f7f.m.svg"
                    alt=""/>
                <span>Outlook Calendar</span>
            </a>

            {isMac &&
                <a className={`${buttonVariants({variant: "secondary"})}`}
                   href={urls.systemCalendarLink} target="_blank">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path
                            d="M14.3687 9.63553C14.3898 11.9055 16.3601 12.6609 16.3819 12.6705C16.3653 12.7238 16.0671 13.747 15.3439 14.8039C14.7187 15.7177 14.0698 16.6281 13.0477 16.647C12.0433 16.6655 11.7203 16.0514 10.5721 16.0514C9.42412 16.0514 9.06529 16.6281 8.11454 16.6655C7.1279 16.7029 6.37655 15.6774 5.74619 14.767C4.45806 12.9047 3.47367 9.50459 4.79546 7.20946C5.4521 6.06969 6.62556 5.34794 7.89925 5.32944C8.86811 5.31095 9.78257 5.98125 10.3749 5.98125C10.9668 5.98125 12.0781 5.17516 13.2463 5.29355C13.7354 5.3139 15.1083 5.4911 15.9898 6.78145C15.9188 6.82549 14.3517 7.73775 14.3687 9.63553V9.63553ZM12.4811 4.06148C13.005 3.42742 13.3575 2.54475 13.2613 1.6665C12.5063 1.69685 11.5933 2.16964 11.0517 2.80335C10.5664 3.36453 10.1413 4.26273 10.256 5.1236C11.0976 5.18871 11.9573 4.69594 12.4811 4.06148Z"
                            fill="black"/>
                    </svg>
                    <span>Apple Calendar</span>
                </a>
            }

            <a className={`${buttonVariants({variant: "secondary"})}`}
               href={urls.systemCalendarLink} target="_blank">
                <span>{lang['System Calendar']}</span>
            </a>

            <CopyText className={`${buttonVariants({variant: "ghost"})} cursor-pointer`} value={urls.url}>
                <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
                    <path
                        d="M8.83328 14.6252L7.35828 16.0586C6.9715 16.4453 6.44693 16.6626 5.89994 16.6626C5.35296 16.6626 4.82839 16.4453 4.44161 16.0586C4.05484 15.6718 3.83755 15.1472 3.83755 14.6002C3.83755 14.0533 4.05484 13.5287 4.44161 13.1419L8.22494 9.35024C8.59629 8.97769 9.09663 8.76214 9.62246 8.74818C10.1483 8.73422 10.6594 8.92292 11.0499 9.27524L11.1499 9.35857C11.308 9.51328 11.521 9.59888 11.7421 9.59654C11.9633 9.59419 12.1744 9.5041 12.3291 9.34607C12.4838 9.18805 12.5694 8.97504 12.5671 8.7539C12.5647 8.53277 12.4746 8.32162 12.3166 8.16691C12.2696 8.1061 12.2195 8.04769 12.1666 7.99191C11.4552 7.373 10.5352 7.04761 9.59292 7.08165C8.65061 7.1157 7.75647 7.50662 7.09161 8.17524L3.25828 11.9669C2.60691 12.6759 2.25463 13.6091 2.27501 14.5717C2.29539 15.5343 2.68685 16.4518 3.36764 17.1325C4.04843 17.8133 4.96591 18.2048 5.92848 18.2252C6.89105 18.2456 7.82428 17.8933 8.53328 17.2419L9.97494 15.8336C10.1173 15.6783 10.1955 15.4748 10.194 15.2642C10.1924 15.0535 10.111 14.8513 9.96637 14.6982C9.82169 14.545 9.62439 14.4524 9.41417 14.4389C9.20394 14.4253 8.99639 14.4919 8.83328 14.6252V14.6252ZM17.7416 2.75857C17.0406 2.06191 16.0924 1.6709 15.1041 1.6709C14.1158 1.6709 13.1676 2.06191 12.4666 2.75857L11.0249 4.16691C10.8826 4.3222 10.8043 4.52564 10.8059 4.7363C10.8075 4.94695 10.8888 5.14919 11.0335 5.30231C11.1782 5.45544 11.3755 5.54809 11.5857 5.56162C11.7959 5.57515 12.0035 5.50856 12.1666 5.37524L13.6083 3.94191C13.9951 3.55513 14.5196 3.33785 15.0666 3.33785C15.6136 3.33785 16.1382 3.55513 16.5249 3.94191C16.9117 4.32868 17.129 4.85326 17.129 5.40024C17.129 5.94722 16.9117 6.4718 16.5249 6.85857L12.7416 10.6502C12.3703 11.0228 11.8699 11.2383 11.3441 11.2523C10.8183 11.2663 10.3072 11.0776 9.91661 10.7252L9.81661 10.6419C9.65859 10.4872 9.44558 10.4016 9.22444 10.4039C9.0033 10.4063 8.79215 10.4964 8.63744 10.6544C8.48274 10.8124 8.39714 11.0254 8.39948 11.2466C8.40182 11.4677 8.49192 11.6789 8.64994 11.8336C8.71048 11.8955 8.77447 11.9539 8.84161 12.0086C9.55384 12.6256 10.4735 12.9498 11.4152 12.9158C12.3569 12.8817 13.2508 12.4921 13.9166 11.8252L17.7083 8.03357C18.4094 7.33697 18.8064 6.39127 18.8127 5.40295C18.8189 4.41463 18.4339 3.46398 17.7416 2.75857V2.75857Z"
                        fill="black"/>
                </svg>
                <span>{lang['Copy Link']}</span>
            </CopyText>
        </div>
    </div>
}