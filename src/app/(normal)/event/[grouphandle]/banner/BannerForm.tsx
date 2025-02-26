'use client'

import {Input} from '@/components/shadcn/Input'
import {Button} from '@/components/shadcn/Button'
import {GroupDetail, updateGroup} from '@sola/sdk'
import {Dictionary} from '@/lang'
import {useState} from 'react'
import useUploadImage from '@/hooks/useUploadImage'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {getAuth} from '@/utils'
import {CLIENT_MODE} from '@/app/config'

export default function GroupBannerForm({groupDetail, lang}: { groupDetail: GroupDetail, lang: Dictionary }) {
    const [draft, setDraft] = useState(groupDetail)
    const {uploadImage} = useUploadImage()

    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const handleSave = async () => {
        const loading = showLoading()
        try {
            const authToken = getAuth()
            await updateGroup({
                params: {
                    group: draft,
                    authToken: authToken!
                },
                clientMode: CLIENT_MODE
            })
            toast({title: lang['Save successful'], variant: 'success'})
        } catch (e: unknown) {
            console.error(e)
            toast({
                description: e instanceof Error ? e.message : lang['Save failed'],
                variant: 'destructive'
            })
        } finally {
            closeModal(loading)
        }
    }

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width-md min-h-[calc(100svh-48px) px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Banner']}</div>
            <div className="font-semibold mb-1">{lang['Image']}</div>
            <div onClick={e => {
                uploadImage().then(url => {
                    setDraft({...draft, banner_image_url: url})
                })
            }}
                 className="cursor-pointer bg-secondary rounded-lg h-[170px] flex-col flex justify-center items-center mb-4">
                {
                    draft.banner_image_url
                        ? <img
                            className="max-w-[100%] max-h-[100px]"
                            src={draft.banner_image_url} alt=""/>
                        : <img className="w-[100px] h-[100px] rounded-full"
                               src={'/images/upload_default.png'} alt=""/>
                }
            </div>

            <div className="font-semibold mb-1">{lang['Link']}</div>
            <Input className="w-full mb-4"
                   value={draft.banner_link_url || ''}
                   onChange={e => {
                       setDraft({...draft, banner_link_url: e.target.value})
                   }}
            />

            <div className="grid-cols-2 grid gap-3 mt-6 flex-row-item-center justify-center w-full mx-auto">
                <Button variant={'secondary'} className="w-full"
                        onClick={() => {
                            history.go(-1)
                        }}
                >{lang['Back']}</Button>
                <Button variant={'primary'} className="w-full"
                        onClick={handleSave}
                >{lang['Save']}</Button>
            </div>
        </div>
    </div>
}