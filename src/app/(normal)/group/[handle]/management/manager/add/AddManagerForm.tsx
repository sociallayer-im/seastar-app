'use client'

import Avatar from '@/components/Avatar'
import {displayProfileName, getAuth} from '@/utils'
import {useState} from 'react'
import {Membership, Group, addManager} from '@sola/sdk'
import {Dictionary} from '@/lang'
import NoData from '@/components/NoData'
import {Button} from '@/components/shadcn/Button'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import useModal from '@/components/client/Modal/useModal'

interface AddManagerFormProps {
    lang: Dictionary
    members: Membership[]
    group: Group
}

export default function AddManagerForm({lang, members, group}: AddManagerFormProps) {
    const [selected, setSelected] = useState<Membership[]>([])

    const {showConfirmDialog} = useConfirmDialog()
    const {toast} = useToast()
    const {showLoading, closeModal} = useModal()

    const handleSelect = (member: Membership) => {
        if (selected.includes(member)) {
            setSelected(selected.filter(m => m !== member))
        } else {
            setSelected([...selected, member])
        }
    }

    const handleConfirm = async () => {
        const loading = showLoading()
        try {
            const authToken = getAuth()
            if (!authToken) {
                closeModal(loading)
                toast({
                    description: 'You are not logged in',
                    variant: 'destructive'
                })
                return
            }

            await addManager(selected[0]!.profile.id, group.id, authToken)
            history.go(-1)
        } catch (e: unknown) {
            console.error(e)
            closeModal(loading)
            toast({
                description: e instanceof Error ? e.message : 'An error occurred',
                variant: 'destructive'
            })
        }
    }

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width h-[calc(100svh-48px)] px-3 pb-12 pt-0 flex flex-col">
            <div className="py-6 font-semibold text-center text-xl">{lang['Add a manager']}</div>
            <div className="w-full max-w-[800px] mx-auto mb-3">{lang['Selected a member in group']}</div>
            <div className="w-full max-w-[800px] mx-auto">
                {members.map((member, i) => {
                    return <div key={i}
                                onClick={() => {
                                    handleSelect(member)
                                }}
                                className="mb-3 justify-between cursor-pointer flex-row-item-center shadow rounded-lg px-6 h-[60px] duration-300 hover:bg-secondary">
                        <div className='flex-row-item-center'>
                            <Avatar
                                size={28}
                                profile={member.profile}
                                className="rounded-full mr-2"/>
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

            {!members.length && <NoData/>}

            <div className="w-full max-w-[800px] mx-auto grid grid-cols-2 gap-3 py-4 sticky bottom-0">
                <Button variant={'secondary'} onClick={() => {
                    history.go(-1)
                }}>{lang['Cancel']}</Button>
                <Button variant={'primary'}
                        disabled={!selected.length}
                        onClick={handleConfirm}
                >{lang['Add']}</Button>
            </div>
        </div>
    </div>
}