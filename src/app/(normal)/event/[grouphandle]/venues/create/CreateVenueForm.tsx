'use client'

import { Dictionary } from '@/lang'
import { createVenue, GroupDetail, VenueDetail } from '@sola/sdk'
import VenueForm from '@/app/(normal)/event/[grouphandle]/venues/edit/[venueid]/VenueForm'
import useModal from '@/components/client/Modal/useModal'
import { useToast } from '@/components/shadcn/Toast/use-toast'
import { getAuth } from '@/utils'
import { CLIENT_MODE } from '@/app/config'

export interface CreateVenueFormProps {
    lang: Dictionary,
    venueDetail: VenueDetail,
    groupDetail: GroupDetail
}

export default function CreateVenueForm({ lang, venueDetail, groupDetail }: CreateVenueFormProps) {

    const { showLoading, closeModal } = useModal()
    const { toast } = useToast()

    const handleCreate = async (venue: VenueDetail) => {
        const loading = showLoading()
        try {
            const authToken = getAuth()
            await createVenue({
                params: {
                    venue: venue,
                    authToken: authToken!
                },
                clientMode: CLIENT_MODE
            })
            toast({ title: lang['Create successful'], variant: 'success' })
            setTimeout(() => {
                window.location.href = `/event/${groupDetail.handle}/venues`
            }, 2000)
        } catch (e: unknown) {
            console.error(e)
            toast({
                description: e instanceof Error ? e.message : lang['Save failed'],
                variant: 'destructive'
            })
        } finally {
            closeModal(loading)
        }
    }

    return <VenueForm
        lang={lang}
        venueDetail={venueDetail}
        onConfirm={handleCreate}
        tracks={groupDetail.tracks}
    />
}