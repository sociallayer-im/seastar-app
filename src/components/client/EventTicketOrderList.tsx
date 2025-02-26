'use client'

import {displayProfileName} from '@/utils'
import {Dictionary} from '@/lang'
import {EventDetail} from '@sola/sdk'
import Avatar from '@/components/Avatar'
import dynamic from 'next/dynamic'

const DisplayDateTime = dynamic(() => import('@/components/client/DisplayDateTime'))

export interface EventParticipantListProps {
    lang: Dictionary
    eventDetail: EventDetail
    isEventOperator?: boolean
}

export default function EventTicketOrderList({
                                                 lang,
                                                 eventDetail,
                                                 isEventOperator
                                             }: EventParticipantListProps) {

    const downloadCSV = () => {
        const title = ['Username', 'Nickname', 'Email', 'Payment wallet address', 'Status', 'Create time', 'Ticket Type']
        const rows = eventDetail.ticket_items?.map((item, index) => {
            return [item.profile.handle,
                item.profile.nickname || '',
                (item.profile as any).email || '',
                item.sender_address || '',
                item.status,
                item.created_at + 'Z',
                item.ticket.title
            ]
        }) || []

        const csvContent = "data:text/csv;charset=utf-8,"
            + title.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);

        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "orders.csv");
        document.body.appendChild(link); // Required for FF
        link.click();
        link.remove();
    }

    return <div>
        {!!eventDetail && eventDetail.ticket_items.length > 0 && isEventOperator &&
            <div onClick={downloadCSV}
                 className="flex-row-item-center py-2 text-sm text-blue-400 cursor-pointer">
                <i className="uil-download-alt text-lg mr-1"/>
                <span>{lang['Download the list of order']}</span>
            </div>}
        <div>
            {
                eventDetail.ticket_items?.map(participant => {
                    return <div key={participant.id}
                                className="border-b-[1px] border-gray-200 flex flex-row justify-between items-center py-4">
                        <a className="flex-row-item-center" href={`/profile/${participant.profile.handle}`}>
                            <Avatar profile={participant.profile} className="mr-2" size={32}/>
                            <div className="text-xs">
                                <div>{displayProfileName(participant.profile)}</div>
                                <div
                                    className="text-gray-400">
                                    <DisplayDateTime dataTimeStr={participant.created_at!} />
                                </div>
                            </div>
                        </a>

                        <div className="flex-row-item-center">
                            <div className="text-sm font-semibold flex-row-item-center">
                                <i className="uil-ticket text-base mr-1" />
                                {participant.ticket.title}
                            </div>
                        </div>
                    </div>
                })
            }
        </div>
    </div>
}

