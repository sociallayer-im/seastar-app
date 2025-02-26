import {acceptInvite, InviteDetail, rejectInvite} from '@sola/sdk'
import {Dictionary} from '@/lang'
import Avatar from '@/components/Avatar'
import {displayProfileName, getAuth} from '@/utils'
import DisplayDateTime from '@/components/client/DisplayDateTime'
import {Button} from '@/components/shadcn/Button'
import useModal from '@/components/client/Modal/useModal'
import {useEffect, useState} from 'react'
import {CLIENT_MODE} from '@/app/config'

export interface DialogInviteDetailProps {
    inviteDetail: InviteDetail
    lang: Dictionary
    close: () => void
}

export default function DialogInviteDetail({inviteDetail, lang, close}: DialogInviteDetailProps) {
    const {showLoading, closeModal} = useModal()
    const [error, setError] = useState('')

    const handleAccept = async () => {
        const loading = showLoading()
        try {
            const authToken = getAuth()
            if (!authToken) {
                closeModal(loading)
                setError('Please login first')
                return
            }

            await acceptInvite({
                params: {
                    inviteId: inviteDetail.id,
                    authToken
                },
                clientMode: CLIENT_MODE
            })
            // window.location.href = `/group/${inviteDetail.group.handle}`
            close()
            closeModal(loading)
        } catch (e: unknown) {
            closeModal(loading)
            console.error(e)
            setError(e instanceof Error ? e.message : 'Accept invite failed')
        }
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
            close()
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
                   onClick={close}/>
            </div>

            <div className="flex-row-item-center justify-center my-3">
                <Avatar profile={inviteDetail.group} size={94}/>
            </div>

            <div className="font-semibold text-center my-3">
                {displayProfileName(inviteDetail.group)}
            </div>

            <div className="my-3 p-3 rounded-lg border border-white text-sm"
                 style={{background: 'rgba(245,245,245,0.6)'}}>

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
                    <DisplayDateTime dataTimeStr={inviteDetail.created_at}/>
                </div>

                <div className="font-semibold mb-1">
                    {lang['Valid Date']}
                </div>
                <div className="capitalize">
                    <DisplayDateTime dataTimeStr={inviteDetail.expires_at}/>
                </div>
            </div>

            <div className="text-red-500 text-sm my-2">{error}</div>

            {inviteDetail.accepted
                ?  <div className="p-2 bg-amber-50 text-amber-500 mb-3 flex items-center rounded-lg">
                    <i className="uil-info-circle text-lg mr-1"/>
                    {lang['You have accepted']}
                </div>
                : <div className="flex-row-item-center">
                    <Button variant={'secondary'}
                            onClick={handleReject}
                            className="flex-1 mr-2">
                        {lang['Reject']}
                    </Button>
                    <Button variant={'primary'}
                            onClick={handleAccept}
                            className="flex-1 mr-2">
                        {lang['Accept']}
                    </Button>
                </div>
            }
        </div>
    </div>
}