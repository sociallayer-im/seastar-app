import {Dictionary} from "@/lang"
import useModal from "@/components/client/Modal/useModal"
import Image from 'next/image'
import {BadgeClass, Group} from '@sola/sdk'

export interface DialogSelectedBadgeProps {
    groupBadgeClasses: BadgeClass[]
    profileBadgeClasses: BadgeClass[]
    lang: Dictionary,
    toProfileHandle?: string
    onSelect?: (badgeClass: BadgeClass) => void
    close?: () => void
    returnPage?: string
    group?: Group
}

export default function useSelectBadgeClass() {
    const {openModal} = useModal()

    const selectBadgeClass = (
        {lang, profileBadgeClasses, groupBadgeClasses, onSelect, toProfileHandle, group}: DialogSelectedBadgeProps
    ) => {
        openModal({
            content: (close) => <DialogSelectedBadge
                lang={lang}
                close={close}
                toProfileHandle={toProfileHandle}
                profileBadgeClasses={profileBadgeClasses}
                group={group}
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
    groupBadgeClasses: BadgeClass[]
    profileBadgeClasses:BadgeClass[]
    lang: Dictionary,
    toProfileHandle?: string
    onSelect?: (badgeClass: BadgeClass) => void
    close?: () => void
    returnPage?: string
    group?: Group
}

export function DialogSelectedBadge({lang, close, toProfileHandle, group, ...props}: DialogSelectedBadgeProps) {
    const {openModal} = useModal()

    const handleShowBadgeType = () => {
        openModal({
            content: (close) => <SelectedBadgeType
                lang={lang}
                group={group}
                close={close}
                toProfileHandle={toProfileHandle}
                returnPage={props.returnPage}/>
        })
        close?.()
    }

    return <div className="w-[360px] rounded-lg shadow p-4" style={{background: '#f8f9f8'}}>
        {!!props.profileBadgeClasses.length &&
            <div className="mb-2  border-white border-2 rounded-lg p-3" style={{background: 'rgba(236,238,250,.2)'}}>
                <div className="font-semibold mb-2">{lang['Choose a badge from you created']}</div>
                <div className="flex-row-item-center overflow-y-hidden overflow-x-scroll py-2">
                    {props.profileBadgeClasses.map(b => {
                        return <div onClick={() => {
                            {
                                props.onSelect?.(b);
                                close?.()
                            }
                        }}
                                    className="flex-shrink-0 flex-grow-0 mr-2 cursor-pointer w-16 h-16 rounded-lg bg-[#ecf2ee] flex-row-item-center justify-center"
                                    key={b.id}>
                            <Image src={b.image_url!} width={50} height={50} alt="" className="rounded-full"/>
                        </div>
                    })}
                </div>
            </div>
        }

        {!!props.groupBadgeClasses.length &&
            <div className="mb-2 bg-[rgba(236,238,250,.2)] border-white border-2 rounded-lg p-3"
                 style={{background: 'rgba(236,238,250,.2)'}}
            >
                <div className="font-semibold mb-2">{lang['Choose a badge from group']}</div>
                <div className="flex-row-item-center overflow-y-hidden overflow-x-scroll">
                    {props.groupBadgeClasses.map(b => {
                        return <div onClick={() => {
                            props.onSelect?.(b);
                            close?.()
                        }}
                                    className="flex-shrink-0 flex-grow-0 mr-2 cursor-pointer w-16 h-16 rounded-lg bg-[#ecf2ee] flex-row-item-center justify-center"
                                    key={b.id}>
                            <Image src={b.image_url!} width={50} height={50} alt="" className="rounded-full"/>
                        </div>
                    })}
                </div>
            </div>
        }

        <div onClick={handleShowBadgeType}
            style={{background: 'rgba(236,238,250,.2)', height: '70px'}}
             className="select-none cursor-pointer hover:opacity-80 active:brightness-95 border-white border-2 rounded-lg  mt-4 flex-row-item-center justify-center">
            <img className="w-[32px] h-[32px] mr-2" src="/images/create_badge_icon.png" alt=""/>
            <div className="text-lg font-semibold">{lang['Create a new badge']}</div>
        </div>

        <div className="flex-row-item-center justify-center mt-2">
            <i onClick={close}
               className="cursor-pointer uil-times-circle text-3xl text-foreground opacity-60 hover:opacity-80"/>
        </div>
    </div>
}

function SelectedBadgeType({lang, returnPage, toProfileHandle, close, group}: {
    lang: Dictionary,
    permissions?: string[],
    toProfileHandle?: string,
    returnPage?: string,
    group?: Group,
    close?: () => void
}) {
    let searchParams = returnPage ? `&return=${returnPage}` : ''
    if (toProfileHandle) {
        searchParams += `&to=${toProfileHandle}`
    }
    if (group) {
        searchParams += `&group=${group.id}`
    }
    const createBaseBadgePage = `/badge-class/create?badge_type=badge${searchParams}`
    const createPrivacyBadgePage = `/badge-class/create?badge_type=private${searchParams}`

    return <div className="w-[360px] rounded-lg shadow p-4 grid grid-cols-1 gap-3" style={{background: '#f8f9f8'}}>
        <a href={createBaseBadgePage}
           className="border-white border-2 rounded-lg p-3 flex-row-item-center"
           style={{background: 'rgba(236,238,250,.2)'}}>
            <img className="w-12 h-12 mr-2" src="/images/badge_type/basic.png" alt=""/>
            <div>
                <div className="font-semibold">{lang['Basic Badge']}</div>
                <div className="text-xs text-gray-500">{lang['Basic badge, evaluation of others']}</div>
            </div>
        </a>
        <a href={createPrivacyBadgePage}
           className="border-white border-2 rounded-lg p-3 flex-row-item-center"
           style={{background: 'rgba(236,238,250,.2)'}}>
            <img className="w-12 h-12 mr-2" src="/images/badge_type/private.png" alt=""/>
            <div>
                <div className="font-semibold">{lang['Privacy Badge']}</div>
                <div className="text-xs text-gray-500">{lang['Only receivers can see the badge detail']}</div>
            </div>
        </a>

        <div className="flex-row-item-center justify-center mt-2">
            <i onClick={close}
               className="cursor-pointer uil-times-circle text-3xl text-foreground opacity-60 hover:opacity-80"/>
        </div>
    </div>
}