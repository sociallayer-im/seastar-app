'use client'

import {useState, MouseEvent} from 'react'
import {getAuth} from '@/utils'
import {starEvent, unstarEvent} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {useToast} from '@/components/shadcn/Toast/use-toast'

export default function StarEventCardStarBtn({eventId, starred, label, className, compact = true}: {
    eventId: number,
    starred: boolean,
    label?: string
    compact?: boolean,
    className?: string
}) {
    const [isStared, setIsStared] = useState(starred)
    const {toast} = useToast()
    const authToken = getAuth()

    const handleStar = async (e: MouseEvent) => {
        e.preventDefault()
        try {
            isStared
                ? await unstarEvent({params: {eventId: eventId, authToken: authToken!}, clientMode: CLIENT_MODE})
                : await starEvent({params: {eventId: eventId, authToken: authToken!}, clientMode: CLIENT_MODE})

            setIsStared(!isStared)
        } catch (e: unknown) {
            console.error(e)
            toast({
                title: 'Failed to star event',
                variant: 'destructive'
            })
        }
    }

    return authToken ?
        compact ? <CompactStarBtn starred={isStared} onClick={handleStar} className={className}/>
            : <StarBtn starred={isStared} label={label || ''} onClick={handleStar}/>
        : null
}

function CompactStarBtn({starred, onClick, className}: { starred: boolean, onClick: (e: MouseEvent) => void, className?: string }) {
    return <div className={`absolute right-4 top-4 cursor-pointer z-10 ${className}`} onClick={onClick}>
        {
            starred ? <img className="w-6 h-6 cursor-pointer" src="/images/favorite_active.png" alt=""/>
                : <img className="w-6 h-6 cursor-pointer" src="/images/favorite.png" alt=""/>
        }
    </div>
}

function StarBtn({starred, onClick, label}: { starred: boolean, label: string, onClick: (e: MouseEvent) => void }) {
    return <div onClick={onClick}
                className="cursor-pointer hover:bg-gray-300 flex-row-item-center ml-2 h-8 font-semibold text-base bg-gray-200 rounded-lg px-2">
        {!starred ?
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 16 16"
                 fill="none">
                <path
                    d="M14.6665 6.44579C14.6244 6.32385 14.5478 6.21674 14.446 6.13745C14.3443 6.05817 14.2217 6.01012 14.0932 5.99912L10.2998 5.44579L8.59982 1.99912C8.54523 1.88641 8.46 1.79135 8.35388 1.72484C8.24777 1.65832 8.12506 1.62305 7.99982 1.62305C7.87458 1.62305 7.75188 1.65832 7.64576 1.72484C7.53965 1.79135 7.45441 1.88641 7.39982 1.99912L5.69982 5.43912L1.90649 5.99912C1.7831 6.01666 1.6671 6.06843 1.57166 6.14856C1.47621 6.22869 1.40513 6.33397 1.36649 6.45245C1.33112 6.56824 1.32794 6.69147 1.35731 6.80892C1.38667 6.92637 1.44746 7.0336 1.53316 7.11912L4.28649 9.78579L3.61982 13.5725C3.59291 13.6981 3.60286 13.8288 3.64848 13.9489C3.6941 14.069 3.77345 14.1733 3.87698 14.2494C3.9805 14.3254 4.1038 14.37 4.23204 14.3776C4.36028 14.3853 4.48799 14.3557 4.59982 14.2925L7.99982 12.5125L11.3998 14.2925C11.4934 14.3452 11.5991 14.3728 11.7065 14.3725C11.8477 14.373 11.9854 14.3286 12.0998 14.2458C12.2033 14.1717 12.2833 14.0696 12.3306 13.9514C12.3778 13.8333 12.3903 13.7041 12.3665 13.5791L11.6998 9.79245L14.4532 7.12579C14.5494 7.04424 14.6206 6.93706 14.6583 6.81669C14.6961 6.69632 14.6989 6.5677 14.6665 6.44579ZM10.5665 9.11245C10.4893 9.18739 10.4314 9.27989 10.3978 9.38204C10.3641 9.4842 10.3557 9.59299 10.3732 9.69912L10.8532 12.4991L8.34649 11.1658C8.24907 11.1176 8.14184 11.0925 8.03316 11.0925C7.92447 11.0925 7.81724 11.1176 7.71982 11.1658L5.21316 12.4991L5.69316 9.69912C5.71065 9.59299 5.7022 9.4842 5.66854 9.38204C5.63487 9.27989 5.57698 9.18739 5.49982 9.11245L3.49982 7.11245L6.30649 6.70579C6.41449 6.69076 6.51715 6.64948 6.60549 6.58556C6.69382 6.52163 6.76513 6.43701 6.81316 6.33912L7.99982 3.79912L9.25316 6.34579C9.30118 6.44368 9.37249 6.5283 9.46082 6.59222C9.54916 6.65615 9.65182 6.69743 9.75982 6.71245L12.5665 7.11912L10.5665 9.11245Z"
                    fill="black"/>
            </svg>
            : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"
                   fill="none">
                <path
                    d="M13.4463 5.13745C13.5481 5.21674 13.6246 5.32385 13.6667 5.44579C13.6992 5.5677 13.6963 5.69632 13.6586 5.81669C13.6208 5.93706 13.5497 6.04424 13.4534 6.12579C13.3571 6.20733 10.7001 8.79245 10.7001 8.79245C10.7001 8.79245 11.3429 12.4541 11.3667 12.5791C11.3905 12.7041 11.3781 12.8333 11.3308 12.9514C11.2836 13.0696 11.2035 13.1717 11.1001 13.2458C10.9857 13.3286 10.848 13.373 10.7067 13.3725C10.5993 13.3728 10.4936 13.3452 10.4001 13.2925L7.00007 11.5125L3.60007 13.2925C3.48824 13.3557 3.36052 13.3853 3.23229 13.3776C3.10405 13.37 2.98075 13.3254 2.87722 13.2494C2.77369 13.1733 2.69434 13.069 2.64872 12.9489C2.6031 12.8288 2.59315 12.6981 2.62007 12.5725L3.28673 8.78579L0.5334 6.11912C0.447705 6.0336 0.386914 5.92637 0.357552 5.80892C0.328189 5.69147 0.331363 5.56824 0.366733 5.45245C0.405373 5.33397 0.476451 5.22869 0.5719 5.14856C0.667349 5.06843 0.783348 5.01666 0.906733 4.99912C0.906733 4.99912 3.48921 5.32013 4.70007 4.43912C5.91177 3.55749 6.40007 0.99912 6.40007 0.99912C6.45466 0.886406 6.53989 0.791348 6.64601 0.724836C6.75212 0.658324 6.87483 0.623047 7.00007 0.623047C7.1253 0.623047 7.24801 0.658324 7.35413 0.724836C7.46024 0.791348 7.54548 0.886406 7.60007 0.99912L9.30007 4.44579L13.0934 4.99912C13.2219 5.01012 13.3445 5.05817 13.4463 5.13745Z"
                    fill="#F1CB45"/>
            </svg>
        }
        <span className="sm:inline hidden ml-1 ">{label}</span>
    </div>
}