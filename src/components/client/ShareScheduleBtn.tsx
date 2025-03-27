'use client'

import { Button } from "@/components/shadcn/Button"
import { Dictionary } from "@/lang"
import useModal from "./Modal/useModal"
import { useToast } from "../shadcn/Toast/use-toast"

export default function ShareScheduleBtn({ lang, className, compact }: { lang: Dictionary, className?: string, compact?: boolean }) {
    const { openModal } = useModal()

    const handleShowShareModal = () => {
        openModal({
            content: (close) => <ShareScheduleModal lang={lang} close={close!} />
        })
    }

    return compact
        ? <Button variant={'ghost'} size={'sm'} onClick={handleShowShareModal} className={`${className} !bg-white`}>
            <i className="uil-external-link-alt" />
        </Button>
        : <Button variant={'ghost'} size={'sm'} onClick={handleShowShareModal} className={className}>
            <i className="uil-external-link-alt mr-1" />
            {lang['Share']}
        </Button>
}

function ShareScheduleModal({ lang, close }: { lang: Dictionary, close: () => void }) {
    const { toast } = useToast()

    const currentUrl = typeof window !== 'undefined' ? window.location.href: '';
    const iframeCode = `<iframe src="${currentUrl}" width="100%" height="600px" frameborder="0" allowfullscreen></iframe>`;


    const handleCopyLink = () => {
        navigator.clipboard.writeText(currentUrl);
        toast({
            description: "Copied",
            variant: "success"
        });
    };

    const handleCopyIframe = () => {
        navigator.clipboard.writeText(iframeCode);
        toast({
            description: lang['Copied'],
            variant: "success"
        });
    };

    return (
        <div className="max-w-[600px] rounded-lg bg-background shadow p-6" style={{ width: '90vw' }}>
            <div className="font-semibold text-xl mb-6">Share Schedule</div>

            <div className="space-y-6">
                <div>
                    <div className="text-sm font-medium mb-2">Schedule Link</div>
                    <div className="flex  gap-2">
                        <div className="flex-1 p-2 bg-secondary rounded-lg break-all text-sm flex items-center">
                            {currentUrl}
                        </div>
                        <Button variant="secondary" onClick={handleCopyLink}>
                            <i className="uil-copy" />
                        </Button>
                    </div>
                </div>

                <div>
                    <div className="text-sm font-medium mb-2">Embed Code</div>
                    <div className="flex gap-2">
                        <div className="flex-1 p-2 bg-secondary rounded-lg break-all text-sm">
                            {iframeCode}
                        </div>
                        <Button variant="secondary" onClick={handleCopyIframe}>
                            <i className="uil-copy" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <Button variant="secondary" onClick={close}>
                    {lang['Confirm']}
                </Button>
            </div>
        </div>
    );
}