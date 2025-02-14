'use client'

import {GroupDetail, updateGroup} from '@sola/sdk'
import {Dictionary} from '@/lang'
import {Button} from '@/components/shadcn/Button'
import {useState} from 'react'
import {getAuth} from '@/utils'
import {CLIENT_MODE} from '@/app/config'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'

export default function ({lang, groupDetail}: {groupDetail: GroupDetail, lang: Dictionary}) {
    const [draft, setDraft] = useState(groupDetail)

    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const handleSave = async () => {
        const loading = showLoading()
        try {
            const authToken = getAuth()
            await updateGroup({
                params: {
                    group: draft,
                    authToken: authToken!
                },
                clientMode: CLIENT_MODE
            })
            toast({title: lang['Save successful'], variant: 'success'})
        } catch (e: unknown) {
            console.error(e)
            toast({
                description: e instanceof Error ? e.message : lang['Save failed'],
                variant: 'destructive'
            })
        } finally {
            closeModal(loading)
        }
    }

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width-md min-h-[calc(100svh-48px) px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Event Permission']}</div>


            <div className="font-semibold mb-1">{lang['Who can create events']}</div>
            <Button variant={'secondary'}
                    className='w-full mb-3'
                    onClick={() => setDraft({...draft, can_publish_event: 'all'})}>
                <div className="flex-row-item-center justify-between w-full">
                    <div className='font-normal'>Everyone</div>
                    {(draft.can_publish_event === 'all' || !draft.can_publish_event)
                        ? <i className="uil-check-circle text-green-400 text-2xl"/>
                        : <i className="uil-circle text-gray-500 text-2xl"/>
                    }
                </div>
            </Button>
            <Button variant={'secondary'}
                    className='w-full mb-3'
                    onClick={() => setDraft({...draft, can_publish_event: 'member'})}>
                <div className="flex-row-item-center justify-between w-full">
                    <div className='font-normal'>Member, Manager, Owner</div>
                    {(draft.can_publish_event === 'member')
                        ? <i className="uil-check-circle text-green-400 text-2xl"/>
                        : <i className="uil-circle text-gray-500 text-2xl"/>
                    }
                </div>
            </Button>
            <Button variant={'secondary'} className='w-full mb-3'
                    onClick={() => setDraft({...draft, can_publish_event: 'manager'})}>
                <div className="flex-row-item-center justify-between w-full">
                    <div className='font-normal'>Manager, Owner</div>
                    {(draft.can_publish_event === 'manager')
                        ? <i className="uil-check-circle text-green-400 text-2xl"/>
                        : <i className="uil-circle text-gray-500 text-2xl"/>
                    }
                </div>
            </Button>

            <div className="font-semibold mb-1 mt-4">{lang['Who can join events']}</div>
            <Button variant={'secondary'} className='w-full mb-3'
                    onClick={() => setDraft({...draft, can_join_event: 'all'})}>
                <div className="flex-row-item-center justify-between w-full">
                    <div className='font-normal'>Everyone</div>
                    {(draft.can_join_event === 'all' || !draft.can_join_event)
                        ? <i className="uil-check-circle text-green-400 text-2xl"/>
                        : <i className="uil-circle text-gray-500 text-2xl"/>
                    }
                </div>
            </Button>
            <Button variant={'secondary'} className='w-full mb-3'
                    onClick={() => setDraft({...draft, can_join_event: 'member'})}>
                <div className="flex-row-item-center justify-between w-full">
                    <div className='font-normal'>Member, Manager, Owner</div>
                    {(draft.can_join_event === 'member')
                        ? <i className="uil-check-circle text-green-400 text-2xl"/>
                        : <i className="uil-circle text-gray-500 text-2xl"/>
                    }
                </div>
            </Button>
            <Button variant={'secondary'} className='w-full mb-3'
                    onClick={() => setDraft({...draft, can_join_event: 'manager'})}>
                <div className="flex-row-item-center justify-between w-full">
                    <div className='font-normal'>Manager, Owner</div>
                    {(draft.can_join_event === 'manager')
                        ? <i className="uil-check-circle text-green-400 text-2xl"/>
                        : <i className="uil-circle text-gray-500 text-2xl"/>
                    }
                </div>
            </Button>

            <div className="font-semibold mb-1 mt-4">{lang['Who can view events']}</div>
            <Button variant={'secondary'} className='w-full mb-3'
                    onClick={() => setDraft({...draft, can_view_event: 'all'})}>
                <div className="flex-row-item-center justify-between w-full">
                    <div className='font-normal'>Everyone</div>
                    {(draft.can_view_event === 'all' || !draft.can_view_event)
                        ? <i className="uil-check-circle text-green-400 text-2xl"/>
                        : <i className="uil-circle text-gray-500 text-2xl"/>
                    }
                </div>
            </Button>
            <Button variant={'secondary'} className='w-full mb-3'
                    onClick={() => setDraft({...draft, can_view_event: 'member'})}>
                <div className="flex-row-item-center justify-between w-full">
                    <div className='font-normal'>Member, Manager, Owner</div>
                    {(draft.can_view_event === 'member')
                        ? <i className="uil-check-circle text-green-400 text-2xl"/>
                        : <i className="uil-circle text-gray-500 text-2xl"/>
                    }
                </div>
            </Button>
            <Button variant={'secondary'} className='w-full mb-3'>
                <div className="flex-row-item-center justify-between w-full"
                        onClick={() => setDraft({...draft, can_view_event: 'manager'})}>
                    <div className='font-normal'>Manager, Owner</div>
                    {(draft.can_view_event === 'manager')
                        ? <i className="uil-check-circle text-green-400 text-2xl"/>
                        : <i className="uil-circle text-gray-500 text-2xl"/>
                    }
                </div>
            </Button>

            <div className="grid-cols-2 grid gap-3 mt-6 flex-row-item-center justify-center w-full mx-auto">
                <Button variant={'secondary'} className="w-full"
                        onClick={() => {
                            history.go(-1)
                        }}
                >{lang['Back']}</Button>
                <Button variant={'primary'} className="w-full"
                        onClick={handleSave}
                >{lang['Save']}</Button>
            </div>
        </div>
    </div>
}