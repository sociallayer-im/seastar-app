'use client'

import {EventDetail, ProfileDetail, Ticket} from '@sola/sdk'
import {Dictionary} from '@/lang'
import NoData from '@/components/NoData'
import {displayTicketPrice, getPaymentMethodIcon} from '@/utils'
import useModal from '@/components/client/Modal/useModal'
import DialogTicket from '@/components/client/DialogTicket'

export default function TicketList({eventDetail, lang, currProfile}: {
    eventDetail: EventDetail,
    lang: Dictionary,
    currProfile?: null | ProfileDetail
}) {

    const {openModal} = useModal()

    const showTicket = (ticket: Ticket) => {
        openModal({
            content: (close) => <DialogTicket
                eventDetail={eventDetail}
                ticket={ticket}
                lang={lang}
                currProfile={currProfile}
                close={close!}
            />,
            clickOutsideToClose: false
        })
    }

    const tickets = eventDetail?.tickets

    return <div>
        <div className="border-gray-200 p-4">
            {!tickets || tickets.length === 0 && <NoData/>}
            {tickets?.map(ticket => {
                return <div key={ticket.id}
                            onClick={() => showTicket(ticket)}
                            className="bg-gray-100 p-4 rounded-lg mb-3 cursor-pointer border-2 hover:border-[#baffad] hover:bg-[#effff9]">
                    <div className="font-semibold">{ticket.title}</div>
                    <div className="text-xs my-2 break-words text-gray-500">
                        {ticket.content}
                    </div>

                    {ticket.payment_methods?.length === 0 ?
                        <div className="flex flex-row items-center justify-between mt-1">
                            <div className="font-semibold text-pink-500 text-xl">Free</div>
                        </div>
                        : <div className="flex flex-row items-center justify-between mt-1">
                            <div className="font-semibold text-pink-500 text-xl">
                                {displayTicketPrice(ticket)}
                            </div>
                            <div className="flex flex-row items-center">
                                {
                                    ticket.payment_methods.map((method, index) => {
                                        return <img key={index}
                                                    className="shadow min-w-5 h-5 rounded-full mr-[-6px] bg-white"
                                                    src={getPaymentMethodIcon(method)}
                                                    alt="" width={20} height={20}/>
                                    })
                                }
                            </div>
                        </div>
                    }
                </div>
            })
            }
        </div>
    </div>
}