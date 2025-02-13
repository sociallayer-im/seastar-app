import useModal from '@/components/client/Modal/useModal'
import {Badge, getProfileDetailByAuth, getSwapCode} from '@sola/sdk'
import {getAuth} from '@/utils'
import {CLIENT_MODE} from '@/app/config'
import DialogBadgeSwap from '@/components/client/DialogBadgeSwap/DialogBadgeSwap'
import {useToast} from '@/components/shadcn/Toast/use-toast'

export default function useSwapBadge() {
    const {showLoading, closeModal, openModal} = useModal()
    const {toast}= useToast()

    const swapBadge = async (badge: Badge) => {
        const authToken = getAuth()
        if (!authToken) return
        const loading = showLoading()
        try {
            const code = await getSwapCode({params: {authToken, badgeId: badge.id}, clientMode: CLIENT_MODE})
            const currProfile = await getProfileDetailByAuth({params: {authToken}, clientMode: CLIENT_MODE})
            closeModal(loading)

            openModal({
                content: (close) => <DialogBadgeSwap
                    currProfile={currProfile!}
                    badge={badge}
                    code={code}
                    close={close!}
                />
            })
        } catch (e: unknown) {
            console.error(e)
            toast({
                description: e instanceof Error ? e.message : 'Failed to get swap code',
                variant: 'destructive'
            })
            closeModal(loading)
        }
    }

    return {swapBadge}
}