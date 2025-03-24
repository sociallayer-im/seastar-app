'use client'

import {Button, buttonVariants} from '@/components/shadcn/Button'
import {Dictionary} from '@/lang'
import {isSupportedDownloadCardBrowser, saveDomImage} from '@/utils'
import {EventDetail} from '@sola/sdk'
import {useToast} from '@/components/shadcn/Toast/use-toast'

export interface ShareActionsBtnProps {
    eventDetail: EventDetail
    groupHandle: string
    lang: Dictionary
}

export default function ShareActionsBtn({eventDetail, lang, groupHandle}: ShareActionsBtnProps) {

    const {toast} = useToast()

    const handleSaveDomImage = async () => {
        const dom = document.querySelector('.share-card') as HTMLElement
        if (!dom) return
       try {
           await saveDomImage({
               dom,
               fileName: `${eventDetail.title}`,
               scaleFactor: 2
           })
       } catch (e: unknown) {
            console.error(e)
            toast({
                description: e instanceof Error  ? e.message : 'Save image failed',
                variant: 'destructive'
            })
       }
    }

    const handleCopyLink = () => {
        const url = `${window.location.origin}/event/detail/${eventDetail.id}`
        navigator.clipboard.writeText(url)
            .then(() => {
                toast({
                    description: lang['Copied'],
                    variant: 'success'
                })
            })
    }

    const showDownloadBtn = isSupportedDownloadCardBrowser()
    return <div className="grid grid-cols-1 gap-3 w-full">
        <div className="flex-row-item-center">
            <Button variant="secondary"
                    onClick={handleCopyLink}
                    className="flex-1">
                {lang['Copy Link']}
            </Button>
            {showDownloadBtn &&
                <Button variant="secondary"
                        onClick={handleSaveDomImage}
                        className="ml-3 flex-1">{lang['Save Image']}</Button>
            }
        </div>
        <div className="flex-row-item-center">
            <a className={`${buttonVariants({variant: 'secondary'})} w-full`}
               href={`/event/detail/${eventDetail.id}`}>
                {lang['Event Detail']}
            </a>
            <a className={`${buttonVariants({variant: 'secondary'})} w-full ml-3 `}
               href={`/event/${groupHandle}`}>
                {lang['Event Home']}
            </a>
        </div>
        <a className={`${buttonVariants({variant: 'secondary'})} w-full`}
           href={`/event/${groupHandle}/create`}>
            {lang['Create an Event']}
        </a>
    </div>
}