'use client'

import {Button} from '@/components/shadcn/Button'
import {Dictionary} from '@/lang'
import {Group, leaveGroup, Profile} from '@sola/sdk'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import useModal from '@/components/client/Modal/useModal'
import {getAuth} from '@/utils'
import {useToast} from '@/components/shadcn/Toast/use-toast'

export interface LeaveGroupBtnProps {
    lang: Dictionary
    group: Group
    profile: Profile
}

export default function LeaveGroupBtn({lang, group, profile}: LeaveGroupBtnProps) {
    const {showConfirmDialog} = useConfirmDialog()
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const handleLeave = async () => {
        const loading = showLoading()
        try {
            const authToken = getAuth()
            if (!authToken) {
                closeModal(loading)
                toast({title: 'Please login first', variant: 'destructive'})
                return
            }
            await leaveGroup(profile.id, group.id, authToken)
            window.location.reload()
        } catch (e: unknown) {
            closeModal(loading)
            toast({description: e instanceof Error ? e.message : 'Failed to leave group', variant: 'destructive'})
            closeModal(loading)
        }
    }

    const showConfirm = () => {
        showConfirmDialog({
            lang,
            title: lang['Leave Group'],
            content: lang['Are you sure you want to leave the group?'],
            onConfig: handleLeave
        })
    }

    return <Button
        onClick={showConfirm}
        className={`text-xs sm:text-sm sm:h-9 mt-3 sm:mt-0`} variant={'warm'} size={'sm'} >
        {lang['Leave Group']}
    </Button>
}