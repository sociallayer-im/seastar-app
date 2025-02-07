'use client'

import {VoucherDetail, Profile, useVoucher, getVoucherCode, rejectVoucher} from '@sola/sdk'
import Image from 'next/image'
import {Button, buttonVariants} from '@/components/shadcn/Button'
import {Dictionary} from '@/lang'
import dynamic from 'next/dynamic'
import Avatar from '@/components/Avatar'
import {useState} from 'react'
import useModal from '@/components/client/Modal/useModal'
import {getAuth, clientToSignIn, displayProfileName} from '@/utils'
import {CLIENT_MODE} from '@/app/config'

export interface VoucherDetailProps {
    voucherDetail: VoucherDetail
    lang: Dictionary
    voucherCode?: string
    currProfile?: Profile | null
    close?: () => void
    receiver?: Profile | null
}

const DynamicDisplayDateTime = dynamic(
    () => import('@/components/client/DisplayDateTime'),
    {ssr: false}
)


export default function DialogVoucherDetail({
                                                voucherDetail,
                                                lang,
                                                close,
                                                voucherCode,
                                                currProfile,
                                                receiver
                                            }: VoucherDetailProps) {


    const {showLoading, closeModal} = useModal()
    const [error, setError] = useState('')

    const isOwner = currProfile?.id === voucherDetail.sender.id
    const currProfileHasAccepted = voucherDetail.badges.some(b => b.owner.handle === currProfile?.handle)
    const canSandAgain = isOwner && voucherDetail.counter !== 0

    let canAccept = false
    if (voucherDetail.strategy === 'code') {
        canAccept = voucherDetail.counter !== 0
            && (isOwner || !!voucherCode)
            && !currProfileHasAccepted
            && !!currProfile
    }

    if (voucherDetail.strategy === 'account') {
        canAccept = voucherDetail.receiver_id === currProfile?.id
            && !currProfileHasAccepted
    }

    const handleAccept = async () => {
        const loading = showLoading()
        try {
            const authToken = getAuth()
            if (voucherDetail.strategy === 'code') {
                if (!voucherCode && isOwner) {
                    voucherCode = await getVoucherCode({
                        params: {
                            voucherId: voucherDetail.id,
                            authToken: authToken!
                        },
                        clientMode: CLIENT_MODE
                    })
                }
                await useVoucher({
                    params: {voucherId: voucherDetail.id, code: voucherCode!, authToken: authToken!},
                    clientMode: CLIENT_MODE
                })
            } else {
                await useVoucher({
                    params: {voucherId: voucherDetail.id, authToken: authToken!},
                    clientMode: CLIENT_MODE
                })
            }
            window.location.href = `/profile/${currProfile!.handle}?tab=badges`
        } catch (e: unknown) {
            closeModal(loading)
            console.error(e)
            setError(e instanceof Error ? e.message : 'Accept voucher failed')
        }
    }

    const handleReject = async () => {
        const loading = showLoading()
        try {
            const authToken = getAuth()
            await rejectVoucher({
                params: {
                    badgeClassId: voucherDetail.badge_class.id,
                    authToken: authToken!
                },
                clientMode: CLIENT_MODE
            })
            if (close) {
                close()
            } else {
                window.location.href = `/profile/${currProfile!.handle}?tab=badges`
            }
        } catch (e: unknown) {
            closeModal(loading)
            console.error(e)
            setError(e instanceof Error ? e.message : 'Reject voucher failed')
        } finally {
            closeModal(loading)
        }
    }

    return <div className="max-w-[90vw] w-[440px] bg-background rounded-lg shadow p-3">
        <div className="max-h-[80svh] overflow-auto">
            <div className="font-semibold flex-row-item-center justify-between">
                <div> {lang['Voucher Detail']}</div>
                {!!close
                    ? <i className="uil-times-circle cursor-pointer text-xl"
                         onClick={close}/>
                    : <div/>
                }
            </div>
            <div className="flex-row-item-center justify-center my-3">
                <Image className="rounded-full"
                       src={voucherDetail.badge_class.image_url!}
                       width={94} height={94} alt=""/>
            </div>

            <div className="font-semibold text-center my-3">
                {voucherDetail.badge_class.title}
            </div>

            <div className="my-3 p-3 rounded-lg border border-white text-sm"
                 style={{background: 'rgba(245,245,245,0.6)'}}>

                <div className="font-semibold mb-1">
                    {lang['Reason']}
                </div>
                <div className="mb-3">{voucherDetail.message}</div>

                <div className="font-semibold mb-1">
                    {lang['Receivers']}
                </div>
                <div className="mb-3 flex flex-row flex-wrap gap-1">
                    {!!receiver ?
                        <div className="flex-row-item-center font-semibold">
                            <Avatar profile={receiver} size={32} className="mr-2"/>
                            {displayProfileName(receiver)}
                        </div>
                        : <>
                            {voucherDetail.badges.map((badge, index) => {
                                return <Avatar key={index} profile={badge.owner} size={32}/>
                            })}
                            {new Array(voucherDetail.counter).fill('').map((_, index) => {
                                return <Image src="/images/presend_default_avatar.png"
                                              key={index}
                                              className="rounded-full"
                                              width={32} height={32} alt=""/>
                            })}
                        </>
                    }
                </div>

                <div className="font-semibold mb-1">
                    {lang['Time']}
                </div>
                <div className="mb-3 capitalize">
                    <DynamicDisplayDateTime dataTimeStr={voucherDetail.created_at}/>
                </div>

                <div className="font-semibold mb-1">
                    {lang['Valid date']}
                </div>
                <div className="capitalize">
                    <DynamicDisplayDateTime dataTimeStr={voucherDetail.expires_at!}/>
                </div>
            </div>

            {currProfileHasAccepted &&
                <div className="p-2 bg-amber-50 text-amber-500 mb-3 flex items-center rounded-lg">
                    <i className="uil-info-circle text-lg mr-1"/>
                    {lang['You have accepted']}
                </div>
            }

            <div className="text-red-500 text-sm my-3">{error}</div>

            <div className="flex-row-item-center gap-2">
                {canSandAgain &&
                    <a href={`/voucher/${voucherDetail.id}/share`}
                       className={`${buttonVariants({variant: "secondary"})} flex-1`}>
                        {lang['Sand Again']}
                    </a>
                }
                {canAccept && voucherDetail.strategy === 'account' &&
                    <Button variant={'secondary'}
                            onClick={handleReject}
                            className="flex-1">
                        {lang['Reject']}
                    </Button>
                }
                {canAccept &&
                    <Button variant={'primary'}
                            onClick={handleAccept}
                            className="flex-1">
                        {lang['Accept']}
                    </Button>
                }
                {!currProfile &&
                    <Button variant={'primary'}
                            onClick={clientToSignIn}
                            className="flex-1">
                        {lang['Sign In']}
                    </Button>
                }
            </div>
        </div>
    </div>
}