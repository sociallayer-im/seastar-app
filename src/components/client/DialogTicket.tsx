import {ProfileDetail, Ticket, EventDetail, genDaimoLink, createDaimoOrder} from '@sola/sdk'
import {Dictionary} from '@/lang'
import {
    clientToSignIn,
    displayMethodPrice,
    formatEventTime,
    getAuth,
    isAvailablePaymentType,
    shortWalletAddress
} from '@/utils'
import {useEffect, useMemo, useState} from 'react'
import {Payments, PaymentSettingToken, PaymentsType} from '@/utils/payment_setting'
import DropdownMenu from '@/components/client/DropdownMenu'
import {Input} from '@/components/shadcn/Input'
import {Button} from '@/components/shadcn/Button'
import useModal from '@/components/client/Modal/useModal'
import {CLIENT_MODE} from '@/app/config'
import {useToast} from '@/components/shadcn/Toast/use-toast'

export interface DialogTicketProps {
    ticket: Ticket
    lang: Dictionary
    eventDetail: EventDetail
    currProfile?: ProfileDetail | null
    close: () => void
}

export default function DialogTicket({ticket, lang, currProfile, close, eventDetail}: DialogTicketProps) {
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()
    const [paymentError, setPaymentError] = useState<string>('')

    const paymentTypes = useMemo(() => {
        if (!ticket.payment_methods) return []

        const availableTypes = ticket.payment_methods.reduce((acc, method) => {
            const type = Payments.find(p => p.protocol === method.protocol && p.chain === method.chain)
            if (type && isAvailablePaymentType(type)) {
                acc.add(type)
            }
            return acc
        }, new Set<PaymentsType>())

        return Array.from(availableTypes)
    }, [ticket.payment_methods])

    const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentsType | undefined>(paymentTypes[0])

    const tokens = useMemo(() => {
        if (!ticket.payment_methods || !selectedPaymentType || !selectedPaymentType.tokenList) return []

        const methodsUsingTheType = ticket.payment_methods.filter(method =>
            method.protocol === selectedPaymentType.protocol && method.chain === selectedPaymentType.chain
        )

        return selectedPaymentType.tokenList.filter(token =>
            methodsUsingTheType.some(method => method.token_name === token.name)
        )
    }, [selectedPaymentType])

    const [selectedToken, setSelectedToken] = useState<PaymentSettingToken | undefined>(tokens[0])

    const selectedMethod = useMemo(() => {
        if (!selectedPaymentType || !selectedToken) return undefined

        return ticket.payment_methods.find(method =>
            method.protocol === selectedPaymentType.protocol &&
            method.chain === selectedPaymentType.chain &&
            method.token_name === selectedToken.name
        )
    }, [selectedPaymentType, selectedToken, ticket.payment_methods])

    useEffect(() => {
        setSelectedToken(tokens[0])
    }, [tokens])


    const [dimoLink, setDaimoLink] = useState<string | undefined>(undefined)
    const handleDaimoPayment = async (redirect: boolean) => {
        if (!currProfile) return

        const loading = showLoading()
        try {
            const authToken = getAuth()
            const res = await createDaimoOrder({
                params: {
                    eventId: eventDetail.id,
                    authToken: authToken!,
                    paymentMethod: selectedMethod!,
                    redirectUri: window.location.href
                },
                clientMode: CLIENT_MODE
            })

            if (redirect) {
                window.location.href = res.url
            } else {
                setDaimoLink(res.url)
                return res
            }
        } catch (e: unknown) {
            console.error(e)
            setPaymentError(e instanceof Error ? e.message : 'Failed to create payment')
        } finally {
            closeModal(loading)
        }
    }

    const handleCopyPaymentLink = async () => {
        if (dimoLink) {
            navigator.clipboard.writeText(dimoLink)
                .then(() => {
                    toast({
                        description: lang['Copied'],
                        variant: 'success'
                    })
                })
        }

        const data = await handleDaimoPayment(false)
        setDaimoLink(data!.url)
        navigator.clipboard.writeText(data!.url)
            .then(() => {
                toast({
                    description: lang['Copied'],
                    variant: 'success'
                })
            })
    }

    return <div
        className="bg-background sm:p-4 p-3 rounded-lg shadow max-h-[100svh] overflow-y-auto w-[96vw] sm:w-[400px]">
        <div className="flex-row-item-center justify-between mb-6">
            <div className="font-semibold text-xl">{lang['Ticket Detail']}</div>
            <i className="uil-times-circle text-2xl text-gray-500 cursor-pointer" onClick={close}/>
        </div>

        <div className="flex-row-item-center !items-start">
            <div className="flex-1 mr-3 grid grid-cols-1 gap-1">
                <div className="font-semibold text-lg">[{ticket.title}]</div>
                <div className="text-sm">
                    <i className="uil-calendar-alt mr-1"/>
                    {formatEventTime(eventDetail.start_time, eventDetail.timezone)}
                </div>
                {
                    !!eventDetail.location &&
                    <div className='text-sm'><i className="uil-location-point mr-1"/>{eventDetail.location}</div>
                }
            </div>
            {!!eventDetail.cover_url ?
                <div className="w-[80px] h-[80px]">
                    <img className="w-full h-full object-cover rounded-lg" src={eventDetail.cover_url} alt=""/>
                </div>
                : <div className="w-[80px] h-[80px] flex-shrink-0 flex-grow-0">
                    <div className="default-cover w-[452px] h-[452px] scale-[0.17]">
                        <div
                            className="webkit-box-clamp-2 font-semibold text-[27px] max-h-[80px] w-[312px] absolute left-[76px] top-[78px]">
                            {ticket.title}
                        </div>
                        <div className="text-lg absolute font-semibold left-[76px] top-[178px]">
                            {formatEventTime(eventDetail.start_time, eventDetail.timezone)}
                        </div>
                        {!!eventDetail.location &&
                            <div className="text-lg absolute font-semibold left-[76px] top-[240px]">
                                {eventDetail.location}
                            </div>
                        }
                    </div>
                </div>
            }
        </div>

        <div className="text-sm my-3 max-h-20 overflow-auto">
            {ticket.content || ''}
        </div>

        {!!ticket.check_badge_class &&
            <div className="my-3 border-t pt-2">
                <div className="font-semibold mb-1">{lang['Badge Needed']}</div>
                <div className="flex-row-item-center">
                    <img src={ticket.check_badge_class.image_url!}
                         className="w-12 h-12 rounded-full bg-gray-50 mr-3" alt=""/>
                    <div>
                        <div className="font-semibold">{ticket.check_badge_class.title}</div>
                        <div className="text-sm text-red-400 flex-row-item-center">
                            <i className="uil-info-circle text-lg mr-1"/>
                            <div>Not Collected</div>
                        </div>
                        {/*<div className="text-sm text-green-500 flex-row-item-center">*/}
                        {/*    <i className="uil-check-circle text-lg mr-1" />*/}
                        {/*    <div>Collected</div>*/}
                        {/*</div>*/}
                    </div>
                </div>
            </div>
        }

        {!!paymentTypes.length && !!selectedPaymentType && !!selectedToken &&
            <div className="my-3 border-t pt-2">
                <div className="font-semibold mb-1">{lang['Payment Methods']}</div>
                <div className="grid grid-cols-2 gap-3">
                    <DropdownMenu
                        options={paymentTypes}
                        valueKey='id'
                        renderOption={(option) => <div className="flex-row-item-center">
                            <img src={option.protocolIcon} alt="" className="w-6 h-6 rounded-full mr-1"/>
                            {option.label}
                        </div>}
                        value={[selectedPaymentType]}
                        onSelect={(opts) => setSelectedPaymentType(opts[0])}>
                        <Input
                            readOnly
                            endAdornment={<i className="uil-angle-down text-xl"/>}
                            value={selectedPaymentType.label}
                            startAdornment={<img src={selectedPaymentType.protocolIcon}
                                                 alt=""
                                                 className="w-6 h-6 rounded-full mr-1"/>}/>
                    </DropdownMenu>

                    <DropdownMenu
                        options={tokens}
                        valueKey='name'
                        renderOption={(option) => <div className="flex-row-item-center">
                            <img src={option.icon} alt="" className="w-6 h-6 rounded-full mr-1"/>
                            {option.name}
                        </div>}
                        value={[selectedToken]}
                        onSelect={(opts) => setSelectedToken(opts[0])}>
                        <Input
                            readOnly
                            endAdornment={<i className="uil-angle-down text-xl"/>}
                            value={selectedToken.name}
                            startAdornment={<img src={selectedToken.icon}
                                                 alt=""
                                                 className="w-6 h-6 rounded-full mr-1"/>}/>
                    </DropdownMenu>
                </div>
            </div>
        }

        {!!selectedMethod &&
            <div className="my-3 border-t pt-6">
                <div className="flex-row-item-center mb-3 justify-between">
                    <div className="mr-4 text-gray-500">{lang['Price']}</div>
                    <div className="font-bold flex-row-item-center text-pink-500 text-xl">
                        <img src={selectedToken!.icon}
                             alt=""
                             className="w-5 h-5 rounded-full mr-1"/>
                        {displayMethodPrice(selectedMethod)} {selectedToken!.name}
                    </div>
                </div>
                <div className="text-sm">Payments will be sent
                    to: {shortWalletAddress(selectedMethod.receiver_address!)}</div>
            </div>
        }

        {!currProfile && <Button
            onClick={clientToSignIn}
            variant={'special'} className="text-sm">{lang['Sign In']}</Button>
        }

        {selectedPaymentType?.protocol === 'daimo' && !!currProfile &&
            <div className="grid grid-cols-2 gap-2 mt-6">
                <Button variant={'secondary'}
                        onClick={handleCopyPaymentLink}
                        className="text-sm">{lang['Copy Payment Link']}</Button>
                <Button variant={'special'}
                        onClick={() => handleDaimoPayment(true)}
                        className="text-sm">{lang['Pay']}</Button>
            </div>
        }

        {!!paymentError && <div className="mt-3 text-red-400 text-sm">{paymentError}</div>}
    </div>
}