'use client'

import {Button} from "@/components/shadcn/Button"
import {Dictionary} from "@/lang"
import {toast, useToast} from "@/components/shadcn/Toast/use-toast"

export default function InviteSuccessAction({groupHandle, lang}: {groupHandle: string, lang: Dictionary}) {
    const {toast} = useToast()

    const handleCopyLink = () => {
        const url = new URL(window.location.origin)
        navigator.clipboard.writeText(url.toString())
        toast({
            title: 'Link Copied'
        })
    }
    
    const toProfile = () => {
        window.location.href = `/group/${groupHandle}`
    }
    
    return <div className="flex flex-col w-[330px] mx-auto">
        <Button  variant="secondary"
            className="mt-4"
            onClick={handleCopyLink}>
            <i className="uil-copy-alt"></i>
            {lang['Copy Link']}
        </Button>
        <Button  variant={'primary'}
            className="mt-4"
            onClick={toProfile}>
            {lang['Back to Group']}
        </Button>
    </div>
}