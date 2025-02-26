'use client'

import {Input} from "@/components/shadcn/Input"
import {Button} from "@/components/shadcn/Button"
import {Dictionary} from "@/lang"
import {useEffect, useState} from 'react'
import DatePicker from '@/components/client/DatePicker'
import Dayjs from '@/libs/dayjs'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {getAuth} from '@/utils'
import {CouponDraft, setCoupon} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'

export default function PromoCodeForm({lang, eventId}: { lang: Dictionary, eventId: number }) {
    const {toast} = useToast()
    const {showLoading, closeModal} = useModal()

    const [draft, setDraft] = useState({
        discount: 0,
        times: 1,
        validDate: '',
        discountType: 'ratio',
        label: '',
        eventId
    })

    useEffect(() => {
        console.log('draft', draft)
    }, [draft])

    const handleCreate = async () => {
        const loading = showLoading()
        try {
            const authToken = getAuth()
            await setCoupon({
                params: {...draft, authToken: authToken!} as CouponDraft,
                clientMode: CLIENT_MODE
            })
            toast({title: lang['Create Successfully'], variant: 'success'})
            setTimeout(() => {
                window.history.go(-1)
            }, 2000)
        } catch (e: unknown) {
            console.error(e)
            toast({
                description: e instanceof Error ? e.message : lang['Create failed'],
                variant: 'destructive'
            })
        } finally {
            closeModal(loading)
        }
    }

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width-md min-h-[calc(100svh-48px) px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Generate Promo Code']}</div>

            <div className="mb-4">
                <div onClick={() => {
                    setDraft({...draft, discountType: 'ratio'})
                }}
                     className={`border cursor-pointer p-2  rounded-lg mt-2 h-auto border-gray-200 w-full text-left`}>
                    <div className="flex-1 flex-row-item-center justify-between">
                        <div className="font-semibold">{lang['Percentage Off']}</div>
                        {draft.discountType === 'ratio'
                            ?
                            <i className="flex-shrink-0 ml-2 uil-check-circle text-2xl text-green-500"/>
                            :
                            <i className="flex-shrink-0 ml-2 uil-circle text-2xl text-gray-500"/>
                        }
                    </div>
                    {draft.discountType === 'ratio' &&
                        <Input
                            onWheel={(e) => e.currentTarget.blur()}
                            type="number"
                            placeholder={lang['Input discount']}
                            className="w-full mt-3"
                            value={draft.discount || ''}
                            onChange={e => {
                                setDraft({...draft, discount: Number(e.target.value)})
                            }}
                            endAdornment={'% OFF'}
                        />
                    }
                </div>
                <div onClick={() => {
                    setDraft({...draft, discountType: 'amount'})
                }}
                     className={`border cursor-pointer p-2  rounded-lg mt-2 h-auto border-gray-200 w-full text-left `}>
                    <div className="flex-1 flex-row-item-center justify-between">
                        <div className="font-semibold">{lang['Amount Off']}</div>
                        {draft.discountType === 'amount'
                            ?
                            <i className="flex-shrink-0 ml-2 uil-check-circle text-2xl text-green-500"/>
                            :
                            <i className="flex-shrink-0 ml-2 uil-circle text-2xl text-gray-500"/>
                        }

                    </div>
                    {draft.discountType === 'amount' &&
                        <Input
                            type="number"
                            placeholder={lang['Input discount']}
                            onWheel={(e) => e.currentTarget.blur()}
                            className="w-full mt-3"
                            value={draft.discount || ''}
                            onChange={e => {
                                setDraft({...draft, discount: Number(e.target.value)})
                            }}
                            endAdornment={'USD OFF'}
                        />
                    }
                </div>
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Can be used']}</div>
                <Input className="w-full"
                       value={draft.times || ''}
                       type={'number'}
                       placeholder={lang['Unlimited']}
                       onChange={e => {
                           setDraft({...draft, times: Number(e.target.value)})
                       }}
                       inputMode="none"
                       onWheel={(e) => e.currentTarget.blur()}
                       endAdornment={lang['Times']}/>
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Description (Optional)']}</div>
                <Input className="w-full"
                       value={draft.label || ''}
                       onChange={e => {
                           setDraft({...draft, label: e.target.value})
                       }}/>
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Valid Date']}</div>
                <DatePicker initDate={Dayjs().format('YYYY/MM/DD')}
                            onChange={e => {
                                const time = Dayjs(e).endOf('day').toDate().toISOString()
                                setDraft({
                                    ...draft,
                                    validDate: time
                                })
                            }}
                >
                    <Input
                        readOnly
                        value={draft.validDate ? Dayjs(new Date(draft.validDate).getTime()).format('YYYY/MM/DD') : ''}
                        endAdornment={<i className="uil-times-circle text-lg cursor-pointer" onClick={() => {
                            setDraft({
                                ...draft,
                                validDate: ''
                            })
                        }}/>}
                        startAdornment={<i className="uil-calender"/>}
                        className="w-full" placeholder={"YYYY/MM/DD"}/>
                </DatePicker>
            </div>

            <div className="mt-6 flex-row-item-center justify-center">
                <Button variant={'secondary'}
                        onClick={() => window.history.go(-1)}
                        className="mr-3 flex-1">
                    {lang['Back']}
                </Button>
                <Button variant={'primary'}
                        onClick={handleCreate}
                        className="mr-3 flex-1">{lang['Generate']}</Button>
            </div>
        </div>
    </div>
}