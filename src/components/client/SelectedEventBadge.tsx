import {Dictionary} from "@/lang"
import {Button} from "@/components/shadcn/Button"
import {EventDraftType} from "@/app/(normal)/event/[grouphandle]/create/data"
import useModal from "@/components/client/Modal/useModal"
import {useEffect, useState} from "react"
import {getBadgeClassDetailById} from "@/service/solar"

export interface SelectedEventBadgeProps {
    lang: Dictionary
    state: {
        event: EventDraftType
        setEvent: (event: EventDraftType) => void
    }
}

export default function SelectedEventBadge({lang, state:{event, setEvent}}: SelectedEventBadgeProps) {

    const {openModal} = useModal()
    const [badgeClass, setBadgeClass] = useState<Solar.BadgeClass | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        ;(async ()=> {
            if (!!event.badge_class_id && badgeClass?.id !== event.badge_class_id) {
                setLoading(true)
                setBadgeClass(await getBadgeClassDetailById(event.badge_class_id))
                setLoading(false)
            }
        })()
    }, [event.badge_class_id, badgeClass])

    const handleSelectedBadge = () => {
        openModal({
            content: () => <div>123</div>
        })
    }


    return <div className="mt-2">
        {true && <div className="loading-bg h-[114px] w-[114px] rounded-lg" />}

        <Button variant={'secondary'} className="mt-2 text-sm" onClick={handleSelectedBadge}>
            <i className="uil-plus-circle text-lg"/>
            {lang['Set a POAP badge for attendees']}
        </Button>
    </div>
}
