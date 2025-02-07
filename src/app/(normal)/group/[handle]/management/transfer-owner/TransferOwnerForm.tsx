'use client'

import {Dictionary} from "@/lang"
import {getAuth, getAvatar} from "@/utils"
import {useState} from "react"
import {Button} from "@/components/shadcn/Button"
import {Membership, Group, transferGroup} from '@sola/sdk'
import NoData from '@/components/NoData'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {CLIENT_MODE} from '@/app/config'

export interface MemberManagementFormProps {
    members: Membership[],
    group: Group,
    lang: Dictionary
}

export default function TransferOwnerForm({members, lang, group}: MemberManagementFormProps) {
    const memberList = members.filter(m => m.role !== 'owner')
    const [selected, setSelected] = useState<Membership | null>(null)
    const {showConfirmDialog} = useConfirmDialog()
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const handleSelect = (member: Membership) => {
        if (selected === member) {
            setSelected(null)
        } else {
            setSelected(member)
        }
    }

    const handleTransferOwner = async () => {
        const loading = showLoading()
        try {
            const authToken = getAuth()
            if (!authToken) {
                closeModal(loading)
                toast({title: 'Please log in first', variant: 'destructive'})
                return
            }

            await transferGroup({
                params: {
                    groupId: group.id,
                    newOwnerHandle: selected!.profile.handle,
                    authToken
                },
                clientMode: CLIENT_MODE
            })
            window.location.href = `/group/${group.handle}`
        } catch (e: unknown) {
            console.error(e)
            closeModal(loading)
            toast({
                description: e instanceof Error ? e.message : 'An error occurred',
                variant: 'destructive'
            })
        }
    }

    const showConfirm = () => {
        showConfirmDialog({
            lang,
            title: lang['Transfer Owner'],
            content: lang['Are you sure you want to transfer the ownership of this group to this member?'],
            onConfig: handleTransferOwner
        })
    }

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width h-[calc(100svh-48px)] px-3 pb-12 pt-0 flex flex-col">
            <div className="py-6 font-semibold text-center text-xl">{lang['Transfer Owner']}</div>
            <div className="w-full max-w-[800px] mx-auto mb-3">{lang['Select a recipient from the members']}</div>
            <div className="w-full max-w-[800px] mx-auto">
                {memberList.map((member, i) => {
                    return <div key={i}
                                onClick={() => {
                                    handleSelect(member)
                                }}
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

            {!memberList.length && <NoData/>}

            <div className="w-full max-w-[800px] mx-auto grid grid-cols-2 gap-3 py-4 sticky bottom-0">
                <Button variant={'secondary'} onClick={() => {
                    history.go(-1)
                }}>{lang['Cancel']}</Button>
                <Button variant={'destructive'}
                        onClick={showConfirm}>
                    {lang['Transfer Owner']}
                </Button>
            </div>
        </div>
    </div>
}