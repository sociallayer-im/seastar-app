'use client'

import MarkerForm from '@/app/(normal)/marker/[grouphandle]/create/MarkerForm'
import {createMarker, GroupDetail, MarkerDraft} from '@sola/sdk'
import {Dictionary} from '@/lang'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {getAuth} from '@/utils'
import {CLIENT_MODE} from '@/app/config'

export interface CreateMarkerFormProps {
    draft: MarkerDraft
    lang: Dictionary
    groupDetail: GroupDetail
}

export default function CreateMarkerForm({draft, lang, groupDetail}: CreateMarkerFormProps) {
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const handleCreateMarker = async (draft: MarkerDraft) => {
        const loadingId = showLoading()
        try {
            const authToken = getAuth()
            await createMarker({
                params: {marker: draft, authToken: authToken!},
                clientMode: CLIENT_MODE
            })

            toast({
                title: 'Create marker success',
                variant: 'success'
            })

            setTimeout(() => {
                window.location.href = `/map/${groupDetail.handle}/marker`
            }, 2000)
        } catch (e: unknown) {
            console.error(e)
            toast({
                title: e instanceof Error ? e.message : 'Create marker failed',
                variant: 'destructive'
            })
        } finally {
            closeModal(loadingId)
        }
    }

    const handleCancel = () => {
        window.history.back()
    }

    return <MarkerForm
        lang={lang}
        markerDraft={draft}
        onConfirm={handleCreateMarker}
        onCancel={handleCancel}
    />
}