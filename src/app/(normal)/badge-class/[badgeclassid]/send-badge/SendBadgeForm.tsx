'use client'

import {Dictionary} from "@/lang"
import {Button} from "@/components/shadcn/Button"
import {Checkbox} from "@/components/shadcn/Checkbox"
import {useEffect, useState} from "react"
import ProfileInput from "@/components/client/ProfileInput"
import {Input} from "@/components/shadcn/Input"
import {Textarea} from "@/components/shadcn/Textarea"
import {BadgeClassDetail, Profile, sendAccountVoucher, sendCodeVoucher} from '@sola/sdk'
import {getAuth} from '@/utils'
import useModal from '@/components/client/Modal/useModal'
import {CLIENT_MODE} from '@/app/config'

export interface SendBadgeFormProps {
    badgeClass: BadgeClassDetail
    lang: Dictionary,
    isPrivate: boolean
    toProfile?: Profile
}

export default function SendBadgeForm({badgeClass, lang, toProfile, isPrivate}: SendBadgeFormProps) {
    const {showLoading, closeModal} = useModal()

    const [isCodeVoucher, setIsCodeVoucher] = useState(!toProfile && !isPrivate)
    const [receivers, setReceivers] = useState<Profile[]>(toProfile ? [toProfile] : [])
    const [counter, setCounter] = useState('')
    const [reason, setReason] = useState(badgeClass.content || '')
    const [error, setError] = useState('')

    useEffect(() => {
        setError('')
    }, [isCodeVoucher])

    const handleSendCodeVoucher = async () => {
        if (!!counter && Number(counter) <= 0) {
            setError('Please enter a valid amount')
            return
        }

        const authToken = getAuth()
        const voucher = await sendCodeVoucher({
            params: {
                authToken: authToken!,
                amount: counter ? Number(counter) : undefined,
                badgeClassId: badgeClass.id,
                message: reason
            },
            clientMode: CLIENT_MODE
        })
        location.href = `/voucher/${voucher.id}/share`
    }

    const handleSendAccountVoucher = async () => {
        if (!receivers.length) {
            setError('Please enter receivers')
            return
        }

        const authToken = getAuth()
        const vouchers = await sendAccountVoucher({
            params: {
                authToken: authToken!,
                badgeClassId: badgeClass.id,
                message: reason,
                receivers: receivers.map(item => item.handle || item.nickname) as string[]
            }, clientMode: CLIENT_MODE
        })
        location.href = `/voucher/${vouchers[0].id}/share`
    }

    const handleSend = async () => {
        const loading = showLoading()
        try {
            if (isCodeVoucher) {
                await handleSendCodeVoucher()
            } else {
                await handleSendAccountVoucher()
            }
        } catch (e: unknown) {
            console.error('[handleSend]: ', e)
            setError((e as Error).message || 'Send fail')
        } finally {
            closeModal(loading)
        }
    }

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width min-h-[calc(100svh-48px)] px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Send Badge']}</div>

            {isPrivate &&
                <div className="max-w-[500px] text-sm mx-auto p-2 bg-amber-50 text-amber-500 mb-2">
                    <i className="uil-info-circle text-lg mr-2"/>
                    <b>{lang['Privacy Badge']}</b>: {lang['Only receivers can see the badge detail']}
                </div>
            }

            <div className="flex flex-col max-w-[500px] mx-auto">
                <div className="mb-8 rounded-lg h-[200px] bg-secondary flex flex-col justify-center items-center">
                    <img src={badgeClass.image_url!}
                         className="w-24 h-24 rounded-full mb-2 border-2 border-white shadow" alt=""/>
                    <div className="font-semibold">{badgeClass.title}</div>
                </div>
            </div>

            <div className="flex flex-col max-w-[500px] mx-auto mb-8">
                <div className="font-semibold mb-1">{lang['Reason (Optional)']}</div>
                <Textarea value={reason}
                          placeholder={lang['Reason (Optional)']}
                          onChange={e => setReason(e.target.value)}/>
            </div>

            <div className="flex flex-col max-w-[500px] mx-auto rounded-lg">
                {!isPrivate &&
                    <div className={`${isCodeVoucher ? 'border' : ''} p-3 rounded-lg`}>
                        <div className="flex-row-item-center justify-between">
                            <div className="font-semibold">{lang['Badge amount']}</div>
                            <Checkbox checked={isCodeVoucher}
                                      className="mr-1"
                                      onClick={() => setIsCodeVoucher(true)}/>
                        </div>
                        <div className="max-h-0 overflow-auto mt-3"
                             style={isCodeVoucher ? {maxHeight: 'initial'} : undefined}>
                            <Input
                                placeholder={'Unlimited'}
                                type="number"
                                onWheel={(e) => e.currentTarget.blur()}
                                className="w-full"
                                value={counter}
                                onChange={e => setCounter(e.target.value)}
                            />
                            <div
                                className="my-2 text-sm text-gray-500">{lang['Leave empty to set the quantity as unlimited']}</div>
                        </div>
                    </div>
                }

                <div className={`${!isCodeVoucher ? 'border' : ''} p-3 rounded-lg`}>
                    <div className="flex-row-item-center justify-between">
                        <div className="font-semibold">{lang['Select receivers']}</div>
                        <Checkbox checked={!isCodeVoucher}
                                  className="mr-1"
                                  onClick={() => setIsCodeVoucher(false)}/>
                    </div>
                    <div className="max-h-0 overflow-auto mt-3"
                         style={!isCodeVoucher ? {maxHeight: 'initial'} : undefined}>
                        <ProfileInput
                            placeholder={lang['Input username or email']}
                            lang={lang}
                            value={receivers}
                            onChange={setReceivers}
                        />
                    </div>
                </div>

                <div className="text-red-500 text-sm my-2">{error}</div>
            </div>


            <div className="grid grid-cols-1 gap-2 mt-4 max-w-[500px] mx-auto rounded-lg">
                <Button variant="special"
                        onClick={handleSend}
                >{lang['Send']}</Button>
                <Button variant="secondary"
                        onClick={() => {
                            window.location.href = `/badge-class/${badgeClass.id}`
                        }}>
                    {lang['Later']}
                </Button>
            </div>
        </div>
    </div>
}