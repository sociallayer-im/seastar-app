import {Dictionary} from "@/lang"
import useModal from "@/components/client/Modal/useModal"

export default function useSelectBadgeClass() {
    const {openModal} = useModal()

    const selectBadgeClass = (
        lang: Dictionary, 
        profileBadgeClasses: Solar.BadgeClass[], 
        groupBadgeClasses: Solar.BadgeClass[],
        onSelect?: (badgeClass: Solar.BadgeClass) => void
    ) => {
        openModal({
            content: (close) => <DialogSelectedBadge
                lang={lang}
                close={close}
                profileBadgeClasses={profileBadgeClasses}
                groupBadgeClasses={groupBadgeClasses}
                onSelect={(b) => {
                    !!onSelect && onSelect(b)
                }}
            />
        })
    }
    
    return {
        selectBadgeClass
    }
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