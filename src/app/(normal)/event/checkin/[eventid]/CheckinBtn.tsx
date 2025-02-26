'use client'

import {EventDetail} from '@sola/sdk'
import {Button} from '@/components/shadcn/Button'
import {Dictionary} from '@/lang'
import useScanQrcode from '@/hooks/useScanQrcode'
import {useToast} from '@/components/shadcn/Toast/use-toast'

export interface CheckinBtnProps {
    eventDetail: EventDetail
    lang: Dictionary
}

export default function CheckinBtn({eventDetail, lang}: CheckinBtnProps) {
    const {scanQrcode} = useScanQrcode()
    const {toast} = useToast()

    const handleCheckin = async () => {
        await scanQrcode(res => {
            const searchParams = new URLSearchParams(res)
            const profileId = searchParams.get('profile_id')

            if (!profileId) {
                toast({
                    description: "Invalid QR code",
                    variant: 'destructive'
                })
                return
            }

            // todo: handle checkin
        })
    }


    return <>
        {!eventDetail.meeting_url ?
            <div className="max-w-[295px] w-full mt-3">
                <Button onClick={handleCheckin} variant={'primary'} className="w-full">
                    {lang['Scan the Participant\'s QR Code']}
                </Button>
            </div> :
            <div className="mt-3">{lang['Online event, please check in for participants below.']}</div>
        }
    </>
}