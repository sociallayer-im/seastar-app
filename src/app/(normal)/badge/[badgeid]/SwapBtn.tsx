'use client'

import {Badge} from '@sola/sdk'
import useSwapBadge from '@/hooks/useSwapBadge'
import {Button} from '@/components/shadcn/Button'

export default function SwapBtn({badge}: { badge: Badge }) {
    const {swapBadge} = useSwapBadge()

    return <Button variant="secondary" className='w-full text-lg' onClick={() => swapBadge(badge)}>
        <svg xmlns="http://www.w3.org/2000/svg"
             className="!w-6 !h-6"
             width="100" height="100"
             viewBox="0 0 25 24"
             fill="none">
            <path
                d="M15 2.96875H18C19.1046 2.96875 20 3.86418 20 4.96875V7.96875M20 7.96875L18 6.4375M20 7.96875L22 6.4375"
                stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            <path
                d="M10 20.9688H7C5.89543 20.9688 5 20.0733 5 18.9688V15.9688M5 15.9688L7 17.4375M5 15.9688L3 17.4375"
                stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            <rect x="4" y="1.96875" width="6" height="9" rx="2" stroke="#333333" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"></rect>
            <rect x="14" y="12.9688" width="6" height="9" rx="2" stroke="#333333" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"></rect>
        </svg>
        Swap
    </Button>

}