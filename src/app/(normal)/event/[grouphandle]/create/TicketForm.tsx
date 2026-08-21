'use client'

import {
    emptyPaymentMethod,
    emptyTicket,
} from "@/app/(normal)/event/[grouphandle]/create/data"
import {Input} from "@/components/shadcn/Input"
import {getLabelColor} from "@/utils/label_color"
import {Button} from "@/components/shadcn/Button"
import {Dictionary} from "@/lang"
import {useEffect, useState} from "react"
import DatePicker from "@/components/client/DatePicker"
import TimePicker from "@/components/client/TimePicker"
import dayjs from "@/libs/dayjs"
import useSelectBadgeClass from "@/hooks/useSelectBadgeClass"
import useModal from "@/components/client/Modal/useModal"
import {useToast} from "@/components/shadcn/Toast/use-toast"
import {isFiatChain, Payments, PaymentSettingToken, PaymentsType} from "@/utils/payment_setting"
import DropdownMenu from "@/components/client/DropdownMenu"
import {
    Track,
    BadgeClass,
    EventDraftType,
    TicketDraft,
    PaymentMethod,
    EventRole,
    getBadgeClassByGroupId, ProfileDetail, getBadgeAndBadgeClassByOwnerName, getBadgeClassDetailByBadgeClassId,
    Group, getProfileGroup
} from '@sola/sdk'
import {cfImage, getAuth} from '@/utils'
import {CLIENT_MODE, CRYPTO_PAYMENT_ENABLED, PAYMENTS_ENABLED, STRIPE_ENABLED, WECHAT_PAY_ENABLED} from '@/app/config'
import {StripeSetting, getStripeSettings, getEventStripeSettings} from '@sola/sdk'

export interface TicketFormProps {
    state: { event: EventDraftType, setEvent: (event: EventDraftType) => void }
    tracks: Track[]
    lang: Dictionary
    timezone: string,
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

export default function TicketForm({
                                       state: {event, setEvent},
                                       tracks,
                                       checker,
                                       lang,
                                       currProfile,
                                       timezone
                                   }: TicketFormProps) {
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
                    const errMsg: { price?: string, receiver_address?: string } = {}
                    // A method being removed is not validated — its errors are
                    // never rendered, so it could block submission invisibly.
                    if (p._destroy) return errMsg
                    if (p.chain === 'stripe') {
                        // Card methods: no wallet/chains — a key and the $4
                        // floor instead (mirrors soon's creation validation).
                        if (p.price < 400) {
                            allTicketValid = false
                            errMsg.price = lang['Card price minimum']
                        }
                        if (!p.stripe_setting_id) {
                            allTicketValid = false
                            errMsg.receiver_address = lang['Stripe key required']
                        }
                        return errMsg
                    }
                    if (p.chain === 'wechat') {
                        // No wallet, no chains, and no merchant to pick — the
                        // backend attaches the one CN merchant. Only the 1分
                        // floor is left to mirror.
                        if (!p.price || p.price < 1) {
                            allTicketValid = false
                            errMsg.price = lang['WeChat price minimum']
                        }
                        return errMsg
                    }
                    if (!p.price && p.price !== 0) {
                        allTicketValid = false
                        errMsg.price = 'Price is required'
                    }
                    if (p.price < 0) {
                        allTicketValid = false
                        errMsg.price = 'Price must be greater than 0'
                    }
                    if (!p.chains?.length) {
                        allTicketValid = false
                        errMsg.price = errMsg.price || 'At least one chain must be selected'
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

    if (checker) {
        checker.check = handleCheckTickets
    }

    return <div>
        {tickets
            .filter(t => !t._destroy)
            .map((t, index) => {
                return <TicketItem
                    lang={lang}
                    timezone={timezone}
                    currProfile={currProfile}
                    key={index}
                    index={index + 1}
                    eventId={event.id}
                    isGroupTicketEvent={!!event.is_group_ticket_event}
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
            <i className="uil-plus-circle text-lg"/>
            {lang['Add a Ticket Type']}
        </Button>
    </div>
}

export interface TicketItemProps {
    index: number
    lang: Dictionary
    timezone: string
    eventId?: string
    ticket: TicketDraft
    onChange: (ticket: TicketDraft) => void,
    onRemove: () => void,
    tracks: Track[],
    currProfile: ProfileDetail,
    eventRoles: EventRole[],
    itemChecker?: { check: () => boolean }
    errors?: TicketErrMsg
    isGroupTicketEvent?: boolean
}

function TicketItem({
                        index,
                        ticket,
                        onChange,
                        tracks,
                        onRemove,
                        errors,
                        currProfile,
                        lang,
                        eventRoles,
                        timezone,
                        eventId,
                        isGroupTicketEvent
                    }: TicketItemProps) {
    const {selectBadgeClass} = useSelectBadgeClass()
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const [ticketDraft, setTicketDraft] = useState<TicketDraft>(ticket)
    const [enablePayment, setEnablePayment] = useState(!!ticket.payment_methods?.length)

    // With no payment rail at all (CN: crypto and card both off) a ticket can
    // only be free, so the Free/Payment choice has nothing to offer. A ticket
    // that already carries payment methods keeps the UI regardless — hiding a
    // control must not silently strip data a previous deployment created.
    const showPrice = PAYMENTS_ENABLED || !!ticket.payment_methods?.length
    const [enableQuantity, setEnableQuantity] = useState(!!ticket.quantity)
    const [enableEndTime, setEnableEndTime] = useState(!!ticket.end_time)
    const [badgeClass, setBadgeClass] = useState<BadgeClass | null>(null)
    // Groups the creator belongs to — the candidates for the member gate. A
    // gate id set by someone else stays in check_group_ids untouched; the
    // chips only ever toggle the caller's own groups in and out.
    const [myGroups, setMyGroups] = useState<Group[]>([])

    useEffect(() => {
        getProfileGroup({params: {profileName: currProfile.name}, clientMode: CLIENT_MODE})
            .then(gs => setMyGroups(gs || []))
            .catch(console.error)
    }, [currProfile.name])

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
            toast({
                title: 'Cannot remove existing ticket',
                variant: 'destructive'
            })
            // onChange({...ticketDraft, _destroy: '1'})
        } else {
            onRemove()
        }
    }

    const handleSelectBadge = async () => {
        const loading = showLoading()
        try {
            const profileBadgeClasses = (await getBadgeAndBadgeClassByOwnerName({
                params: {name: currProfile.name},
                clientMode: CLIENT_MODE
            })).badgeClasses
            let groupHostBadgeClasses: BadgeClass[] = []
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
                   value={ticketDraft.title || ''}
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
        {!!tracks.length &&
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
                                <div>{t.is_private ? 'private' : 'public'}</div>
                            </div>
                        </Button>
                    })}
                </div>
            </div>
        }
        {showPrice && <div className="my-3">
            <div className="flex-row-item-center">
                <div className="text-sm mr-6">{lang['Price']}</div>
                <div className="flex-row-item-center text-sm font-semibold">
                    <div className="flex-row-item-center cursor-pointer"
                         onClick={() => {
                             setEnablePayment(false)
                         }}>
                        <div>{lang['Free']}</div>
                        {
                            !enablePayment
                                ? <i className="uil-check-circle ml-2 text-2xl text-green-500"/>
                                : <i className="uil-circle ml-2 text-2xl text-gray-500"/>
                        }
                    </div>
                    <div className="flex-row-item-center ml-3 cursor-pointer"
                         onClick={() => {
                             setEnablePayment(true)
                         }}>
                        <div>{lang['Payment']}</div>
                        {
                            enablePayment
                                ? <i className="uil-check-circle ml-2 text-2xl text-green-500"/>
                                : <i className="uil-circle ml-2 text-2xl text-gray-500"/>
                        }
                    </div>
                </div>
            </div>

            {enablePayment &&
                <PaymentMethodForm
                    errors={errors?.payment_methods}
                    lang={lang}
                    eventId={eventId}
                    paymentMethods={ticket.payment_methods || []}
                    onChange={(paymentMethods) => setTicketDraft({...ticketDraft, payment_methods: paymentMethods})}
                />
            }

        </div>}

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
                        <div>{lang['No limit']}</div>
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
                             setTicketDraft({...ticketDraft, end_time: initDataTime})
                         }}>
                        <div>{lang['Limit']}</div>
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
                        onChange={(dateStr) => {
                            const value = dayjs.tz(`${dateStr} 23:59`, timezone).toDate().toISOString()
                            setTicketDraft({...ticketDraft, end_time: value})
                        }}>
                        <Input type="text"
                               placeholder={'Set Date'}
                               className="w-full"
                               readOnly
                               value={ticketDraft.end_time ? dayjs.tz(new Date(ticketDraft.end_time).getTime(), timezone).format('YYYY/MM/DD') : ''}
                               startAdornment={<i className="uil-calender text-lg"/>}/>
                    </DatePicker>

                    <TimePicker
                        initTime={ticketDraft.end_time
                            ? dayjs.tz(new Date(ticketDraft.end_time).getTime(), timezone).format('HH:mm')
                            : dayjs().format('HH:mm')}
                        onChange={(timeStr) => {
                            const dateStr = dayjs.tz(ticket.end_time ? new Date(ticketDraft.end_time!).getTime() : new Date().getTime(), timezone).format('YYYY/MM/DD')
                            const value = dayjs.tz(`${dateStr} ${timeStr}`, timezone).toDate().toISOString()
                            setTicketDraft({...ticketDraft, end_time: value})
                        }}/>
                </div>
            }
        </div>
        {
            isGroupTicketEvent &&
            <div className="my-3">
                <div className="flex-row-item-center cursor-pointer"
                     onClick={() => setTicketDraft({
                         ...ticketDraft,
                         ticket_type: ticketDraft.ticket_type === 'membership_card' ? 'event' : 'membership_card'
                     })}>
                    <div className="text-sm mr-6">{lang['Monthly membership card']}</div>
                    {ticketDraft.ticket_type === 'membership_card'
                        ? <i className="uil-check-circle text-2xl text-green-500"/>
                        : <i className="uil-circle text-2xl text-gray-500"/>}
                </div>
                <div className="text-xs text-gray-500">{lang['Monthly membership card hint']}</div>
            </div>
        }
        <div className="my-3">
            <div className="flex-row-item-center cursor-pointer"
                 onClick={() => setTicketDraft({...ticketDraft, need_approval: !ticketDraft.need_approval})}>
                <div className="text-sm mr-6">{lang['Require Approval (Optional)']}</div>
                {ticketDraft.need_approval
                    ? <i className="uil-check-circle text-2xl text-green-500"/>
                    : <i className="uil-circle text-2xl text-gray-500"/>}
            </div>
            <div className="text-xs text-gray-500">{lang['Ticket approval hint']}</div>
        </div>
        <div className="my-3">
            <div className="text-sm mb-1">{lang['Members Only (Optional)']}</div>
            <div className="text-xs text-gray-500 mb-3">{lang['Members only ticket hint']}</div>
            <div className="flex-row flex flex-wrap items-center">
                {myGroups.map(g => {
                    const selected = ticketDraft.check_group_ids?.includes(g.id)
                    const color = getLabelColor(g.name)
                    return <Button
                        onClick={() => {
                            const ids = ticketDraft.check_group_ids || []
                            setTicketDraft({
                                ...ticketDraft,
                                check_group_ids: selected ? ids.filter(id => id !== g.id) : [...ids, g.id]
                            })
                        }}
                        variant="outline"
                        className="mr-2 mb-2"
                        style={selected ? {color, borderColor: color} : {borderColor: '#ededed'}}
                        key={g.id}>
                        <div className="text-xs font-semibold">{g.nickname || g.name}</div>
                    </Button>
                })}
            </div>
        </div>
        <div className="my-3">
            <div className="text-sm mr-6">{lang['Qualification']}</div>
            <div className="text-xs text-gray-500 mb-3">
                {lang['People possessing the badge you select have the privilege to make payments at this price.']}
            </div>
            {!!badgeClass &&
                <div
                    className="mb-3 relative w-[114px] h-[114px] rounded-lg bg-[#ecf2ee] flex flex-col justify-center items-center">
                    <img className="w-[60px] h-[60px] rounded-full mb-2" src={cfImage(badgeClass.image_url, { width: 120, height: 120, fit: 'cover' })} alt=""/>
                    <div className="text-xs w-[80%] mx-auto webkit-box-clamp-1 text-center">{badgeClass.title}</div>
                    <i onClick={() => {
                        setBadgeClass(null)
                        setTicketDraft({...ticketDraft, check_badge_class_id: null})
                    }}
                       className="uil-times cursor-pointer opacity-50 hover:opacity-100 text-lg right-2 top-1 absolute"/>
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
    eventId?: string
    onChange: (paymentMethods: PaymentMethod[]) => void
    checker?: { check: undefined | null | (() => boolean) }
    errors?: { price?: string, receiver_address?: string }[]
}


function PaymentMethodForm({lang, ...props}: PaymentMethodForm) {
    // chain_token_addresses exists in the DB but is not emitted/permitted by soon yet.
    type PaymentMethodDraft = PaymentMethod & {chain_token_addresses?: Record<string, string>}
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDraft[]>(props.paymentMethods)

    // Keys for card payment methods (SG only). Money always lands in the
    // EVENT OWNER's account: when editing an existing event, list the owner's
    // keys (co-hosts/managers select among them, never modify them); on the
    // create flow the creator IS the future owner, so their own keys apply.
    const [stripeSettings, setStripeSettings] = useState<StripeSetting[]>([])
    useEffect(() => {
        if (!STRIPE_ENABLED) return
        const authToken = getAuth()
        if (!authToken) return
        const load = props.eventId
            ? getEventStripeSettings({params: {eventId: props.eventId, authToken}, clientMode: CLIENT_MODE})
            : getStripeSettings({params: {authToken}, clientMode: CLIENT_MODE})
        load.then(setStripeSettings).catch(console.error)
    }, [props.eventId])

    // Backfill the single-key preselection once the keys actually arrive:
    // picking it only at click time left the method keyless whenever the
    // fetch hadn't landed yet, producing a ticket nobody can buy.
    useEffect(() => {
        if (stripeSettings.length !== 1) return
        setPaymentMethods(prev => prev.some(p => p.chain === 'stripe' && !p._destroy && !p.stripe_setting_id)
            ? prev.map(p => (p.chain === 'stripe' && !p._destroy && !p.stripe_setting_id)
                ? {...p, stripe_setting_id: stripeSettings[0].id} : p)
            : prev)
    }, [stripeSettings])

    // Everything that is NOT a fiat rail. Written as a subtraction rather than
    // `!== 'stripe'` so a newly added fiat rail cannot leak into the token and
    // wallet pickers, whose price unit is a token's decimals rather than
    // minor units.
    const EVM_CHAINS = [...new Map(
        Payments.filter(c => !isFiatChain(c.chain)).map(c => [c.chain, c])
    ).values()]

    const ALL_TOKENS = [...new Map(
        EVM_CHAINS.flatMap(c => c.tokenList).map(t => [t.name, t])
    ).values()]

    // Seeds a blank crypto method so the form is never empty — only where
    // crypto payments exist. Without them there is nothing valid to seed.
    useEffect(() => {
        if (!paymentMethods.length && CRYPTO_PAYMENT_ENABLED) {
            setPaymentMethods([{
                ...emptyPaymentMethod,
                token_name: ALL_TOKENS[0].name,
                price: 10 ** ALL_TOKENS[0].decimals
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
            setPaymentMethods(paymentMethods.filter((_, i) => i !== index))
        }
    }

        const toggleChain = (pmIndex: number, chainOpt: PaymentsType, p: PaymentMethodDraft) => {
        const currentChains = [...(p.chains || [])]
        const addresses: Record<string, string> = {...(p.chain_token_addresses || {})}
        const idx = currentChains.indexOf(chainOpt.chain)
        if (idx >= 0) {
            currentChains.splice(idx, 1)
            delete addresses[chainOpt.chain]
        } else {
            currentChains.push(chainOpt.chain)
            if (!addresses[chainOpt.chain]) {
                const defaultToken = chainOpt.tokenList.find(t => t.name === p.token_name) || chainOpt.tokenList[0]
                addresses[chainOpt.chain] = defaultToken?.contract || ''
            }
        }
        setPaymentMethods(paymentMethods.map((pm, i) => i === pmIndex ? {
            ...pm,
            chains: currentChains,
            chain_token_addresses: addresses,
        } : pm))
    }

    const changeToken = (pmIndex: number, token: PaymentSettingToken, p: PaymentMethodDraft) => {
        const newAddresses = {...(p.chain_token_addresses || {})}
        ;(p.chains || []).forEach(chain => {
            const chainConfig = EVM_CHAINS.find(c => c.chain === chain)
            const tokenConfig = chainConfig?.tokenList.find(t => t.name === token.name)
            if (tokenConfig) newAddresses[chain] = tokenConfig.contract
        })
        setPaymentMethods(paymentMethods.map((pm, i) => i === pmIndex ? {
            ...pm,
            token_name: token.name,
            chain_token_addresses: newAddresses
        } : pm))
    }

    const setChainTokenAddress = (pmIndex: number, chain: string, value: string) => {
        setPaymentMethods(paymentMethods.map((pm, i) => i === pmIndex ? {
            ...pm,
            chain_token_addresses: {...(pm.chain_token_addresses || {}), [chain]: value}
        } : pm))
    }

    const addNewPaymentMethod = () => {
        setPaymentMethods([...paymentMethods, {
            ...emptyPaymentMethod,
            token_name: ALL_TOKENS[0].name,
            price: 10 ** ALL_TOKENS[0].decimals
        }])
    }

    // A card method is its own entry (chain 'stripe', price in cents) — never
    // mixed into a crypto method's chains, whose price unit differs.
    const addStripePaymentMethod = () => {
        setPaymentMethods([...paymentMethods, {
            ...emptyPaymentMethod,
            chain: 'stripe',
            kind: 'fiat',
            token_name: 'USD',
            currency: 'usd',
            price: 400,
            stripe_setting_id: stripeSettings.length === 1 ? stripeSettings[0].id : null
        }])
    }
    const hasStripeMethod = paymentMethods.some(p => p.chain === 'stripe' && !p._destroy)

    // Its own entry too, for the same reason the card one is: the price is 分,
    // which cannot share a row with a token amount. No merchant picker — CN
    // has exactly one and the backend attaches it.
    const addWechatPaymentMethod = () => {
        setPaymentMethods([...paymentMethods, {
            ...emptyPaymentMethod,
            chain: 'wechat',
            kind: 'fiat',
            token_name: 'CNY',
            currency: 'cny',
            // ¥1. WeChat has no fixed per-charge fee, so unlike the card rail
            // there is no floor to respect beyond 1分.
            price: 100
        }])
    }
    const hasWechatMethod = paymentMethods.some(p => p.chain === 'wechat' && !p._destroy)

    return <div>
        {
            paymentMethods
                .filter(p => !p._destroy)
                .map((p, index) => {
                    const currToken = ALL_TOKENS.find(t => t.name === p.token_name) || ALL_TOKENS[0]

                    if (p.chain === 'stripe') {
                        const currSetting = stripeSettings.find(s => s.id === p.stripe_setting_id)
                        return <div key={index} className="border border-gray-200 p-3 rounded-lg mb-3">
                            <div className="mb-2 text-sm font-semibold flex-row-item-center">
                                <img src="/images/payment_icon/stripe.png" className="w-5 h-5 rounded-full mr-2" alt=""/>
                                {lang['Card Payment (Stripe)']}
                                {currSetting?.mode === 'test' &&
                                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-700">{lang['TEST MODE']}</span>}
                            </div>
                            <div className="flex-row-item-center text-sm mb-3 whitespace-nowrap">
                                {/* From the method, not hardcoded: a fiat rail
                                    settles in its own currency and the amount
                                    below is minor units of THAT one. */}
                                <div>{lang['Price']} ({(p.currency || 'usd').toUpperCase()})</div>
                                <Input type="number"
                                       value={!!p.price || Number(p.price) === 0 ? p.price / 100 : ''}
                                       onWheel={e => e.currentTarget.blur()}
                                       inputSize={'md'}
                                       onChange={e => setPaymentMethods(paymentMethods.map((pm, i) => i === index ? {
                                           ...pm,
                                           price: Math.round(parseFloat(e.target.value) * 100) || 0
                                       } : pm))}
                                       className="ml-2"/>
                            </div>
                            {!!props.errors?.[index]?.price &&
                                <div className="err-msg text-red-400 mb-2 text-xs">{props.errors?.[index]?.price}</div>
                            }
                            <div className="flex-row-item-center text-sm">
                                <div className="whitespace-nowrap">{lang['Select a Stripe key']}</div>
                                <div className="ml-2 flex-1">
                                    <DropdownMenu
                                        options={stripeSettings}
                                        value={currSetting ? [currSetting] : []}
                                        onSelect={(option: StripeSetting[]) => setPaymentMethods(paymentMethods.map((pm, i) => i === index ? {
                                            ...pm,
                                            stripe_setting_id: option[0].id
                                        } : pm))}
                                        renderOption={(option) => (
                                            <div className="flex-row-item-center">
                                                <div>{option.name}</div>
                                                <div className="ml-2 text-gray-400">{option.masked_key}</div>
                                                {option.mode === 'test' && <div className="ml-2 text-xs text-amber-600">{lang['TEST MODE']}</div>}
                                            </div>
                                        )}
                                        valueKey={'id'}>
                                        <Input
                                            type="text"
                                            readOnly
                                            value={currSetting ? `${currSetting.name} ${currSetting.masked_key}` : ''}
                                            placeholder={lang['Select a Stripe key']}
                                            inputSize={'md'}
                                            className="cursor-pointer w-full"
                                            endAdornment={<i className="uil-angle-down text-lg"/>}
                                        />
                                    </DropdownMenu>
                                </div>
                                <i onClick={() => handleRemovePaymentMethod(index)}
                                   className="uil-minus-circle text-2xl text-gray-500 cursor-pointer ml-2"/>
                            </div>
                            {!!props.errors?.[index]?.receiver_address &&
                                <div className="err-msg text-red-400 mt-2 text-xs">{props.errors?.[index]?.receiver_address}</div>
                            }
                            {!stripeSettings.length &&
                                <div className="text-xs text-gray-500 mt-2">{lang['Stripe keys intro']}</div>
                            }
                        </div>
                    }

                    if (p.chain === 'wechat') {
                        // Simpler than the card block by one control: there is
                        // no merchant to choose. CN collects to a single
                        // platform merchant, which the backend attaches.
                        return <div key={index} className="border border-gray-200 p-3 rounded-lg mb-3">
                            <div className="mb-2 text-sm font-semibold flex-row-item-center">
                                <img src="/images/payment_icon/wechat_pay.svg" className="w-5 h-5 rounded-sm mr-2" alt=""/>
                                {lang['WeChat Pay']}
                            </div>
                            <div className="flex-row-item-center text-sm">
                                <div>{lang['Price']} (CNY)</div>
                                <Input type="number"
                                       value={!!p.price || Number(p.price) === 0 ? p.price / 100 : ''}
                                       onWheel={e => e.currentTarget.blur()}
                                       inputSize={'md'}
                                       onChange={e => setPaymentMethods(paymentMethods.map((pm, i) => i === index ? {
                                           ...pm,
                                           // Stored in 分, shown in 元 — the same
                                           // minor-unit convention as the card rail.
                                           price: Math.round(parseFloat(e.target.value) * 100) || 0
                                       } : pm))}
                                       className="ml-2"/>
                                <i onClick={() => handleRemovePaymentMethod(index)}
                                   className="uil-minus-circle text-2xl text-gray-500 cursor-pointer ml-2"/>
                            </div>
                            {!!props.errors?.[index]?.price &&
                                <div className="err-msg text-red-400 mt-2 text-xs">{props.errors?.[index]?.price}</div>
                            }
                            <div className="text-xs text-gray-500 mt-2">{lang['WeChat Pay intro']}</div>
                        </div>
                    }

                    return <div key={index} className="border border-gray-200 p-3 rounded-lg mb-3">
                        <div className="mb-2 text-sm font-semibold">{lang['Payment']} {index + 1}</div>
                        <div className="flex-row-item-center">
                            <div className="mr-1 flex-1">
                                <div className="flex-row-item-center flex-1 text-sm mb-3 whitespace-nowrap">
                                    <div>{lang['Price']}</div>
                                    <div className="ml-2">
                                        <DropdownMenu
                                            options={ALL_TOKENS}
                                            value={[currToken]}
                                            onSelect={(option: PaymentSettingToken[]) => changeToken(index, option[0], p)}
                                            renderOption={(option) => (
                                                <div className="flex-row-item-center">
                                                    <img src={option.icon} className="w-5 h-5 rounded-full mr-2" alt=""/>
                                                    <div>{option.name}</div>
                                                </div>
                                            )}
                                            valueKey={'name'}>
                                            <Input
                                                type="text"
                                                readOnly
                                                value={p.token_name || ''}
                                                inputSize={'md'}
                                                className="cursor-pointer"
                                                endAdornment={<i className="uil-angle-down text-lg"/>}
                                                startAdornment={<img src={currToken.icon} className="w-5 h-5 rounded-full" alt=""/>}
                                            />
                                        </DropdownMenu>
                                    </div>
                                    <Input type="number"
                                           value={!!p.price || Number(p.price) === 0 ? p.price / 10 ** currToken.decimals : ''}
                                           onWheel={e => e.currentTarget.blur()}
                                           inputSize={'md'}
                                           onChange={e => setPaymentMethods(paymentMethods.map((p, i) => i === index ? {
                                               ...p,
                                               price: Math.round(parseFloat(e.target.value) * 10 ** currToken.decimals) || 0
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
                                        className="ml-2 flex-1"/>
                                </div>
                                {!!props.errors?.[index]?.receiver_address &&
                                    <div className="err-msg text-red-400 mt-2 text-xs">{props.errors?.[index]?.receiver_address}</div>
                                }

                                <div className="mt-3">
                                    <div className="text-xs text-gray-500 mb-2">Chains</div>
                                    {EVM_CHAINS.map(chainOpt => {
                                        const isChecked = (p.chains || []).includes(chainOpt.chain)
                                        return <div key={chainOpt.chain} className="mb-2">
                                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                                                <input type="checkbox" checked={isChecked}
                                                    onChange={() => toggleChain(index, chainOpt, p)}/>
                                                <img src={chainOpt.chainIcon} className="w-4 h-4 rounded-full" alt=""/>
                                                <span>{chainOpt.label}</span>
                                            </label>
                                            {isChecked && <Input
                                                placeholder="Token contract address"
                                                value={(p.chain_token_addresses || {})[chainOpt.chain] || ''}
                                                onChange={e => setChainTokenAddress(index, chainOpt.chain, e.target.value)}
                                                inputSize={'md'}
                                                className="mt-1 ml-6 flex-1"/>}
                                        </div>
                                    })}
                                </div>
                            </div>
                            {index === paymentMethods.length - 1 && CRYPTO_PAYMENT_ENABLED &&
                                <i onClick={addNewPaymentMethod}
                                   className="uil-plus-circle text-2xl text-green-500 cursor-pointer"/>
                            }
                            <i onClick={() => handleRemovePaymentMethod(index)}
                               className="uil-minus-circle text-2xl text-gray-500 cursor-pointer"/>
                        </div>
                    </div>
                })
        }
        {STRIPE_ENABLED && !hasStripeMethod &&
            <Button variant={'secondary'} size={'sm'} onClick={addStripePaymentMethod}>
                <img src="/images/payment_icon/stripe.png" className="w-4 h-4 rounded-full mr-1" alt=""/>
                {lang['Add card payment']}
            </Button>
        }
        {WECHAT_PAY_ENABLED && !hasWechatMethod &&
            <Button variant={'secondary'} size={'sm'} onClick={addWechatPaymentMethod}>
                <img src="/images/payment_icon/wechat_pay.svg" className="w-4 h-4 rounded-sm mr-1" alt=""/>
                {lang['Add WeChat payment']}
            </Button>
        }
    </div>
}
