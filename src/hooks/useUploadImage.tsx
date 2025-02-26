import chooseFile from "@/utils/choseFile"
import useModal from "@/components/client/Modal/useModal"
import {useToast} from "@/components/shadcn/Toast/use-toast"
import Cookies from "js-cookie"
import {uploadFile} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'

export default function useUploadImage() {
    const {closeModal, showLoading} = useModal()
    const {toast} = useToast()

    const uploadImage = async () => {
        const files = await chooseFile({accepts: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']})
        const reader = new FileReader()
        reader.readAsDataURL(files[0])

        return new Promise<string>((resolve, reject) => {
            reader.onload = async () => {
                const loadingId = showLoading()
                try {
                    const baseData = reader.result as string
                    let byteString
                    if (baseData!.split(',')[0].indexOf('base64') >= 0)
                        byteString = atob(baseData.split(',')[1])
                    else {
                        byteString = unescape(baseData.split(',')[1])
                    }
                    const ia = new Uint8Array(byteString.length)
                    for (let i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i)
                    }
                    const blob = new Blob([ia], {type: 'image/png'})

                    const auth_token = Cookies.get(process.env.NEXT_PUBLIC_AUTH_FIELD!)
                    if (!auth_token) {
                        throw new Error('Please login first')
                    }

                    const url = await uploadFile({
                        params: {file: blob, authToken: auth_token},
                        clientMode: CLIENT_MODE
                    })
                    const image = new Image()
                    image.src = url
                    image.onload = () => {
                        resolve(url)
                    }
                    image.onerror = () => {
                        reject(new Error('Load image failed'))
                    }
                } catch (e:unknown) {
                    toast({
                        title: e instanceof Error ? e.message : 'Upload failed',
                        variant: 'destructive'
                    })
                    reject(new Error('Upload failed'))
                } finally {
                    closeModal(loadingId)
                }
            }
        })
    }

    return {uploadImage}
}
