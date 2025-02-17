'use client'

import {Button} from "@/components/shadcn/Button"
import {Dictionary} from "@/lang"
import {toast, useToast} from "@/components/shadcn/Toast/use-toast"

export interface ShareVoucherActionProps {
    voucherId: number
    lang: Dictionary
    badgeName: string
    code?: string
    profileHandle: string
}

export default function ShareVoucherAction(props: ShareVoucherActionProps) {
    const {toast} = useToast()

    const handleCopyLink = () => {
        const url = new URL(window.location.href)
        url.pathname = `/voucher/${props.voucherId}`
        if (props.code) {
            url.searchParams.set('code', props.code)
        }

        navigator.clipboard.writeText(url.toString())
        toast({
            title: 'Link Copied'
        })
    }
    
    const toProfile = () => {
        window.location.href = `/profile/${props.profileHandle}`
    }
    
    return <div className="flex flex-col w-[330px] mx-auto">
        <Button variant={'primary'} 
            className="mt-4"
            onClick={handleCopyLink}>
            <i className="uil-copy-alt"></i> Copy Link
        </Button>
        <Button variant="secondary"
            className="mt-4"
            onClick={toProfile}>Back to Profile</Button>
    </div>
}