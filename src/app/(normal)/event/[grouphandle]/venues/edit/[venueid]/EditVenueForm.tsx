'use client'

import VenueForm from '@/app/(normal)/event/[grouphandle]/venues/edit/[venueid]/VenueForm'
import { GroupDetail, updateVenue, VenueDetail} from '@sola/sdk'
import {Dictionary} from '@/lang'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {getAuth} from '@/utils'
import {CLIENT_MODE} from '@/app/config'

export default function EditVenueForm({groupDetail, lang, venueDetail, isDashboardPage}: {
    groupDetail: GroupDetail,
    lang: Dictionary,
    venueDetail: VenueDetail,
    isDashboardPage?: boolean
}) {

    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const handleSave = async (venue: VenueDetail) => {
        const loading = showLoading()
        try {
            const authToken = getAuth()
            await updateVenue({
                params: {
                    venue: venue,
                    authToken: authToken!
                },
                clientMode: CLIENT_MODE
            })
            toast({title: lang['Save successful'], variant: 'success'})
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
        isDashboardPage={isDashboardPage}
        venueDetail={venueDetail}
        lang={lang}
        tracks={groupDetail.tracks}
        onConfirm={handleSave}/>
}