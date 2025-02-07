import {SolaSdkFunctionParams} from './types'
import {getSdkConfig} from './client'

export  const uploadFile = async ({params, clientMode}: SolaSdkFunctionParams<{file: Blob, authToken: string}>) => {

    const formData = new FormData()
    formData.append('auth_token', params.authToken)
    formData.append('uploader', 'user')
    formData.append('resource', Math.random().toString(36).slice(-8))
    formData.append('data', params.file)

    const response = await fetch(`${getSdkConfig(clientMode).api}/service/upload_image`, {
        method: 'POST',
        body: formData
    })

    if (!response.ok) {
        throw new Error('Upload failed')
    }

    const data = await response.json()
    return data.result.url as string
}