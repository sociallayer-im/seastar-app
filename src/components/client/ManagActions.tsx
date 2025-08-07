'use client'

import { PopupCity } from '@sola/sdk'
import { useState } from 'react'
import { updatePopupCityGroupTags, deletePopupCity } from '@sola/sdk'
import useModal from "@/components/client/Modal/useModal"
import { useToast } from "@/components/shadcn/Toast/use-toast"
import { getAuth } from '@/utils'
import { CLIENT_MODE } from '@/app/config'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import { Dictionary } from '@/lang'

interface ManagActionsProps {
    popupCity: PopupCity
    lang: Dictionary
}

const ManagActions = ({ popupCity, lang }: ManagActionsProps) => {
    const { openModal, showLoading, closeModal } = useModal()
    const { toast } = useToast()
    const { showConfirmDialog } = useConfirmDialog()

    const [isTop, setIsTop] = useState(popupCity.group_tags?.includes(":top"))
    const [isFeatured, setIsFeatured] = useState(popupCity.group_tags?.includes(":featured"))

    const handleSetToTop = async (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        e.preventDefault()
        showLoading()
        try {
            const authToken = getAuth()
            const newGroupTags = isTop
                ? (popupCity.group_tags || [])?.filter(tag => tag !== ":top")
                : [...(popupCity.group_tags || []), ":top"] as string[]
            await updatePopupCityGroupTags({
                params: {
                    authToken: authToken!,
                    popupCity: {
                        ...popupCity,
                        group_tags: newGroupTags.length > 0 ? newGroupTags : null
                    },
                },
                clientMode: CLIENT_MODE
            })
            window.location.reload()
        } catch (error) {
            console.error(error)
            toast({
                title: 'Failed to set to top',
                description: (error as Error).message,
                variant: 'destructive',
            })
        } finally {
            closeModal()
        }
    }

    const handleSetToFeatured = async (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        e.preventDefault()
        showLoading()

        try {
            const authToken = getAuth()
            const newGroupTags = isFeatured
                ? (popupCity.group_tags || [])?.filter(tag => tag !== ":featured")
                : [...(popupCity.group_tags || []), ":featured"] as string[]
            await updatePopupCityGroupTags({
                params: {
                    authToken: authToken!,
                    popupCity: {
                        ...popupCity,
                        group_tags: newGroupTags.length > 0 ? newGroupTags : null
                    },
                },
                clientMode: CLIENT_MODE
            })
            window.location.reload()
        } catch (error) {
            console.error(error)
            toast({
                title: 'Failed to set to featured',
                description: (error as Error).message,
                variant: 'destructive',
            })
        } finally {
            closeModal()
        }
    }

    const handleDelete = async (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        e.preventDefault()
        showConfirmDialog({
            lang,
            title: 'Delete Popup City',
            content: 'Do you want to delete this popup city?',
            onConfig: async () => {
                showLoading()
                try {
                    deletePopupCity({
                        params: {
                            authToken: getAuth()!,
                            popupCity: popupCity
                        },
                        clientMode: CLIENT_MODE
                    })
                    window.location.reload()
                } catch (error) {
                    console.error(error)
                    toast({
                        title: 'Failed to delete',
                        description: (error as Error).message,
                        variant: 'destructive',
                    })
                } finally {
                    closeModal()
                }
            }
        })
    }

    return (
        <div className="flex flex-row gap-2 absolute top-5 right-5">
            <div className="flex-row-item-center justify-center w-7 h-7 rounded-full cursor-pointer bg-[rgba(0,0,0,0.5)]" title="Delete" onClick={handleDelete}>
                <i className="uil-trash-alt text-white" />
            </div>
            <div className={`flex-row-item-center justify-center w-7 h-7 rounded-full cursor-pointer bg-[rgba(0,0,0,0.5)] ${isTop ? 'border-primary border-2' : ''}`} title="Set to Home page" onClick={handleSetToTop}>
                <i className={`uil-top-arrow-to-top  ${isTop ? 'text-primary' : 'text-white'}`} />
            </div>
            <div className={`flex-row-item-center justify-center w-7 h-7 rounded-full cursor-pointer bg-[rgba(0,0,0,0.5)] ${isFeatured ? 'border-primary border-2' : ''}`} title="Featured" onClick={handleSetToFeatured}>
                <i className={`uil-bookmark ${isFeatured ? 'text-primary' : 'text-white'}`} />
            </div>
        </div>
    )
}

export default ManagActions 