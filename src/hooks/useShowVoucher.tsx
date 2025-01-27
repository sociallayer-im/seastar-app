import useModal from '@/components/client/Modal/useModal'
import DialogVoucherDetail from '@/components/client/DialogVoucherDetail'
import {getAuth} from '@/utils'
import {ProfileDetail, getProfileDetailByAuth, getVoucherDetailById, Profile, getProfileDetailById} from '@sola/sdk'
import {Dictionary} from '@/lang'

export default function useShowVoucher() {
    const {showLoading, closeModal, openModal} = useModal()
    const showVoucher = async (voucherId: number, lang: Dictionary) => {
        const loading = showLoading()
        try {
            let currProfile: ProfileDetail | null
            const auth = getAuth()
            if (auth) {
                currProfile = await getProfileDetailByAuth(auth)
            }
            const voucherDetail = await getVoucherDetailById(voucherId)
            if (!voucherDetail) return

            let receiver: Profile | null = null
            if (voucherDetail.receiver_id) {
                receiver = await getProfileDetailById(voucherDetail.receiver_id)
            }

            openModal({
                content:(close) => <DialogVoucherDetail
                    receiver={receiver}
                    close={close!}
                    voucherDetail={voucherDetail}
                    currProfile={currProfile || undefined}
                    lang={lang}
                />
            })
        } catch (e) {
            console.error(e)
        } finally {
            closeModal(loading)
        }
    }

    return {showVoucher}
}