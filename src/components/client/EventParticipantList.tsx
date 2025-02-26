'use client'

import {getAuth, shortWalletAddress} from '@/utils'
import {Dictionary} from '@/lang'
import {cancelAttendEvent, EventDetail, ProfileDetail, Participant, checkInEventForParticipant} from '@sola/sdk'
import Avatar from '@/components/Avatar'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import {CLIENT_MODE} from '@/app/config'

export interface EventParticipantListProps {
    lang: Dictionary
    eventDetail: EventDetail
    currProfile?: ProfileDetail | null
    isEventOperator?: boolean
}

export default function EventParticipantList({
                                                 lang,
                                                 eventDetail,
                                                 currProfile,
                                                 isEventOperator
                                             }: EventParticipantListProps) {
    const {showLoading, closeModal} = useModal()
    const {showConfirmDialog} = useConfirmDialog()
    const {toast} = useToast()

    const handleCancelParticipation = async () => {
        showConfirmDialog({
            lang,
            title: lang['Cancel Participation'],
            type: 'danger',
            content: lang['Are you sure you want to cancel your participation?'],
            onConfig: async () => {
                const loading = showLoading()
                try {
                    const authToken = getAuth()
                    await cancelAttendEvent({
                        params: {eventId: eventDetail.id, authToken: authToken!},
                        clientMode: CLIENT_MODE
                    })
                    toast({
                        description: lang['Participation cancelled'],
                        variant: 'success'
                    })
                    setTimeout(() => {
                        window.location.reload()
                    }, 2000)
                } catch (e: unknown) {
                    toast({
                        description: e instanceof Error ? e.message : 'Failed to cancel participation',
                        variant: 'destructive'
                    })
                } finally {
                    closeModal(loading)
                }
            }
        })
    }

    const handleCheckInForParticipant = async (participant: Participant) => {
        showConfirmDialog({
            lang,
            title: lang['Check In'],
            type: 'info',
            content: lang['Are you sure you want to check in for this participant?'],
            onConfig: async () => {
                const loading = showLoading()
                try {
                    const authToken = getAuth()
                    await checkInEventForParticipant({
                        params: {
                            authToken: authToken!,
                            eventId: eventDetail.id,
                            participantProfileId: participant.profile.id!
                        },
                        clientMode: CLIENT_MODE
                    })
                    toast({
                        description: lang['Check in successful'],
                        variant: 'success'
                    })
                    setTimeout(() => {
                        window.location.reload()
                    }, 2000)
                } catch (e: unknown) {
                    toast({
                        description: e instanceof Error ? e.message : 'Failed to check in',
                        variant: 'destructive'
                    })
                } finally {
                    closeModal(loading)
                }
            }
        })
    }

    const downloadCSV = () => {
        const title = ['Username', 'Nickname', 'Email', 'Status', 'Register time']
        const rows = eventDetail.participants?.map((item, index) => {
            return [item.profile.handle,
                item.profile.nickname || '',
                (item.profile as any).email || '',
                item.status,
                item.created_at + 'Z'
            ]
        }) || []

        const csvContent = "data:text/csv;charset=utf-8,"
            + title.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);

        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "participants.csv");
        document.body.appendChild(link); // Required for FF
        link.click();
        link.remove();
    }

    return <div>
        {!!eventDetail.participants && eventDetail.participants.length > 0 && isEventOperator &&
            <div onClick={downloadCSV}
                 className="flex-row-item-center py-2 text-sm text-blue-400 cursor-pointer">
                <i className="uil-download-alt text-lg mr-1"/>
                <span>{lang['Download the list of all participants']}</span>
            </div>}

        <div>
            {
                eventDetail.participants?.map(participant => {
                    return <div key={participant.id}
                                className="border-b-[1px] border-gray-200 flex flex-row justify-between items-center py-4">
                        <a className="flex-row-item-center" href={`/profile/${participant.profile.handle}`}>
                            <Avatar profile={participant.profile} className="mr-2" size={32}/>
                            <div className="text-xs">
                                <div>{participant.profile.nickname || participant.profile.handle}</div>
                                <div
                                    className="text-gray-400">{!!participant.ticket_item?.sender_address && shortWalletAddress(participant.ticket_item?.sender_address)}</div>
                                {!!participant.ticket &&
                                    <div
                                        className="text-xs text-gray-400 line-clamp-1 max-w-24">{participant.ticket.title}</div>
                                }
                            </div>
                        </a>

                        <div className="flex-row-item-center">
                            <div className="flex-col sm:flex-row items-end flex">
                                {participant.profile.id === currProfile?.id &&
                                    <div onClick={handleCancelParticipation}
                                         className="sm:mb-0 mb-1 cursor-pointer h-7 rounded-lg px-2 ml-2 border border-gray-300 flex flex-row-item-center text-xs text-red-400">
                                        {lang['Cancel Participation']}
                                    </div>
                                }
                                {isEventOperator && participant.status !== 'checked' &&
                                    <div onClick={() => handleCheckInForParticipant(participant)}
                                         className="cursor-pointer h-7 rounded-lg px-2 ml-2 border border-gray-300 flex flex-row-item-center text-xs text-white bg-black font-semibold">
                                        {lang['Check In']}
                                    </div>
                                }
                                {participant.status === 'checked' &&
                                    <div
                                        className="h-7 rounded-lg px-2 ml-2 border border-gray-300 flex flex-row-item-center text-xs  bg-gray-50 font-semibold">
                                        {lang['Checked']}
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                })
            }
        </div>
    </div>
}

