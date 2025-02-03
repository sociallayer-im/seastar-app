'use client'

import {checkInEventForParticipant, EventDetail} from '@sola/sdk'
import {Button} from '@/components/shadcn/Button'
import {Dictionary} from '@/lang'
import useScanQrcode from '@/hooks/useScanQrcode'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import useModal from '@/components/client/Modal/useModal'
import {getAuth} from '@/utils'

export interface CheckinBtnProps {
    eventDetail: EventDetail
    lang: Dictionary
}

export default function CheckinBtn({eventDetail, lang}: CheckinBtnProps) {
    const {scanQrcode} = useScanQrcode()
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const handleCheckin = async () => {
        await scanQrcode(async (res) => {
            let profileId: string | null = null
            try {
                const url = new URL(res)
                profileId = url.searchParams.get('profile_id')
            } catch (e: unknown) {
                console.error(e)
                toast({
                    description: "Invalid QR code",
                    variant: 'destructive'
                })
                return
            }

            if (!profileId) {
                toast({
                    description: "Invalid QR code",
                    variant: 'destructive'
                })
                return
            }


            const loading = showLoading()
            try {
                const authToken = getAuth()
                await checkInEventForParticipant({
                    authToken: authToken!,
                    eventId: eventDetail.id,
                    participantProfileId: Number(profileId)
                })

                toast({
                    description: lang['Check in successful'],
                    variant: 'success'
                })

                setTimeout(() => {
                    window.location.reload()
                }, 2000)
            } catch (e: unknown) {
                console.error(e)
                toast({
                    description: e instanceof Error ? e.message : 'Unknown error',
                    variant: 'destructive'
                })
            } finally {
                closeModal(loading)
            }
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