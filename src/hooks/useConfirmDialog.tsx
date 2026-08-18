import type {ReactNode} from 'react'
import DialogConfirm from '@/components/client/DialogConfirm'
import {Dictionary} from '@/lang'
import useModal from '@/components/client/Modal/useModal'

export interface ShowConfirmDialogProps {
    lang: Dictionary,
    title: string,
    type?: 'danger' | 'info',
    /** Rendered as React, never as HTML — see DialogConfirm. */
    content: ReactNode,
    hiddenCancelBtn?: boolean,
    onConfig?: () => void,
    onCanceled?: () => void
}

export default function useConfirmDialog() {
    const {openModal} = useModal()

    const showConfirmDialog = (props: ShowConfirmDialogProps) => {
        openModal({
            content: (close) => <DialogConfirm
                {...props} close={close!}
            />
        })
    }

    return {showConfirmDialog}
}