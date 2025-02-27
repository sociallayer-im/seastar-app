import DialogConfirm from '@/components/client/DialogConfirm'
import {Dictionary} from '@/lang'
import useModal from '@/components/client/Modal/useModal'

export interface ShowConfirmDialogProps {
    lang: Dictionary,
    title: string,
    type?: 'danger' | 'info',
    content: string,
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