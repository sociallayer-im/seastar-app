import useModal from '@/components/client/Modal/useModal'
import DialogVoucherDetail from '@/components/client/DialogVoucherDetail'
import {getAuth} from '@/utils'
import {ProfileDetail, getProfileDetailByAuth, getVoucherDetailById, Profile, getProfileDetailById} from '@sola/sdk'
import {Dictionary} from '@/lang'
import {CLIENT_MODE} from '@/app/config'

export default function useShowVoucher() {
    const {showLoading, closeModal, openModal} = useModal()
    const showVoucher = async (voucherId: number, lang: Dictionary) => {
        const loading = showLoading()
        try {
            let currProfile: ProfileDetail | null
            const auth = getAuth()
            if (auth) {
                currProfile = await getProfileDetailByAuth({
                    params: {
                        authToken: auth
                    },
                    clientMode: CLIENT_MODE
                })
            }
            const voucherDetail = await getVoucherDetailById({
                params: {
                    id: voucherId
                },
                clientMode: CLIENT_MODE
            })
            if (!voucherDetail) return

            let receiver: Profile | null = null
            if (voucherDetail.receiver_id) {
                receiver = await getProfileDetailById({
                    params: {id: voucherDetail.receiver_id},
                    clientMode: CLIENT_MODE
                })
            }

            openModal({
                content: (close) => <DialogVoucherDetail
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