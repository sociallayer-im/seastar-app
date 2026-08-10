'use client'

import {CurationTag, PopupCity, updateGroupTags, deletePopupCity} from '@sola/sdk'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {getAuth} from '@/utils'
import {CLIENT_MODE} from '@/app/config'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import {Dictionary} from '@/lang'

// The minimum a card has to give us to curate it. Both the popup-city cards
// and the community cards satisfy this, which is the point — the same control
// drives the homepage from either list.
export interface CuratableGroup {
    id: string
    group_tags: string[] | null
}

interface ManagActionsProps {
    group: CuratableGroup
    lang: Dictionary
    /** Which tags to offer. Defaults to all three. */
    tags?: CurationTag[]
    /**
     * Popup-city deletion. Only passed from the popup-city list, where the
     * card IS the popup city; the community directory deliberately offers no
     * destructive action.
     */
    popupCity?: PopupCity
}

const TAG_META: Record<CurationTag, {icon: string, title: string}> = {
    pin: {icon: 'uil-thumbtack', title: 'Pin to home page communities'},
    top: {icon: 'uil-top-arrow-to-top', title: 'Show in home page pop-up cities'},
    featured: {icon: 'uil-bookmark', title: 'Feature in the home page carousel'}
}

// Platform-admin curation. Rendered only for platform admins (see
// isPlatformAdmin — either the `admin` flag or the older permissions array);
// the backend enforces the same rule by stripping these tags from anyone else
// (GroupsController::PRIVILEGED_TAGS), so the gate is not the only defence.
const ManagActions = ({group, lang, tags = ['pin', 'top', 'featured'], popupCity}: ManagActionsProps) => {
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()
    const {showConfirmDialog} = useConfirmDialog()

    const toggleTag = (tag: CurationTag) => async (e: React.MouseEvent<HTMLDivElement>) => {
        // The control sits inside the card's link — without both of these,
        // curating a group navigates away from the list mid-request.
        e.stopPropagation()
        e.preventDefault()
        showLoading()
        try {
            const current = group.group_tags || []
            const next = current.includes(tag)
                ? current.filter(t => t !== tag)
                : [...current, tag]
            await updateGroupTags({
                params: {groupId: group.id, groupTags: next, authToken: getAuth()!},
                clientMode: CLIENT_MODE
            })
            window.location.reload()
        } catch (error) {
            console.error(error)
            toast({
                title: `Failed to set ${tag}`,
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
                        params: {authToken: getAuth()!, popupCity: popupCity!},
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
            {!!popupCity &&
                <div className="flex-row-item-center justify-center w-7 h-7 rounded-full cursor-pointer bg-[rgba(0,0,0,0.5)]"
                     title="Delete" onClick={handleDelete}>
                    <i className="uil-trash-alt text-white"/>
                </div>
            }
            {tags.map(tag => {
                const on = group.group_tags?.includes(tag)
                return <div key={tag}
                            className={`flex-row-item-center justify-center w-7 h-7 rounded-full cursor-pointer bg-[rgba(0,0,0,0.5)] ${on ? 'border-primary border-2' : ''}`}
                            title={TAG_META[tag].title}
                            onClick={toggleTag(tag)}>
                    <i className={`${TAG_META[tag].icon} ${on ? 'text-primary' : 'text-white'}`}/>
                </div>
            })}
        </div>
    )
}

export default ManagActions
