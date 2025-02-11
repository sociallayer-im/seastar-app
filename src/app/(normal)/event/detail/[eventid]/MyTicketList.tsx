import {Ticket} from '@sola/sdk'
import {Dictionary} from '@/lang'
import {displayTicketPrice, getPaymentMethodIcon} from '@/utils'

export default function MyTicketList({tickets, lang}: {
    tickets: Ticket[],
    lang: Dictionary,
}) {
    return <div>
        <div className="font-semibold mt-3 mb-1">{lang['Your Tickets']}</div>
        <div className="border-gray-200 grid grid-cols-1 gap-3">
            {tickets?.map((ticket, i) => {
                return <a key={i}
                          href={`/event/detail/${ticket.event_id}`}
                          className="bg-gray-100 px-4 py-2 rounded-lg cursor-pointer border-2 hover:border-[#baffad] hover:bg-[#effff9]">
                    <div className="font-semibold">{ticket.title}</div>

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
                </a>
            })
            }
        </div>
    </div>
}