import {Dictionary} from "@/lang"
import {Button} from "@/components/shadcn/Button"
import useModal from "@/components/client/Modal/useModal"
import {useEffect, useState} from "react"
import useSelectBadgeClass from "@/hooks/useSelectBadgeClass"
import {
    EventDraftType,
    BadgeClass,
    Profile,
    getBadgeAndBadgeClassByOwnerHandle,
    getBadgeClassByGroupId, getBadgeClassDetailByBadgeClassId
} from '@sola/sdk'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {CLIENT_MODE} from '@/app/config'

export interface SelectedEventBadgeProps {
    lang: Dictionary
    state: {
        event: EventDraftType
        setEvent: (event: EventDraftType) => void
    }
    currProfile: Profile
}

export default function SelectedEventBadge({
                                               lang,
                                               currProfile,
                                               state: {event, setEvent},
                                           }: SelectedEventBadgeProps) {

    const [badgeClass, setBadgeClass] = useState<BadgeClass | null>(null)
    const [loading, setLoading] = useState(false)
    const {selectBadgeClass} = useSelectBadgeClass()
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    useEffect(() => {
        ;(async () => {
            if (!!event.badge_class_id && event.badge_class_id !== badgeClass?.id) {
                setLoading(true)
                const newBadgeClass = await getBadgeClassDetailByBadgeClassId({
                    params: {badgeClassId: event.badge_class_id},
                    clientMode: CLIENT_MODE
                })
                setBadgeClass(newBadgeClass)
                setLoading(false)
            }
        })()
    }, [event.badge_class_id, badgeClass])

    const resetBadge = () => {
        setEvent({...event, badge_class_id: null})
        setBadgeClass(null)
    }

    const handleSelectedBadge = async () => {
        const loading = showLoading()
        try {
            const profileBadgeClasses = (await getBadgeAndBadgeClassByOwnerHandle({
                params: {handle: currProfile.handle},
                clientMode: CLIENT_MODE
            })).badgeClasses
            let groupHostBadgeClasses: BadgeClass[] = []
            const groupHost = event.event_roles?.find(role => role.role === 'group_host')
            if (groupHost) {
                groupHostBadgeClasses = await getBadgeClassByGroupId({
                    params: {
                        groupId: groupHost.item_id!
                    },
                    clientMode: CLIENT_MODE
                })
            }

            selectBadgeClass({
                lang,
                returnPage: window.location.href,
                profileBadgeClasses,
                groupBadgeClasses: groupHostBadgeClasses,
                onSelect: (b) => {
                    setEvent({...event, badge_class_id: b.id})
                    setBadgeClass(b)
                    closeModal()
                }
            })
        } catch (e: unknown) {
            console.error(e)
            toast({description: e instanceof Error ? e.message : 'failed to get badge classes', variant: 'destructive'})
        } finally {
            closeModal(loading)
        }
    }

    return !!event.id ?
        <div className="mt-2" test-id="selected-event-badge">
            {loading && <div className="loading-bg h-[114px] w-[114px] rounded-lg"/>}

            {!!badgeClass &&
                <div
                    className="relative w-[114px] h-[114px] rounded-lg bg-[#ecf2ee] flex flex-col justify-center items-center">
                    <img className="w-[60px] h-[60px] rounded-full mb-2" src={badgeClass.image_url!} alt=""/>
                    <div className="text-xs w-[80%] mx-auto webkit-box-clamp-1 text-center">{badgeClass.title}</div>
                    <i onClick={resetBadge}
                       className="uil-times cursor-pointer opacity-50 hover:opacity-100 text-lg right-2 top-1 absolute"/>
                </div>

            }

            {!badgeClass &&
                <Button variant={'secondary'} className="mt-2 text-sm"
                        onClick={handleSelectedBadge}
                >
                    <i className="uil-plus-circle text-lg"/>
                    {lang['Set a POAP badge for attendees']}
                </Button>
            }
        </div>
        : <div className="text-xs text-gray-500">
            {lang['You can set up POAP after the event is created.']}
        </div>
}
