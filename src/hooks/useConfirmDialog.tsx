import DialogConfirm from '@/components/client/DialogConfirm'
import {Dictionary} from '@/lang'
import useModal from '@/components/client/Modal/useModal'

interface showConfirmDialogProps {
    lang: Dictionary,
    title: string,
    type?: 'danger' | 'info',
    content: string,
    onConfig?: () => void,
    onCanceled?: () => void
}

export default function useConfirmDialog() {
    const {openModal} = useModal()

    const showConfirmDialog = (props: showConfirmDialogProps) => {
        openModal({
            content: (close) => <DialogConfirm
                {...props} close={close!}
            />
        })
    }

    return {showConfirmDialog}
}