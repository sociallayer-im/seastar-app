'use client'

import {Dictionary} from '@/lang'
import {GroupDetail, updateGroup} from '@sola/sdk'
import {useState} from 'react'
import {Input} from '@/components/shadcn/Input'
import {Button} from '@/components/shadcn/Button'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {getAuth} from '@/utils'
import {CLIENT_MODE} from '@/app/config'

export default function TagForm({groupDetail, lang}: { groupDetail: GroupDetail, lang: Dictionary }) {
    const [draft, setDraft] = useState(groupDetail.event_tags || [""])

    const addTag = () => {
        setDraft([...draft, ""])
    }

    const removeTag = (index: number) => {
        setDraft(draft.filter((_, i) => i !== index))
    }

    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const handleSave = async () => {
        const filterEmpty = draft.filter(tag => tag.trim() !== "")
        const checkDuplicate = new Set(filterEmpty.map(tag => tag.trim()))
        if (filterEmpty.length !== checkDuplicate.size) {
            toast({
                description: 'Duplicate tags are not allowed',
                variant: 'destructive'
            })
            return
        }

        const loading = showLoading()
        try {
            const authToken = getAuth()
            await updateGroup({
                params: {
                    group: {
                        ...groupDetail,
                        event_tags: Array.from(checkDuplicate)
                    },
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
            <div className="py-6 font-semibold text-center text-xl">{lang['Event Tags']}</div>
            <div className="mb-4">{lang['Event tags that creators can choose for their events.']}</div>
            <div className="grid grid-cols-1 gap-3">
                {
                    draft.map((tag, index) => {
                        return <div key={index} className="flex-row-item-center w-full">
                            <Input value={tag} className="flex-1 mr-3"
                                   onChange={event => {
                                       const newDraft = [...draft]
                                       newDraft[index] = event.target.value
                                       setDraft(newDraft)
                                   }}
                                   placeholder="Enter a tag"/>
                            {index === draft.length - 1 &&
                                <i className="uil-plus-circle text-3xl text-green-500 cursor-pointer" onClick={addTag}/>
                            }
                            <i onClick={() => removeTag(index)}
                               className="uil-minus-circle text-3xl text-gray-500 cursor-pointer"/>
                        </div>
                    })
                }
            </div>

            <div className="grid-cols-2 grid gap-3 mt-6 flex-row-item-center justify-center w-full mx-auto">
                <Button variant={'secondary'} className="w-full"
                        onClick={() => {
                            history.go(-1)
                        }}
                >{lang['Cancel']}</Button>
                <Button variant={'primary'} className="w-full"
                        onClick={handleSave}
                >{lang['Save']}</Button>
            </div>
        </div>
    </div>
}