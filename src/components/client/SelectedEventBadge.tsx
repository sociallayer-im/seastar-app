import {Dictionary} from "@/lang"
import {Button} from "@/components/shadcn/Button"
import useModal from "@/components/client/Modal/useModal"
import {useEffect, useState} from "react"
import {getBadgeClassDetailById, getGroupBadgeClasses} from "@/service/solar"
import useSelectBadgeClass from "@/hooks/useSelectBadgeClass"
import {EventDraftType, BadgeClass} from '@sola/sdk'

export interface SelectedEventBadgeProps {
    lang: Dictionary
    profileBadgeClasses: BadgeClass[]
    state: {
        event: EventDraftType
        setEvent: (event: EventDraftType) => void
    }
}

export default function SelectedEventBadge({
    lang,
    state: {event, setEvent},
    profileBadgeClasses
}: SelectedEventBadgeProps) {

    const {showLoading, closeModal} = useModal()
    const [badgeClass, setBadgeClass] = useState<Solar.BadgeClass | null>(null)
    const [loading, setLoading] = useState(false)

    const {selectBadgeClass} = useSelectBadgeClass()

    useEffect(() => {
        ;(async () => {
            if (!!event.badge_class_id && badgeClass?.id !== event.badge_class_id) {
                setLoading(true)
                setBadgeClass(await getBadgeClassDetailById(event.badge_class_id))
                setLoading(false)
            }
        })()
    }, [event.badge_class_id, badgeClass])

    const handleSelectedBadge = async () => {
        const loading = showLoading()
        try {
            let groupBadgeClasses: Solar.BadgeClass[] = []
            const groupHost = event.event_roles?.find(r => r.role === 'group_host')
            if (groupHost) {
                groupBadgeClasses = await getGroupBadgeClasses(groupHost.item_id!, 20)
            }

           /* selectBadgeClass(lang, profileBadgeClasses, groupBadgeClasses, (b) => {
                setEvent({...event, badge_class_id: b.id})
                setBadgeClass(b)
            })*/
        } catch (e: unknown) {
            console.error(e)
        } finally {
            closeModal(loading)
        }
    }

    const resetBadge = () => {
        setEvent({...event, badge_class_id: null})
        setBadgeClass(null)
    }


    return <div className="mt-2">
        {loading && <div className="loading-bg h-[114px] w-[114px] rounded-lg"/>}

        {!!badgeClass &&
            <div className="relative w-[114px] h-[114px] rounded-lg bg-[#ecf2ee] flex flex-col justify-center items-center">
                <img className="w-[60px] h-[60px] rounded-full mb-2" src={badgeClass.image_url!} alt=""/>
                <div className="text-xs w-[80%] mx-auto webkit-box-clamp-1 text-center">{badgeClass.title}</div>
                <i  onClick={resetBadge}
                    className="uil-times cursor-pointer opacity-50 hover:opacity-100 text-lg right-2 top-1 absolute" />
            </div>

        }

        {!badgeClass &&
            <Button variant={'secondary'} className="mt-2 text-sm" onClick={handleSelectedBadge}>
                <i className="uil-plus-circle text-lg"/>
                {lang['Set a POAP badge for attendees']}
            </Button>
        }
    </div>
}
