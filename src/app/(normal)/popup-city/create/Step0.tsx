'use client'

import {PopupCityDraft, GroupDetail, Group} from '@sola/sdk'
import {Dictionary} from '@/lang'
import DropdownMenu from '@/components/client/DropdownMenu'
import {displayProfileName} from '@/utils'
import Avatar from '@/components/Avatar'
import {Input} from '@/components/shadcn/Input'
import {Button} from '@/components/shadcn/Button'
import {useMemo} from 'react'

export interface CreatePopupCityStepProps {
    popupCityState: [PopupCityDraft, (draft: PopupCityDraft) => void]
    groupDetailState?: [GroupDetail, (groupDetail: GroupDetail) => void]
    availableGroups?: Group[]
    lang: Dictionary,
    onBack: () => void
    onNext: () => void
}

export default function Step0({availableGroups, popupCityState, lang, onNext}: CreatePopupCityStepProps) {
    const groupOpts = useMemo(() => {
        return [
            {
                nickname: lang['Create a Group'],
                id: 0
            } as Group,
            ...(availableGroups || [])
        ]
    }, [availableGroups])

    const selectedGroup = useMemo(() => {
        return groupOpts.find(g => g.id === popupCityState[0].group_id)
    }, [popupCityState[0], groupOpts])

    return  <div className="w-full max-w-[500px] mx-auto p-4">
        <div className="font-semibold text-2xl">{lang['Select a group']}</div>
        <div className="mt-1 text-secondary-foreground">{lang['Use this group as a community']}</div>
        <div className="my-4">
            <DropdownMenu
                className="w-full"
                valueKey="id"
                options={groupOpts}
                value={selectedGroup ? [selectedGroup] : undefined}
                renderOption={(group) => {
                    return <div className="flex-row-item-center">
                        {group.id === 0
                            ? <>
                                <i className="uil-plus-circle text-2xl mr-2"/>
                                <div className="font-semibold">{displayProfileName(group)}</div>
                            </>
                            : <>
                                <Avatar profile={group} size={26} className="mr-2"/>
                                <div>{displayProfileName(group)}</div>
                            </>
                        }
                    </div>
                }}
                onSelect={(group) => {
                    if (group[0].id === 0) {
                        location.href = '/group/create?create-popup-city=1'
                    } else {
                        popupCityState[1]({
                            ...popupCityState[0],
                            group_id: group[0].id
                        })
                    }
                }}>
                <Input placeholder={lang['Select a group']}
                       className="w-full"
                       readOnly={true}
                       startAdornment={selectedGroup ?
                           <Avatar profile={selectedGroup} size={26}/> : undefined}
                       value={selectedGroup ? displayProfileName(selectedGroup) : ''}
                       endAdornment={<i className="uil-angle-down text-lg"/>}
                />
            </DropdownMenu>

            <div className="flex-row-item-center mt-4">
                <Button
                    disabled={!popupCityState[0].group_id}
                    onClick={onNext}
                    variant={'primary'}
                    className="w-full">
                    {lang['Next']}
                </Button>
            </div>
        </div>
    </div>
}