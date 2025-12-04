'use client'

import { acceptInvite, InviteDetail, rejectInvite, acceptCodeInvite } from '@sola/sdk'
import { Dictionary } from '@/lang'
import Avatar from '@/components/Avatar'
import { displayProfileName, getAuth } from '@/utils'
import DisplayDateTime from '@/components/client/DisplayDateTime'
import { Button } from '@/components/shadcn/Button'
import useModal from '@/components/client/Modal/useModal'
import { useState } from 'react'
import { CLIENT_MODE } from '@/app/config'
import { useToast } from '@/components/shadcn/Toast/use-toast'

export interface DialogInviteDetailProps {
    inviteDetail: InviteDetail
    isManager?: boolean
    lang: Dictionary
    close?: () => void
}

export default function DialogInviteDetail({ inviteDetail, isManager, lang, close }: DialogInviteDetailProps) {
    const { showLoading, closeModal } = useModal()
    const [error, setError] = useState('')

    const { toast } = useToast()

    const handleAccept = async () => {
        const loading = showLoading()
        try {
            const authToken = getAuth()
            if (!authToken) {
                closeModal(loading)
                setError('Please login first')
                return
            }

            if (inviteDetail.receiver_address_type === 'code') {
                await acceptCodeInvite({
                    params: {
                        groupInviteId: inviteDetail.id,
                        code: inviteDetail.receiver_address!,
                        authToken
                    },
                    clientMode: CLIENT_MODE
                })
            } else {
                await acceptInvite({
                    params: {
                        inviteId: inviteDetail.id,
                        authToken
                    },
                    clientMode: CLIENT_MODE
                })
            }

            toast({
                title: lang['You have accepted the invite'],
                variant: 'success'
            })

            setTimeout(() => {
                window.location.href = `/group/${inviteDetail.group.handle}`
                close?.()
            }, 1000)
        } catch (e: unknown) {
            closeModal(loading)
            console.error(e)
            setError(e instanceof Error ? e.message : 'Accept invite failed')
        }
    }

    const handleCopyLink = async () => {
        const url = `${window.location.origin}/invite/${inviteDetail.id}`
        navigator.clipboard.writeText(url.toString())
        toast({
            title: 'Link Copied'
        })
    }

    const handleReject = async () => {
        const loading = showLoading()
        try {
            const authToken = getAuth()
            if (!authToken) {
                closeModal(loading)
                setError('Please login first')
                return
            }

            await rejectInvite({
                params: {
                    inviteId: inviteDetail.id, authToken
                },
                clientMode: CLIENT_MODE
            })
            closeModal(loading)
            close?.()
        } catch (e) {
            closeModal(loading)
            console.error(e)
            setError(e instanceof Error ? e.message : 'Reject invite failed')
        }
    }


    return <div className="max-w-[90vw] w-[440px] bg-background rounded-lg shadow p-3">
        <div className="max-h-[80svh] overflow-auto">
            <div className="font-semibold flex-row-item-center justify-between">
                <div> {lang['Invite Detail']}</div>
                <i className="uil-times-circle cursor-pointer text-xl text-gray-400"
                    onClick={close} />
            </div>

            <div className="flex-row-item-center justify-center my-3">
                <Avatar profile={inviteDetail.group} size={94} />
            </div>

            <div className="font-semibold text-center my-3">
                {displayProfileName(inviteDetail.group)}
            </div>

            <div className="my-3 p-3 rounded-lg border border-white text-sm"
                style={{ background: 'rgba(245,245,245,0.6)' }}>

                <div className="font-semibold mb-1">
                    {lang['Invite Message']}
                </div>
                <div className="mb-3">{inviteDetail.message}</div>

                <div className="font-semibold mb-1">
                    {lang['Role']}
                </div>
                <div className="mb-3 capitalize">{inviteDetail.role}</div>

                <div className="font-semibold mb-1">
                    {lang['Time']}
                </div>
                <div className="mb-3 capitalize">
                    <DisplayDateTime dataTimeStr={inviteDetail.created_at} />
                </div>

                <div className="font-semibold mb-1">
                    {lang['Valid Date']}
                </div>
                <div className="capitalize">
                    <DisplayDateTime dataTimeStr={inviteDetail.expires_at} />
                </div>
            </div>

            <div className="text-red-500 text-sm my-2">{error}</div>

            {
                !isManager ? <>
                    <div className="flex-row-item-center">
                            <Button variant={'primary'}
                                onClick={handleAccept}
                                className="flex-1 mr-2">
                                {lang['Accept']}
                            </Button>
                        </div>
                </>
                    : <>
                        <div className="flex-row-item-center">
                            <Button variant={'primary'}
                                onClick={handleCopyLink}
                                className="flex-1 mr-2">
                                {lang['Copy Link']}
                            </Button>
                        </div>
                    </>
            }
        </div>
    </div>
}