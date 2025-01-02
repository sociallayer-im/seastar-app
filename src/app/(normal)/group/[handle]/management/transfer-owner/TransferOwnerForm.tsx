'use client'

import {MemberShipSample} from "@/app/(normal)/group/[handle]/edit/data"
import {Dictionary} from "@/lang"
import {getAvatar} from "@/utils"
import {useState} from "react"
import {Button} from "@/components/shadcn/Button"

export interface MemberManagementFormProps {
    members: MemberShipSample[],
    group: Solar.Group,
    lang: Dictionary
}

export default function TransferOwnerForm({members, lang}: MemberManagementFormProps) {
    const memberList = members.filter(m => m.role !== 'owner')
    const [selected, setSelected] = useState<MemberShipSample | null>(null)

    const handleSelect = (member: MemberShipSample) => {
        if (selected === member) {
            setSelected(null)
        } else {
            setSelected(member)
        }
    }

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width h-[calc(100svh-48px)] px-3 pb-12 pt-0 flex flex-col">
            <div className="py-6 font-semibold text-center text-xl">{lang['Transfer Owner']}</div>
            <div className="w-full max-w-[800px] mx-auto mb-3">{lang['Select a recipient from the members']}</div>
            <div className="w-full max-w-[800px] mx-auto">
                {memberList.map((member, i) => {
                    return <div key={i}
                        onClick={() => { handleSelect(member) }}
                        className="mb-3 justify-between cursor-pointer flex-row-item-center shadow rounded-lg px-6 h-[60px] duration-300 hover:bg-secondary">
                        <div className='flex-row-item-center'>
                            <img
                                className="w-7 h-7 rounded-full mr-2"
                                src={getAvatar(member.profile.id, member.profile.image_url)} alt=""/>
                            <div>{member.profile.nickname || member.profile.handle}</div>
                        </div>
                        {
                            selected?.profile.handle === member.profile.handle &&
                            <i className="uil-check-circle text-2xl text-green-500"></i>
                        }
                    </div>
                })
                }
            </div>

            <div className="w-full max-w-[800px] mx-auto grid grid-cols-2 gap-3 py-4 sticky bottom-0">
                <Button variant={'secondary'} onClick={() => {
                    history.go(-1)
                }}>{lang['Cancel']}</Button>
                <Button variant={'destructive'}>{lang['Transfer Owner']}</Button>
            </div>
        </div>
    </div>
}