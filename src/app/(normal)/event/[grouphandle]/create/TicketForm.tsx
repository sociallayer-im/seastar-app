'use client'

import {
    emptyPaymentMethod,
    emptyTicket,
} from "@/app/(normal)/event/[grouphandle]/create/data"
import {Input} from "@/components/shadcn/Input"
import {getLabelColor} from "@/utils/label_color"
import {Button} from "@/components/shadcn/Button"
import {Dictionary} from "@/lang"
import {useEffect, useMemo, useState} from "react"
import DatePicker from "@/components/client/DatePicker"
import TimePicker from "@/components/client/TimePicker"
import dayjs from "@/libs/dayjs"
import useSelectBadgeClass from "@/hooks/useSelectBadgeClass"
import useModal from "@/components/client/Modal/useModal"
import {useToast} from "@/components/shadcn/Toast/use-toast"
import {Payments, PaymentSettingToken, PaymentsType} from "@/utils/payment_setting"
import DropdownMenu from "@/components/client/DropdownMenu"
import {
    Track,
    BadgeClass,
    EventDraftType,
    TicketDraft,
    PaymentMethod,
    EventRole,
    getBadgeClassByGroupId, ProfileDetail, getBadgeAndBadgeClassByOwnerHandle, getBadgeClassDetailByBadgeClassId
} from '@sola/sdk'
import {isAvailablePaymentType} from '@/utils'
import {CLIENT_MODE} from '@/app/config'

export interface TicketFormProps {
    state: {event: EventDraftType, setEvent: (event: EventDraftType) => void}
    tracks: Track[]
    lang: Dictionary
    currProfile: ProfileDetail
    checker?: Checker,
}

export interface TicketErrMsg {
    title?: string
    quantity?: string
    payment_methods?: {
        price?: string
        receiver_address?: string
    }[]
}

export interface Checker {
    check: undefined | null | (() => boolean)
}

export default function TicketForm({state: {event, setEvent}, tracks, checker, lang, currProfile} : TicketFormProps) {
    const [tickets, setTickets] = useState<TicketDraft[]>(event.tickets || [])
    const [ticketErrors, setTicketErrors] = useState<TicketErrMsg[]>([])

    useEffect(() => {
        if (!tickets.length) {
            handleAddTicket()
        }

        setEvent({...event, tickets: tickets})
    }, [tickets])
    
    const handleAddTicket = () => {
        setTickets([...tickets, {...emptyTicket}])
    }

    const handleCheckTickets = () => {
        let allTicketValid = true
        setTicketErrors(tickets.map((t) => {
            const errors: TicketErrMsg = {}
            if (!t.title) {
                allTicketValid = false
                errors.title = 'Ticket name is required'
            }
            
            if (t.quantity && t.quantity < 0) {
                allTicketValid = false
                errors.quantity = 'Quantity must be greater than 0'
            }
            
            if (t.payment_methods && t.payment_methods.length) {
                errors.payment_methods = t.payment_methods.map((p) => {
                    const errMsg: {price?: string, receiver_address?: string} = {}
                    if (!p.price && p.price !== 0) {
                        allTicketValid = false
                        errMsg.price = 'Price is required'
                    }
                    if (p.price < 0) {
                        allTicketValid = false
                        errMsg.price = 'Price must be greater than 0'
                    }
                    if (!p.receiver_address) {
                        allTicketValid = false
                        errMsg.receiver_address = 'Receiving wallet is required'
                    }

                    if (!!p.receiver_address && !p.receiver_address.startsWith('0x') && p.receiver_address.length !== 42) {
                        allTicketValid = false
                        errMsg.receiver_address = 'Invalid receiving wallet address'
                    }
                    return errMsg
                })
            }
            
            return errors
        }))
        
        
        return allTicketValid
    }

    if (checker){
        checker.check = handleCheckTickets
    }

    return <div>
        {tickets
            .filter(t => !t._destroy)
            .map((t, index) => {
                return <TicketItem
                    lang={lang}
                    currProfile={currProfile}
                    key={index}
                    index={index + 1}
                    ticket={t}
                    tracks={tracks}
                    eventRoles={event.event_roles || []}
                    errors={ticketErrors[index]}
                    onChange={ticket => {
                        setTickets(tickets.map((t, i) => i === index ? ticket : t))
                    }}
                    onRemove={() => {
                        setTickets(tickets.filter((t, i) => i !== index))
                    }}
                />
            })}
        <Button variant={'secondary'} 
            onClick={handleAddTicket}>
            <i className="uil-plus-circle text-lg" />
            {lang['Add a Ticket Type']}
        </Button>
    </div>
}

export interface TicketItemProps {
    index: number
    lang: Dictionary
    ticket: TicketDraft
    onChange: (ticket: TicketDraft) => void,
    onRemove: () => void,
    tracks: Track[],
    currProfile: ProfileDetail,
    eventRoles: EventRole[],
    itemChecker?: {check: () => boolean}
    errors?: TicketErrMsg
}

function TicketItem({index, ticket, onChange, tracks, onRemove, errors, currProfile, lang, eventRoles}: TicketItemProps) {
    const {selectBadgeClass} = useSelectBadgeClass()
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const [ticketDraft, setTicketDraft] = useState<TicketDraft>(ticket)
    const [enablePayment, setEnablePayment] = useState(!!ticket.payment_methods?.length)
    const [enableQuantity, setEnableQuantity] = useState(!!ticket.quantity)
    const [enableEndTime, setEnableEndTime] = useState(!!ticket.end_time)
    const [badgeClass, setBadgeClass] = useState<BadgeClass | null>(null)

    useEffect(() => {
        ;(async () => {
            if (!!ticketDraft.check_badge_class_id) {
                setBadgeClass(await getBadgeClassDetailByBadgeClassId({
                    params: {badgeClassId: ticketDraft.check_badge_class_id},
                    clientMode: CLIENT_MODE
                }))
            }
        })()
    }, [ticketDraft.check_badge_class_id])

    useEffect(() => {
        onChange({
            ...ticketDraft,
            payment_methods: enablePayment ? ticketDraft.payment_methods : [],
            quantity: enableQuantity ? ticketDraft.quantity : null,
            end_time: enableEndTime ? ticketDraft.end_time : null
        })
    }, [enablePayment, enableQuantity, setEnableEndTime, ticketDraft])

    const handleRemoveTicket = () => {
        if (ticketDraft.id) {
            onChange({...ticketDraft, _destroy: '1'})
        } else {
            onRemove()
        }
    }

    const handleSelectBadge = async () => {
        const loading = showLoading()
        try {
            const profileBadgeClasses = (await getBadgeAndBadgeClassByOwnerHandle({
                params: {handle: currProfile.handle},
                clientMode: CLIENT_MODE
            })).badgeClasses
            let groupHostBadgeClasses: Solar.BadgeClass[] = []
            const groupHost = eventRoles.find(r => r.role === 'group_host')
            if (groupHost) {
                if (groupHost) {
                    groupHostBadgeClasses = await getBadgeClassByGroupId({
                        params: {
                            groupId: groupHost.item_id!
                        },
                        clientMode: CLIENT_MODE
                    })
                }
            }
            closeModal(loading)
            selectBadgeClass({
                lang,
                profileBadgeClasses,
                groupBadgeClasses: groupHostBadgeClasses,
                onSelect: (b) => {
                    setTicketDraft({...ticketDraft, check_badge_class_id: b.id})
                    closeModal()
                }
            })
        } catch (e: unknown) {
            closeModal(loading)
            console.error(e)
            toast({title: e instanceof Error ? e.message : 'Failed to select badge', variant: 'destructive'})
        }
    }

    return <div className="border border-gray-200 p-3 rounded-lg mb-3">
        <div className="font-semibold flex-row-item-center justify-between">
            <div className="flex-row-item-center">
                <i className="uil-ticket text-2xl mr-2"/>
                <div>{lang['Ticket']} {index}</div>
            </div>
            <i className="uil-times-circle text-2xl cursor-pointer"
                onClick={handleRemoveTicket}
            />
        </div>
        <div className="my-3">
            <div className="text-sm mb-1">{lang['Name of Tickets']} <span
                className="text-red-500">*</span></div>
            <Input type="text" 
                className="w-full" 
                value={ticketDraft.title}
                onChange={e => setTicketDraft({...ticket, title: e.target.value})}
            />
            {!!errors?.title && <div className="err-msg text-red-400 mt-2 text-xs">{errors?.title}</div>}

        </div>
        <div className="my-3">
            <div className="text-sm mb-1">{lang['Ticket description']}</div>
            <Input type="text" 
                className="w-full" 
                value={ticketDraft.content || ''}
                onChange={e => setTicketDraft({...ticket, content: e.target.value})}
            />
        </div>
        <div className="my-3">
            <div className="text-sm mb-1">{lang['Event Track']}</div>
            <div className="flex-row flex flex-wrap items-center mb-4">
                {tracks.map(t => {
                    const color = getLabelColor(t.title)
                    const themeStyle = ticket.tracks_allowed?.includes(t.id) ? {
                        color: color,
                        borderColor: color
                    } : {borderColor: '#ededed'}
                    return <Button
                        onClick={() => {
                            const tracks = ticket.tracks_allowed || []
                            if (tracks.includes(t.id)) {
                                setTicketDraft({...ticketDraft, tracks_allowed: tracks.filter(id => id !== t.id)})
                            } else {
                                setTicketDraft({...ticketDraft, tracks_allowed: [...tracks, t.id]})
                            }
                        }}
                        variant="outline"
                        className="mr-2"
                        style={themeStyle}
                        key={t.id}>
                        <div className="text-xs font-normal">
                            <div className="font-semibold">{t.title}</div>
                            <div>{t.kind}</div>
                        </div>
                    </Button>
                })}
            </div>
        </div>
        <div className="my-3">
            <div className="flex-row-item-center">
                <div className="text-sm mr-6">{lang['Price']}</div>
                <div className="flex-row-item-center text-sm font-semibold">
                    <div className="flex-row-item-center cursor-pointer" 
                        onClick={() => {setEnablePayment(false)}}>
                        <div>{lang['Free']}</div>
                        {
                            !enablePayment
                                ? <i className="uil-check-circle ml-2 text-2xl text-green-500"/>
                                : <i className="uil-circle ml-2 text-2xl text-gray-500"/>
                        }
                    </div>
                    <div className="flex-row-item-center ml-3 cursor-pointer"
                        onClick={() => {setEnablePayment(true)}}>
                        <div>{lang['Payment']}</div>
                        {
                            enablePayment
                                ? <i className="uil-check-circle ml-2 text-2xl text-green-500"/>
                                : <i className="uil-circle ml-2 text-2xl text-gray-500"/>
                        }
                    </div>
                </div>
            </div>

            { enablePayment &&
                <PaymentMethodForm
                    errors={errors?.payment_methods}
                    lang={lang}
                    paymentMethods={ticket.payment_methods || []}
                    onChange={(paymentMethods) => setTicketDraft({...ticketDraft, payment_methods: paymentMethods})}
                />
            }

        </div>

        <div className="my-3">
            <div className="flex-row-item-center">
                <div className="text-sm mr-6">{lang['Ticket amount']}</div>
                <div className="flex-row-item-center text-sm font-semibold">
                    <div className="flex-row-item-center cursor-pointer"
                        onClick={() => {
                            setEnableQuantity(false)
                            setTicketDraft({...ticketDraft, quantity: null})
                        }}>
                        <div>{lang['No limit']}</div>
                        {
                            !enableQuantity
                                ? <i className="uil-check-circle ml-2 text-2xl text-green-500"/>
                                : <i className="uil-circle ml-2 text-2xl text-gray-500"/>
                        }
                    </div>
                    <div className="flex-row-item-center ml-3 cursor-pointer"
                        onClick={() => {
                            setEnableQuantity(true)
                        }}>
                        <div>{lang['Limit']}</div>
                        {
                            enableQuantity
                                ? <i className="uil-check-circle ml-2 text-2xl text-green-500"/>
                                : <i className="uil-circle ml-2 text-2xl text-gray-500"/>
                        }
                    </div>
                </div>
            </div>
            {
                enableQuantity &&
                <Input type="number"
                    onWheel={e => {
                        e.currentTarget.blur()
                    }}
                    onChange={e => setTicketDraft({...ticketDraft, quantity: parseInt(e.target.value)})}
                    className="w-full"
                    value={ticket.quantity || ''}/>
            }

            {!!errors?.quantity && <div className="err-msg text-red-400 mt-2 text-xs">{errors?.quantity}</div>}
        </div>

        <div className="my-3">
            <div className="flex-row-item-center">
                <div className="text-sm mr-6">{lang['Ticket sales end time']}</div>
                <div className="flex-row-item-center text-sm font-semibold">
                    <div className="flex-row-item-center cursor-pointer"
                        onClick={() => {
                            setEnableEndTime(false)
                            setTicketDraft({...ticketDraft, end_time: null})
                        }}>
                        <div>No limit</div>
                        {
                            !enableEndTime
                                ? <i className="uil-check-circle ml-2 text-2xl text-green-500"/>
                                : <i className="uil-circle ml-2 text-2xl text-gray-500"/>
                        }
                    </div>
                    <div className="flex-row-item-center ml-3 cursor-pointer"  
                        onClick={() => {
                            setEnableEndTime(true)
                            const initDataTime = dayjs().hour(23).minute(59).toDate().toISOString()
                            setTicketDraft({...ticketDraft, end_time:initDataTime})}}>
                        <div>Limit</div>
                        {
                            enableEndTime
                                ? <i className="uil-check-circle ml-2 text-2xl text-green-500"/>
                                : <i className="uil-circle ml-2 text-2xl text-gray-500"/>
                        }
                    </div>
                </div>
            </div>
            {
                enableEndTime &&
                <div className="grid grid-cols-2 gap-3">
                    <DatePicker
                        initDate={ticket.end_time
                            ? dayjs(new Date(ticket.end_time).getTime()).format('YYYY/MM/DD')
                            : dayjs().format('YYYY/MM/DD')}
                        onChange={(dateStr)=> {
                            const value = dayjs(dateStr).hour(23).minute(59).toDate().toISOString()
                            setTicketDraft({...ticketDraft, end_time: value})
                        }}>
                        <Input type="text"
                            placeholder={'Set Date'}
                            className="w-full"
                            readOnly
                            value={ticketDraft.end_time ? dayjs(new Date(ticketDraft.end_time).getTime()).format('YYYY/MM/DD'): '' }
                            startAdornment={<i className="uil-calender text-lg"/>}/>
                    </DatePicker>

                    <TimePicker
                        initTime={ticketDraft.end_time
                            ? dayjs(new Date(ticketDraft.end_time).getTime()).format('HH:mm')
                            : dayjs().format('HH:mm')}
                        onChange={(timeStr) => {
                            const dateStr = dayjs(ticket.end_time ? new Date(ticketDraft.end_time!).getTime() : new Date().getTime()).format('YYYY/MM/DD')
                            const value = dayjs(`${dateStr} ${timeStr}`).toDate().toISOString()
                            setTicketDraft({...ticketDraft, end_time: value})
                        }}/>
                </div>
            }
        </div>
        <div className="my-3">
            <div className="text-sm mr-6">{lang['Qualification']}</div>
            <div className="text-xs text-gray-500 mb-3">
                {lang['People possessing the badge you select have the privilege to make payments at this price.']}
            </div>
            {!!badgeClass &&
                <div className="mb-3 relative w-[114px] h-[114px] rounded-lg bg-[#ecf2ee] flex flex-col justify-center items-center">
                    <img className="w-[60px] h-[60px] rounded-full mb-2" src={badgeClass.image_url!} alt=""/>
                    <div className="text-xs w-[80%] mx-auto webkit-box-clamp-1 text-center">{badgeClass.title}</div>
                    <i onClick={() => {
                        setBadgeClass(null)
                        setTicketDraft({...ticketDraft, check_badge_class_id: null})
                    }}
                    className="uil-times cursor-pointer opacity-50 hover:opacity-100 text-lg right-2 top-1 absolute" />
                </div>

            }
            <Button
                onClick={handleSelectBadge}
                variant={'secondary'}
                className="text-sm">{lang['Select a Badge']}</Button>
        </div>
    </div>
}

export interface PaymentMethodForm {
    paymentMethods: PaymentMethod[]
    lang: Dictionary
    onChange: (paymentMethods: PaymentMethod[]) => void
    checker?: {check: undefined | null | (() => boolean)}
    errors?: {price?: string, receiver_address?: string}[]
}


function PaymentMethodForm({lang, ...props}: PaymentMethodForm) {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(props.paymentMethods)
    const {toast} = useToast()

    const AvailablePaymentMethods = Payments.filter(p => isAvailablePaymentType(p))

    useEffect(() => {
        if (!paymentMethods.length) {
            setPaymentMethods([{
                ...emptyPaymentMethod,
                chain: AvailablePaymentMethods[0].chain,
                token_name: AvailablePaymentMethods[0].tokenList[0].name,
                token_address: AvailablePaymentMethods[0].tokenList[0].contract,
                protocol: AvailablePaymentMethods[0].protocol,
                price: 10 ** AvailablePaymentMethods[0].tokenList[0].decimals
            }])
        }
    }, [paymentMethods])

    useEffect(() => {
        props.onChange(paymentMethods)
    }, [paymentMethods])

    const handleRemovePaymentMethod = (index: number) => {
        if (paymentMethods[index].id) {
            paymentMethods[index]._destroy = '1'
            setPaymentMethods([...paymentMethods])
        } else {
            setPaymentMethods(paymentMethods.filter((p, i) => i !== index))
        }
    }

    const getAvailablePaymentProtocalList = (currOpt: PaymentMethod) => {
        const protocals: PaymentsType[] = []
        let index = 0
        while (index < AvailablePaymentMethods.length) {
            const c = AvailablePaymentMethods[index]
            if (c.chain === currOpt.chain && c.protocol === currOpt.protocol) {
                protocals.push(c)
            } else {
                const hasUsedChain = props.paymentMethods
                    .filter(payment_method => c.chain === payment_method.chain 
                        && payment_method.protocol === c.protocol 
                        && payment_method._destroy !== '1')
                if (!hasUsedChain.length) {
                    // 没有使用过的支付方式
                    protocals.push(c)
                } else {
                    // 已经有了的支付方式，判断是否有其他可用token
                    const currPaymentToken = hasUsedChain!.map((method) => method.token_address)
                    c.tokenList.forEach((tokenInfo) => {
                        if (!currPaymentToken.includes(tokenInfo.contract)) {
                            protocals.push(c)
                        }
                    })
                }
            }
            index++
        }

        return protocals
    }

    const getAvailableTokenList = (currOpt: PaymentMethod) => {
        return Payments
            .find(c => currOpt.chain === c.chain && currOpt.protocol === c.protocol)!.tokenList
            .filter(t => t.contract === currOpt.token_address 
                || !paymentMethods.find(p => p.chain === currOpt.chain
                    && p.protocol === currOpt.protocol 
                    && p.token_address === t.contract))
    }

    const addNewPaymentMethod = () => {
        let chain: PaymentsType | undefined
        let token: PaymentSettingToken | undefined

        let index = 0
        while ((!chain || !token) && index < AvailablePaymentMethods.length) {
            const c = AvailablePaymentMethods[index]
            const hasUsedChain = props.paymentMethods.filter(payment_method => c.chain === payment_method.chain && payment_method.protocol === c.protocol && payment_method._destroy !== '1')
            if ((!hasUsedChain || !hasUsedChain.length) && !token && !chain) {
                // 没有使用过的支付方式, 使用该支付方式并使用第一个token
                chain = c
                token = c.tokenList[0]
            } else {
                // 已经有了的支付方式，判断是否有其他可用token
                const currPaymentToken = hasUsedChain!.map((method) => method.token_address)
                c.tokenList.forEach((tokenInfo) => {
                    if (!currPaymentToken.includes(tokenInfo.contract) && !token && !chain) {
                        chain = c
                        token = tokenInfo
                    }
                })
            }

            index++
        }

        if (!chain || !token) {
            // 没有更多的支付方式
            toast({title: 'No more payment methods', variant: 'destructive'})
            return
        }

        setPaymentMethods([...paymentMethods, {
            ...emptyPaymentMethod,
            chain: chain.chain,
            token_name: token.name,
            token_address: token.contract,
            protocol: chain.protocol,
            price: 10**token.decimals
        }])
    }
    
    return <div>
        {
            paymentMethods
                .filter(p => !p._destroy)
                .map((p, index) => {
                    const currProtocal = Payments.find(c => c.chain === p.chain && c.protocol === p.protocol)
                    const currToken = currProtocal!.tokenList.find(t => t.name === p.token_name)

                    return <div key={index} className="border border-gray-200 p-3 rounded-lg mb-3">
                        <div className="mb-2 text-sm font-semibold">{lang['Payment']} {index + 1}</div>
                        <div
                            className="flex-row-item-center">
                            <div className="mr-1">
                                <div className="flex-row-item-center flex-1 text-sm mb-3 whitespace-nowrap">
                                    <div>{lang['Price']}</div>
                                    <div className="ml-2">
                                        <DropdownMenu
                                            options={getAvailablePaymentProtocalList(p)}
                                            value={[currProtocal!]}
                                            onSelect={(option) => {
                                                if (option[0].chain === p.chain) return
                                                const targetToken = option[0].tokenList.find((t: PaymentSettingToken) => {
                                                    return !props.paymentMethods!.find(method => method.chain === option[0].chain
                                                        && method.protocol === option[0].protocol
                                                        && method.token_address === t.contract
                                                        && method._destroy !== '1'
                                                    )
                                                })
                                                setPaymentMethods(paymentMethods.map((p, i) => i === index ? {
                                                    ...p,
                                                    chain: option[0].chain,
                                                    token_name: targetToken!.name,
                                                    token_address: targetToken!.contract,
                                                    protocol: option[0].protocol,
                                                    price: 1
                                                } : p))
                                            }}
                                            renderOption={(option) => {
                                                return <div className="flex-row-item-center">
                                                    <img src={option.protocolIcon} className="w-5 h-5 rounded-full mr-2"
                                                        alt=""/>
                                                    <div>{option.label}</div>
                                                </div>
                                            }}
                                            valueKey={'chain'}>
                                            <Input
                                                type="text"
                                                readOnly
                                                value={currProtocal!.label}
                                                inputSize={'md'}
                                                className="cursor-pointer"
                                                endAdornment={<i className="uil-angle-down text-lg"/>}
                                                startAdornment={<img
                                                    className="w-5 h-5 rounded-full"
                                                    src={currProtocal!.protocolIcon}/>}
                                            />
                                        </DropdownMenu>
                                    </div>
                                    <div className="ml-2">
                                        <DropdownMenu
                                            options={getAvailableTokenList(p)}
                                            onSelect={(option: PaymentSettingToken[]) => {
                                                setPaymentMethods(paymentMethods.map((p, i) => i === index ? {
                                                    ...p,
                                                    token_name: option[0].name,
                                                    token_address: option[0].contract
                                                } : p))
                                            }
                                            }
                                            renderOption={(option) => {
                                                return <div className="flex-row-item-center">
                                                    <img src={option.icon} className="w-5 h-5 rounded-full mr-2"
                                                        alt=""/>
                                                    <div>{option.name}</div>
                                                </div>
                                            }}
                                            valueKey={'name'}>
                                            <Input
                                                type="text"
                                                readOnly
                                                value={p.token_name!}
                                                inputSize={'md'}
                                                className="cursor-pointer"
                                                endAdornment={<i className="uil-angle-down text-lg"/>}
                                                startAdornment={<img src={currToken!.icon}
                                                className="w-5 h-5 rounded-full"
                                                alt=""/>}
                                            />
                                        </DropdownMenu>
                                    </div>
                                    <Input type="number"
                                        value={!!p.price || Number(p.price) === 0 ? p.price / 10**currToken!.decimals : ''}
                                        onWheel={e => e.currentTarget.blur()}
                                        inputSize={'md'}
                                        onChange={e => setPaymentMethods(paymentMethods.map((p, i) => i === index ? {
                                            ...p,
                                            price: parseInt(e.target.value) * 10**currToken!.decimals
                                        } : p))}
                                        className="ml-2"/>
                                </div>
                                {!!props.errors?.[index]?.price &&
                                    <div className="err-msg text-red-400 mb-2 text-xs">{props.errors?.[index]?.price}</div>
                                }

                                <div className="flex-row-item-center flex-1 text-sm">
                                    <div className="whitespace-nowrap">{lang['Receiving wallet']}</div>
                                    <Input
                                        value={p.receiver_address || ''}
                                        onChange={e => setPaymentMethods(paymentMethods.map((p, i) => i === index ? {
                                            ...p,
                                            receiver_address: e.target.value
                                        } : p))}
                                        type="text"
                                        inputSize={'md'}
                                        startAdornment={<img src={Payments
                                            .find(c => c.chain === p.chain && p.protocol === c.protocol)?.chainIcon}
                                        className="w-5 h-5 rounded-full"
                                        alt=""/>}
                                        className="ml-2 flex-1"/>
                                </div>
                                {!!props.errors?.[index]?.receiver_address &&
                                    <div
                                        className="err-msg text-red-400 mt-2 text-xs">{props.errors?.[index]?.receiver_address}</div>
                                }
                            </div>
                            {index === paymentMethods.length - 1 &&
                                <i onClick={addNewPaymentMethod}
                                    className="uil-plus-circle text-2xl text-green-500 cursor-pointer"/>
                            }
                            <i onClick={() => {
                                handleRemovePaymentMethod(index)
                            }}
                            className="uil-minus-circle text-2xl text-gray-500 cursor-pointer"/>
                        </div>
                    </div>
                })
        }
    </div>
}
