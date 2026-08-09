'use client'

import {PopupCity} from '@sola/sdk'
import {updatePopupCityGroupTags, deletePopupCity} from '@sola/sdk'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {getAuth} from '@/utils'
import {CLIENT_MODE} from '@/app/config'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import {Dictionary} from '@/lang'

interface ManagActionsProps {
    popupCity: PopupCity
    lang: Dictionary
}

// Platform-admin curation for popup cities: toggle the "top" (homepage) and
// "featured" (carousel) group tags, or delete the popup city. Rendered only
// for platform admins (see isPlatformAdmin — either the `admin` flag or the
// older permissions array) — the backend enforces the same rule.
const ManagActions = ({popupCity, lang}: ManagActionsProps) => {
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()
    const {showConfirmDialog} = useConfirmDialog()

    const isTop = popupCity.group_tags?.includes('top')
    const isFeatured = popupCity.group_tags?.includes('featured')

    const toggleTag = (tag: 'top' | 'featured') => async (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        e.preventDefault()
        showLoading()
        try {
            const tags = popupCity.group_tags || []
            const newGroupTags = tags.includes(tag)
                ? tags.filter(t => t !== tag)
                : [...tags, tag]
            await updatePopupCityGroupTags({
                params: {
                    authToken: getAuth()!,
                    popupCity: {...popupCity, group_tags: newGroupTags}
                },
                clientMode: CLIENT_MODE
            })
            window.location.reload()
        } catch (error) {
            console.error(error)
            toast({
                title: `Failed to set to ${tag}`,
                description: (error as Error).message,
                variant: 'destructive'
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
                    await deletePopupCity({
                        params: {authToken: getAuth()!, popupCity},
                        clientMode: CLIENT_MODE
                    })
                    window.location.reload()
                } catch (error) {
                    console.error(error)
                    toast({
                        title: 'Failed to delete',
                        description: (error as Error).message,
                        variant: 'destructive'
                    })
                } finally {
                    closeModal()
                }
            }
        })
    }

    return (
        <div className="flex flex-row gap-2 absolute top-5 right-5">
            <div className="flex-row-item-center justify-center w-7 h-7 rounded-full cursor-pointer bg-[rgba(0,0,0,0.5)]"
                title="Delete" onClick={handleDelete}>
                <i className="uil-trash-alt text-white"/>
            </div>
            <div className={`flex-row-item-center justify-center w-7 h-7 rounded-full cursor-pointer bg-[rgba(0,0,0,0.5)] ${isTop ? 'border-primary border-2' : ''}`}
                title="Set to Home page" onClick={toggleTag('top')}>
                <i className={`uil-top-arrow-to-top ${isTop ? 'text-primary' : 'text-white'}`}/>
            </div>
            <div className={`flex-row-item-center justify-center w-7 h-7 rounded-full cursor-pointer bg-[rgba(0,0,0,0.5)] ${isFeatured ? 'border-primary border-2' : ''}`}
                title="Featured" onClick={toggleTag('featured')}>
                <i className={`uil-bookmark ${isFeatured ? 'text-primary' : 'text-white'}`}/>
            </div>
        </div>
    )
}

export default ManagActions
