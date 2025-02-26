'use client'

import {Membership, Group, removeMember} from "@sola/sdk"
import {Dictionary} from "@/lang"
import {displayProfileName, getAuth} from "@/utils"
import {useState} from "react"
import {Button} from "@/components/shadcn/Button"
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import NoData from '@/components/NoData'
import Avatar from '@/components/Avatar'
import {CLIENT_MODE} from '@/app/config'

export interface MemberManagementFormProps {
    members: Membership[],
    group: Group,
    lang: Dictionary
}

export default function MemberManagementForm({members, lang, group}: MemberManagementFormProps) {
    const memberList = members.filter(m => m.role !== 'owner')
    const [selected, setSelected] = useState<Membership[]>([])
    const {closeModal, showLoading} = useModal()
    const {showConfirmDialog} = useConfirmDialog()
    const {toast} = useToast()

    const handleSelect = (member: Membership) => {
        if (selected.includes(member)) {
            setSelected(selected.filter(m => m !== member))
        } else {
            setSelected([...selected, member])
        }
    }

    const handleRemove = async () => {
        if (!selected.length) return

        const loading = showLoading()
        try {
            const auth_token = getAuth()
            if (!auth_token) {
                toast({title: 'Please login first', variant: 'destructive'})
                return
            }
            await removeMember({
                params: {
                    profileId:selected[0]!.profile.id,
                    groupId: group.id,
                    authToken: auth_token
                }, clientMode: CLIENT_MODE
            })
            window.location.reload()
        } catch (e) {
            closeModal(loading)
            toast({title: 'Failed to remove member', variant: 'destructive'})
        }
    }

    const handleConfirm = () => {
        showConfirmDialog({
            lang,
            title: lang['Remove Member'],
            content: `${lang['Are you sure you want to remove the selected member?']} <div style="text-align: center;font-size: 18px"><b>${displayProfileName(selected[0]!.profile)}</b></div>`,
            onConfig: handleRemove,
        })
    }


    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width h-[calc(100svh-48px)] px-3 pb-12 pt-0 flex flex-col">
            <div className="py-6 font-semibold text-center text-xl">{lang['Member Management']}</div>
            <div className="w-full max-w-[800px] mx-auto mb-3">{lang['Remove selected members']}</div>
            <div className="w-full max-w-[800px] mx-auto">
                {memberList.map((member, i) => {
                    return <div key={i}
                                onClick={() => {
                                    handleSelect(member)
                                }}
                                className="mb-3 justify-between cursor-pointer flex-row-item-center shadow rounded-lg px-6 h-[60px] duration-300 hover:bg-secondary">
                        <div className='flex-row-item-center'>
                            <Avatar
                                size={28}
                                profile={member.profile}
                                className="rounded-full mr-2" />
                            <div>{displayProfileName(member.profile)}</div>
                        </div>
                        {
                            selected.includes(member) &&
                            <i className="uil-check-circle text-2xl text-green-500"></i>
                        }
                    </div>
                })
                }
            </div>

            {!memberList.length && <NoData/>}

            <div className="w-full max-w-[800px] mx-auto grid grid-cols-2 gap-3 py-4 sticky bottom-0">
                <Button variant={'secondary'} onClick={() => {
                    history.go(-1)
                }}>{lang['Cancel']}</Button>
                <Button variant={'destructive'}
                        disabled={!selected.length}
                        onClick={handleConfirm}
                >{lang['Remove Member']}</Button>
            </div>
        </div>
    </div>
}