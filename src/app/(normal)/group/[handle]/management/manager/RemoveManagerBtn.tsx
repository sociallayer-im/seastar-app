'use client'

import useConfirmDialog from '@/hooks/useConfirmDialog'
import {removeManager} from '@sola/sdk'
import {Dictionary} from '@/lang'
import useModal from '@/components/client/Modal/useModal'
import {getAuth} from '@/utils'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {CLIENT_MODE} from '@/app/config'

export interface RemoveManagerBtnProps {
    profileId: number,
    groupId: number,
    lang: Dictionary
}

export default function RemoveManagerBtn({profileId, groupId, lang}: RemoveManagerBtnProps) {
    const {showConfirmDialog} = useConfirmDialog()
    const {closeModal, showLoading} = useModal()
    const {toast} = useToast()


    const remove = async () => {
        const loading = showLoading()
        try {
            const authToken = getAuth()
            if (!authToken) {
                closeModal(loading)
                toast({
                    description: 'You are not logged in',
                    variant: 'destructive'
                })
                return
            }

            await removeManager({
                params: {
                    profileId: profileId,
                    groupId,
                    authToken
                }, clientMode: CLIENT_MODE
            })
            window.location.reload()
        } catch (e: unknown) {
            console.error(e)
            closeModal(loading)
            toast({
                description: e instanceof Error ? e.message : 'An error occurred',
                variant: 'destructive'
            })
        }
    }

    const handleRemove = () => {
        showConfirmDialog({
            lang,
            title: lang['Remove manager'],
            content: lang['Do you want to remove this manager?'],
            onConfig: remove
        })
    }

    return <i
        onClick={handleRemove}
        className="cursor-pointer uil-minus-circle text-2xl text-gray-500"></i>

}