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
        const files = await chooseFile({
            accepts: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
        })
        const file = files[0]
        const reader = new FileReader()
        reader.readAsDataURL(file)

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
                    // The file's OWN type, not a hardcoded image/png. This
                    // round trip only re-packages the bytes — it does not
                    // convert anything — so labelling everything png stored a
                    // JPEG, a GIF and an SVG under a content type none of them
                    // had. Browsers sniff their way through that inside an
                    // <img>, which is why it went unnoticed, but an SVG does
                    // not survive it, and Cloudflare's resizing reads the
                    // header it is given.
                    const blob = new Blob([ia], {type: file.type || 'image/png'})

                    const auth_token = Cookies.get(process.env.NEXT_PUBLIC_AUTH_FIELD!)
                    if (!auth_token) {
                        throw new Error('Please login first')
                    }

                    const url = await uploadFile({
                        params: {file: blob, authToken: auth_token},
                        clientMode: CLIENT_MODE
                    })
                    // Wait for the object to be fetchable before handing the
                    // URL back, so a form does not save a link that 404s for a
                    // moment. It is a readiness check, not a validity one: the
                    // upload has already succeeded server-side by this point,
                    // so a browser that declines to decode the image should
                    // not throw the stored URL away.
                    const image = new Image()
                    image.src = url
                    image.onload = () => resolve(url)
                    image.onerror = () => resolve(url)
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
