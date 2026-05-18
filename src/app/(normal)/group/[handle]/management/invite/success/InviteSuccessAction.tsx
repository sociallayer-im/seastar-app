'use client'

import { Button } from "@/components/shadcn/Button"
import { Dictionary } from "@/lang"
import { toast, useToast } from "@/components/shadcn/Toast/use-toast"

export default function InviteSuccessAction({ groupHandle, lang, id, code }: { groupHandle: string, lang: Dictionary, id?: number, code?: string }) {
    const { toast } = useToast()

    const handleCopyLink = () => {
        const base = `${window.location.origin}/invite/${id}`
        const url = code ? `${base}?code=${code}` : base
        navigator.clipboard.writeText(url.toString())
        toast({
            title: 'Link Copied'
        })
    }

    const toGroup = () => {
        window.location.href = `/group/${groupHandle}`
    }

    return <div className="flex flex-col w-[330px] mx-auto">
        {
            !!id &&
            <Button variant="secondary"
                className="mt-4"
                onClick={handleCopyLink}>
                <i className="uil-copy-alt"></i>
                {lang['Copy Link']}
            </Button>
        }
        <Button variant={'primary'}
            className="mt-4"
            onClick={toGroup}>
            {lang['Back to Group']}
        </Button>
    </div>
}