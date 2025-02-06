'use client'

import {Dictionary} from '@/lang'
import {Group, MarkerDraft, removeMarker, updateMarker} from '@sola/sdk'
import MarkerForm from '@/app/(normal)/marker/[grouphandle]/create/MarkerForm'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {getAuth} from '@/utils'
import useConfirmDialog from '@/hooks/useConfirmDialog'

export interface EditMarkerFormProps {
    lang: Dictionary,
    draft: MarkerDraft,
    group: Group
}

export default function EditMarkerForm({lang, draft, group}: EditMarkerFormProps) {
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()
    const {showConfirmDialog} = useConfirmDialog()

    const handleUpdateMarker = async (draft: MarkerDraft) => {
        const loadingId = showLoading()
        try {
            const authToken = getAuth()
            const marker = await updateMarker(draft, authToken!)

            toast({
                title: 'Update marker success',
                variant: 'success'
            })

            setTimeout(() => {
                window.location.href = `/marker/detail/${draft.id}`
            }, 2000)
        } catch (e: unknown) {
            console.error(e)
            toast({
                title: e instanceof Error ? e.message : 'Update marker failed',
                variant: 'destructive'
            })
        } finally {
            closeModal(loadingId)
        }
    }

    const handleRemoveMarker = async () => {
        showConfirmDialog({
            lang,
            type: 'danger',
            title: 'Remove Marker',
            content: 'Are you sure you want to remove this marker?',
            onConfig: async () => {
                const loadingId = showLoading()
                try {
                    const authToken = getAuth()
                    await removeMarker(draft.id!, authToken!)

                    toast({
                        title: 'Remove marker success',
                        variant: 'success'
                    })

                    setTimeout(() => {
                        window.location.href = `/map/${group.handle}/marker`
                    }, 2000)
                } catch (e: unknown) {
                    console.error(e)
                    toast({
                        title: e instanceof Error ? e.message : 'Remove marker failed',
                        variant: 'destructive'
                    })
                } finally {
                    closeModal(loadingId)
                }
            }
        })
    }

    const handleCancel = () => {
        window.history.back()
    }

    return  <MarkerForm
        lang={lang}
        markerDraft={draft}
        onConfirm={handleUpdateMarker}
        onRemove={handleRemoveMarker}
        onCancel={handleCancel}
    />
}