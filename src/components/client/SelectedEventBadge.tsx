import {Dictionary} from "@/lang"
import {Button} from "@/components/shadcn/Button"
import {EventDraftType} from "@/app/(normal)/event/[grouphandle]/create/data"
import useModal from "@/components/client/Modal/useModal"
import {useEffect, useState} from "react"
import {getBadgeClassDetailById, getGroupBadgeClasses} from "@/service/solar"

export interface SelectedEventBadgeProps {
    lang: Dictionary
    profileBadgeClasses: Solar.BadgeClass[]
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

    const {openModal, showLoading, closeModal} = useModal()
    const [badgeClass, setBadgeClass] = useState<Solar.BadgeClass | null>(null)
    const [loading, setLoading] = useState(false)

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

            openModal({
                content: (close) => <DialogSelectedBadge
                    lang={lang}
                    close={close}
                    profileBadgeClasses={profileBadgeClasses}
                    groupBadgeClasses={groupBadgeClasses}
                    onSelect={(b) => {
                        setEvent({...event, badge_class_id: b.id})
                        setBadgeClass(b)
                    }}
                />
            })
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

export interface DialogSelectedBadgeProps {
    groupBadgeClasses: Solar.BadgeClass[]
    profileBadgeClasses: Solar.BadgeClass[]
    onSelect?: (badgeClass: Solar.BadgeClass) => void
    lang: Dictionary,
    close?: () => void
}

export function DialogSelectedBadge(props: DialogSelectedBadgeProps) {
    return <div className="w-[360px] rounded-lg shadow p-4 bg-[#f8f9f8]">
        <div className="mb-2 bg-[rgba(236,238,250,.2)] border-white border-2 rounded-lg p-3">
            <div className="font-semibold mb-1">{props.lang['Choose a badge from you created']}</div>
            <div className="flex-row-item-center overflow-y-hidden overflow-x-scroll">
                {props.profileBadgeClasses.map(b => {
                    return <div onClick={() => {{props.onSelect?.(b);props.close?.()}}}
                        className="flex-shrink-0 flex-grow-0 mr-2 cursor-pointer w-16 h-16 rounded-lg bg-[#ecf2ee] flex-row-item-center justify-center"
                        key={b.id}>
                        <img className="w-[50px] h-[50px] rounded-full" src={b.image_url!} alt=""/>
                    </div>
                })}
            </div>
        </div>

        { !!props.groupBadgeClasses.length &&
            <div className="mb-2 bg-[rgba(236,238,250,.2)] border-white border-2 rounded-lg p-3">
                <div className="font-semibold mb-1">{props.lang['Choose a badge from group']}</div>
                <div className="flex-row-item-center overflow-y-hidden overflow-x-scroll">
                    {props.groupBadgeClasses.map(b => {
                        return <div onClick={() => {props.onSelect?.(b);props.close?.()}}
                            className="flex-shrink-0 flex-grow-0 mr-2 cursor-pointer w-16 h-16 rounded-lg bg-[#ecf2ee] flex-row-item-center justify-center"
                            key={b.id}>
                            <img className="w-[50px] h-[50px] rounded-full" src={b.image_url!} alt=""/>
                        </div>
                    })}
                </div>
            </div>
        }

        <div className="select-none cursor-pointer hover:opacity-80 active:brightness-95 h-[70px] border-white border-2 rounded-lg bg-[rgba(236,238,250,.2)] mt-4 flex-row-item-center justify-center">
            <img className="w-[32px] h-[32px] mr-2" src="/images/create_badge_icon.png" alt=""/>
            <div className="text-lg font-semibold">Create a new badge</div>
        </div>

        <div className="flex-row-item-center justify-center mt-2">
            <i onClick={props.close}
                className="cursor-pointer uil-times-circle text-3xl text-foreground opacity-60 hover:opacity-80" />
        </div>
    </div>
}
