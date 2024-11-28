import chooseFile from "@/utils/choseFile"
import useModal from "@/components/client/Modal/useModal"
import DialogCropper from "@/hooks/useUploadAvatar/DialogCropper"
import {uploadFile} from "@/service/solar"
import {useToast} from "@/components/shadcn/Toast/use-toast"
import Cookies from "js-cookie"

export default function useUploadAvatar() {
    const {openModal, closeModal, showLoading} = useModal()
    const {toast} = useToast()

    const uploadAvatar = async ({onUploaded}: {onUploaded?: (url: string) => void}) => {
        const files = await chooseFile({accepts: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']})
        const reader = new FileReader()
        reader.readAsDataURL(files[0])
        reader.onload = async () => {
            openModal({
                content: (close) => {
                    return <DialogCropper
                        close={close}
                        imgURL={reader.result as string}
                        onConfirm={async (blob) => {
                            const loadingId = showLoading()
                            try {
                                const auth_token = Cookies.get(process.env.NEXT_PUBLIC_AUTH_FIELD!)
                                if (!auth_token) {
                                    throw new Error('Please login first')
                                }

                                const url = await uploadFile(blob, auth_token)
                                const image = new Image()
                                image.src = url
                                image.onload = () => {
                                    !!onUploaded && onUploaded(url)
                                    !!close && close()
                                }

                                image.onerror = () => {
                                    throw new Error('Upload failed')
                                }
                            } catch (e:unknown) {
                                toast({
                                    title: e instanceof Error ? e.message : 'Upload failed',
                                    variant: 'destructive'
                                })
                            } finally {
                                closeModal(loadingId)
                            }
                        }}
                    />
                }
            })
        }
    }

    return {uploadAvatar}
}
