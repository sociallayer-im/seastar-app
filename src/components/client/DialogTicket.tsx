import {
    ProfileDetail,
    Ticket,
    TicketItem,
    EventDetail,
    BadgeClassDetail,
    checkBadgeOwnership,
    cancelUnpaidItem,
    createTicketPayment,
    createStripeCheckoutSession,
    createWechatPrepay,
    getBadgeClassDetailByBadgeClassId,
    getGroupDetailById,
    getProfileGroup,
    getPurchasedTicketItemsByProfileNameAndEventId,
    Group,
    SolaApiError,
    submitPaymentTxHash,
    validateCoupon
} from '@sola/sdk'
import {Dictionary} from '@/lang'
import {
    cfImage,
    clientToSignIn,
    displayMethodPrice,
    formatEventTime,
    getAuth,
    shortWalletAddress
} from '@/utils'
import {useEffect, useMemo, useState} from 'react'
import {useRouter} from 'next/navigation'
import {isFiatChain, Payments, PaymentSettingToken, PaymentsType} from '@/utils/payment_setting'
import {executePayHubPayment, PAYMENT_STEP_LABEL, PaymentStep, resolveTokenAddress, tsidToBigInt} from '@/utils/evm_payment'
import {invokeWechatPay, isMobileWechatBrowser} from '@/utils/wechat_pay'
import DropdownMenu from '@/components/client/DropdownMenu'
import {Input} from '@/components/shadcn/Input'
import {Button} from '@/components/shadcn/Button'
import useModal from '@/components/client/Modal/useModal'
import {CLIENT_MODE, CRYPTO_PAYMENT_ENABLED, STRIPE_ENABLED, WECHAT_PAY_ENABLED} from '@/app/config'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {Switch} from '@/components/shadcn/Switch'

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

    const [badgeCollected, setBadgeCollected] = useState<boolean>(false)
    const [checkingBadgeCollected, setCheckingCheckBadgeCollected] = useState<boolean>(false)
    const [buying, setBuying] = useState<boolean>(false)

    const [pendingTicketItem, setPendingTicketItem] = useState<TicketItem | null>(null)
    const [paymentStep, setPaymentStep] = useState<PaymentStep>('idle')
    /** Money has left; we are waiting for the server to agree. */
    const [confirming, setConfirming] = useState<boolean>(false)

    /**
     * Whether WeChat Pay can actually run here — `null` until we know.
     *
     * Resolved in an effect rather than read inline, because the answer comes
     * from the user agent: on the server it is always false, so reading it
     * during render would make the client's first paint disagree with the
     * markup it hydrates. The third state matters for what that costs: seeded
     * `false`, a buyer who IS in mobile WeChat would see the "open this in
     * WeChat" warning flash at them before the effect corrected it. Unknown
     * disables the button (invisible for one tick) and shows nothing.
     */
    const [wechatPayReady, setWechatPayReady] = useState<boolean | null>(null)
    useEffect(() => { setWechatPayReady(isMobileWechatBrowser()) }, [])

    const router = useRouter()

    /**
     * Ends a successful purchase without a document navigation.
     *
     * router.refresh() re-runs the page's server components in place, so the
     * ticket list and the RSVP state update while the modal, the scroll
     * position and — inside WeChat — the webview's own history all survive.
     *
     * The flow this replaces did two full page loads after the money had
     * already moved: one to add ?payment=success, another to strip it again
     * once polling finished. In the in-app browser that reads as the page
     * flickering twice at the exact moment a buyer most wants reassurance.
     */
    const settleInPlace = () => {
        toast({description: lang['Purchase Successful'], variant: 'success'})
        router.refresh()
        setTimeout(() => close(), 1200)
    }

    /**
     * Polls until the order is confirmed SERVER-side. Both fiat rails hand
     * back a client-side "success" that proves nothing — only the provider's
     * callback (or the sweeper) settles an order — so this is what the buyer
     * actually waits on.
     *
     * Returns false on timeout, which is not a failure: the callback may still
     * be in flight and the sweeper will settle it either way. Nothing is
     * cancelled on that path.
     */
    const waitForConfirmation = async (ticketItemId: string, attempts = 40) => {
        if (!currProfile) return false

        for (let i = 0; i < attempts; i++) {
            await new Promise(resolve => setTimeout(resolve, 3000))
            try {
                const items = await getPurchasedTicketItemsByProfileNameAndEventId({
                    params: {profileName: currProfile.name, eventId: eventDetail.id, authToken: getAuth()!},
                    clientMode: CLIENT_MODE
                })
                if (items.some(item => item.id === ticketItemId)) return true
            } catch (e) {
                // A dropped poll is not an answer — keep asking.
                console.error(e)
            }
        }
        return false
    }

    const [enablePromoCode, setEnablePromoCode] = useState<boolean>(false)
    const [promoCode, setPromoCode] = useState<string>('')
    const [validPromoCode, setValidPromoCode] = useState<string | undefined>(undefined)
    const [discountedPrice, setDiscountedPrice] = useState<number | null>(500000)
    const [promoCodeError, setPromoCodeError] = useState<string>('')

    const toggleEnablePromoCode = () => {
        setPromoCode('')
        setValidPromoCode(undefined)
        setDiscountedPrice(null)
        setPromoCodeError('')
        setEnablePromoCode(!enablePromoCode)
    }

    useEffect(() => {
        setPromoCode('')
        setValidPromoCode(undefined)
        setDiscountedPrice(null)
        setPromoCodeError('')
    }, [])

    const [checkBadgeClass, setCheckBadgeClass] = useState<BadgeClassDetail | null>(null)

    useEffect(() => {
        ;(async () => {
            if (!ticket.check_badge_class_id) {
                setBadgeCollected(true)
            } else if (currProfile) {
                setCheckingCheckBadgeCollected(true)
                try {
                    const [collected, badgeClass] = await Promise.all([
                        checkBadgeOwnership({
                            params: {name: currProfile.name, badgeClassId: ticket.check_badge_class_id},
                            clientMode: CLIENT_MODE
                        }),
                        getBadgeClassDetailByBadgeClassId({
                            params: {badgeClassId: ticket.check_badge_class_id},
                            clientMode: CLIENT_MODE
                        })
                    ])
                    setBadgeCollected(collected)
                    setCheckBadgeClass(badgeClass)
                } catch (e: unknown) {
                    console.error(e)
                    toast({
                        description: e instanceof Error ? e.message : 'Failed to check badge ownership',
                        variant: 'destructive'
                    })
                } finally {
                    setCheckingCheckBadgeCollected(false)
                }
            }
        })()
    }, [ticket.check_badge_class_id, currProfile])

    // Membership gate: eligible when the ticket lists no groups, or the signed-in
    // profile belongs to ANY of them. The server enforces this on rsvp too —
    // this is display only.
    const gated = !!ticket.check_group_ids?.length
    const [memberEligible, setMemberEligible] = useState<boolean>(!gated)
    const [gateGroups, setGateGroups] = useState<Group[]>([])
    useEffect(() => {
        ;(async () => {
            if (!gated) return
            try {
                const details = await Promise.all(ticket.check_group_ids!.map(groupId =>
                    getGroupDetailById({params: {groupId}, clientMode: CLIENT_MODE}).catch(() => null)))
                setGateGroups(details.filter(g => !!g) as Group[])
                if (currProfile) {
                    const mine = await getProfileGroup({params: {profileName: currProfile.name}, clientMode: CLIENT_MODE})
                    setMemberEligible((mine || []).some(g => ticket.check_group_ids!.includes(g.id)))
                }
            } catch (e: unknown) {
                console.error(e)
            }
        })()
    }, [ticket.check_group_ids, currProfile])

    const soldOut = ticket.quantity === 0

    const stopSelling = ticket.end_time && new Date(ticket.end_time).getTime() < new Date().getTime()

    const paymentTypes = useMemo(() => {
        if (!ticket.payment_methods) return []

        // Use chains[] (canonical); fall back to [chain] for legacy single-chain methods.
        // Protocol is method-level, not per-chain — don't filter Payments by protocol here.
        const seen = new Set<string>()
        const result: PaymentsType[] = []
        ticket.payment_methods.forEach(method => {
            const effectiveChains = method.chains?.length ? method.chains : (method.chain ? [method.chain] : [])
            effectiveChains.forEach(chain => {
                if (seen.has(chain)) return
                // Card payments only exist on STRIPE_ENABLED deployments (SG).
                if (chain === 'stripe' && !STRIPE_ENABLED) return
                // WeChat Pay is the mirror image: CN only.
                if (chain === 'wechat' && !WECHAT_PAY_ENABLED) return
                // Everything that is not a fiat rail is an on-chain EVM
                // payment, off on CN.
                if (!isFiatChain(chain) && !CRYPTO_PAYMENT_ENABLED) return
                const type = Payments.find(p => p.chain === chain)
                if (type) { seen.add(chain); result.push(type) }
            })
        })
        return result
    }, [ticket.payment_methods])

    const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentsType | undefined>(paymentTypes[0])

    useEffect(() => {
        setSelectedPaymentType(prev => prev ?? paymentTypes[0])
    }, [paymentTypes])

    const tokens = useMemo(() => {
        if (!ticket.payment_methods || !selectedPaymentType || !selectedPaymentType.tokenList) return []

        // Find methods that cover the selected chain (protocol is method-level, not per-chain)
        const methodsForChain = ticket.payment_methods.filter(method => {
            const effectiveChains = method.chains?.length ? method.chains : (method.chain ? [method.chain] : [])
            return effectiveChains.includes(selectedPaymentType.chain)
        })

        return selectedPaymentType.tokenList.filter(token =>
            methodsForChain.some(method => method.token_name === token.name)
        )
    }, [selectedPaymentType, ticket.payment_methods])

    const [selectedToken, setSelectedToken] = useState<PaymentSettingToken | undefined>(tokens[0])

    useEffect(() => {
        setSelectedToken(tokens[0])
    }, [tokens])

    const selectedMethod = useMemo(() => {
        if (!selectedPaymentType || !selectedToken) return undefined

        return (ticket.payment_methods || []).find(method => {
            const effectiveChains = method.chains?.length ? method.chains : (method.chain ? [method.chain] : [])
            return effectiveChains.includes(selectedPaymentType.chain) &&
                method.token_name === selectedToken.name
        })
    }, [selectedPaymentType, selectedToken, ticket.payment_methods])

    const handlePurchaseForFree = async () => {
        if (!currProfile) return
        setPaymentError('')

        const loading = showLoading()
        setBuying(true)
        try {
            const authToken = getAuth()
            const res = await createTicketPayment({
                params: {
                    eventId: eventDetail.id,
                    authToken: authToken!,
                    ticketId: ticket.id,
                },
                clientMode: CLIENT_MODE
            })

            settleInPlace()
        } catch (e: unknown) {
            console.error(e)
            setBuying(false)
            setPaymentError(e instanceof Error ? e.message : 'Failed to purchase')
        } finally {
            closeModal(loading)
        }
    }

    const handleCheckPromoCode = async () => {
        setPromoCodeError('')
        if (!promoCode) {
            setPromoCodeError(lang['Promo Code Required'])
            return
        }
        const loading = showLoading()
        try {
            const authToken = getAuth()
            const {coupon, price} = await validateCoupon({
                params: {
                    coupon: promoCode,
                    eventId: eventDetail.id,
                    price: selectedMethod!.price!,
                    methodId: selectedMethod!.id!
                },
                clientMode: CLIENT_MODE
            })

            setValidPromoCode(promoCode)
            setDiscountedPrice(price)
        } catch (e: unknown) {
            console.error(e)
            setPromoCodeError('Invalid Promo Code')
        } finally {
            closeModal(loading)
        }
    }

    const handleEVMPayment = async (ticketItem: TicketItem) => {
        if (!selectedMethod || !selectedPaymentType) return
        setPaymentError('')
        try {
            const chain = selectedPaymentType.chain
            const tokenAddress = resolveTokenAddress(selectedMethod, chain)
            const payHubAddress = selectedPaymentType.payHub
            if (!tokenAddress) throw new Error('Token address not found for this chain')
            if (!payHubAddress) throw new Error('PayHub address not found for this chain')

            const {txHash, account} = await executePayHubPayment({
                chain,
                tokenAddress,
                payHubAddress,
                receiverAddress: selectedMethod.receiver_address!,
                amount: BigInt(ticketItem.amount ?? 0),
                eventId: ticketItem.event_id || eventDetail.id,
                orderNumber: tsidToBigInt(ticketItem.id),
                onStep: setPaymentStep,
            })

            setPaymentStep('verifying')
            const authToken = getAuth()
            await submitPaymentTxHash({
                params: {ticketItemId: ticketItem.id, txhash: txHash, senderAddress: account, authToken: authToken!},
                clientMode: CLIENT_MODE
            })
            setPaymentStep('done')
            settleInPlace()
        } catch (e: unknown) {
            console.error(e)
            setPaymentError(e instanceof Error ? e.message : 'Payment failed')
            setPaymentStep('error')
        }
    }

    /**
     * Hands an order back when we know for certain nothing was paid for it.
     *
     * Only ever called where that certainty exists — the sheet was never
     * drawn. Cancelling releases the ticket unit and the coupon usage and
     * withdraws the participant, so the buyer can immediately try again
     * somewhere the payment works, instead of being told "you already have an
     * unpaid order for this ticket" for the next 35 minutes.
     *
     * Best effort: if it fails the sweeper still expires the order, so there is
     * nothing useful to tell the buyer about it.
     */
    const releaseUnpaidOrder = async (ticketItem: TicketItem) => {
        setPendingTicketItem(null)
        try {
            await cancelUnpaidItem({
                params: {ticketItemId: ticketItem.id, authToken: getAuth()!},
                clientMode: CLIENT_MODE
            })
        } catch (e) {
            console.error('[releaseUnpaidOrder]', e)
        }
    }

    /**
     * WeChat Pay, which unlike Stripe never leaves the page: the payment sheet
     * is drawn over it by the WeChat client and hands control straight back.
     *
     * Whatever it reports, the browser does not decide payment state — on 'ok'
     * this navigates to the event page's ?payment=success return, which polls
     * the server until the callback (or the sweeper) has confirmed. And on
     * 'fail' it cancels nothing: a failed sheet is not proof no money moved.
     */
    const payWithWechat = async (ticketItem: TicketItem) => {
        // Unreachable via handlePay, which checks first — kept because the
        // environment can change under a long-lived dialog, and reaching it
        // with an order in hand must not strand that order.
        if (!isMobileWechatBrowser()) {
            await releaseUnpaidOrder(ticketItem)
            setPaymentError(lang['Open in WeChat to pay'])
            setBuying(false)
            return
        }

        let payParams
        try {
            const res = await createWechatPrepay({
                params: {ticketItemId: ticketItem.id, authToken: getAuth()!},
                clientMode: CLIENT_MODE
            })
            payParams = res.pay_params
        } catch (e: unknown) {
            // Recoverable, and the only failure here that is: the buyer signed
            // in by email, so the account has no openid and JSAPI cannot place
            // an order. A silent snsapi_base authorize fills it in and returns
            // them here to try again.
            if (e instanceof SolaApiError && e.code === 'OPENID_REQUIRED') {
                const back = encodeURIComponent(window.location.pathname + window.location.search)
                window.location.href = `/api/wechat/bind-openid?return=${back}`
                return
            }
            throw e
        }

        const outcome = await invokeWechatPay(payParams)
        if (outcome === 'cancel') {
            setPaymentError(lang['Payment cancelled'])
            setBuying(false)
            return
        }
        if (outcome === 'unavailable') {
            // 'unavailable' means the bridge never arrived, so
            // getBrandWCPayRequest was never invoked and no sheet was ever
            // drawn — no money can have moved. That is the one outcome where
            // cancelling is provably safe, and it hands the seat back now
            // instead of in 35 minutes.
            await releaseUnpaidOrder(ticketItem)
            setPaymentError(lang['Open in WeChat to pay'])
            setBuying(false)
            return
        }
        if (outcome === 'fail') {
            // Deliberately does NOT cancel the order: the sheet DID open, so it
            // may have failed after the money moved. The sweeper expires it.
            setPaymentError(lang['Payment failed, please try again'])
            setBuying(false)
            return
        }

        // 'ok' only means the sheet closed cleanly — it is the browser's word,
        // and it races the callback either way. So wait for the server here
        // rather than navigating anywhere and claiming success.
        setConfirming(true)
        const confirmed = await waitForConfirmation(ticketItem.id)
        setConfirming(false)

        if (confirmed) {
            settleInPlace()
            return
        }
        // Slow, not lost. The callback may still land, and the sweeper
        // reconciles against WeChat regardless — so the one thing not to
        // suggest is paying again.
        setPaymentError(lang['Payment confirming slowly'])
        setBuying(false)
    }

    const handlePay = async () => {
        if (!currProfile || !selectedMethod) return
        // Checked BEFORE the order is created, which is the whole point: this
        // used to be discovered inside payWithWechat, by which time an order
        // already existed, holding a ticket unit and blocking any retry for
        // the 35 minutes it took the sweeper to expire it. A buyer on a laptop
        // could not buy, and could not stop not-buying either.
        if (selectedPaymentType?.chain === 'wechat' && !wechatPayReady) {
            setPaymentError(lang['Open in WeChat to pay'])
            return
        }
        setPaymentError('')
        const loading = showLoading()
        setBuying(true)
        try {
            const authToken = getAuth()
            const {ticketItem} = await createTicketPayment({
                params: {
                    eventId: eventDetail.id,
                    authToken: authToken!,
                    ticketId: ticket.id,
                    paymentMethodId: selectedMethod.id,
                    coupon: validPromoCode,
                    chain: selectedPaymentType?.chain
                },
                clientMode: CLIENT_MODE
            })
            setPendingTicketItem(ticketItem)

            // A 100% coupon can make any fiat order free-and-confirmed with
            // nothing left to pay — treat like the free path.
            if (isFiatChain(selectedPaymentType?.chain) && ticketItem.status === 'succeeded') {
                closeModal(loading)
                settleInPlace()
                return
            }

            if (selectedPaymentType?.chain === 'wechat') {
                // Drop the loading overlay BEFORE the sheet opens: everything
                // after this point — the sheet itself, then the confirmation
                // wait — reports progress inside the dialog, and an overlay
                // sitting on top of it for up to two minutes would hide
                // exactly the reassurance the buyer is waiting for.
                closeModal(loading)
                await payWithWechat(ticketItem)
                return
            }

            if (selectedPaymentType?.chain === 'stripe') {
                // Everything else happens on Stripe's hosted page; the return
                // URL lands back on the event page, which polls until the
                // webhook confirms. Never mark paid client-side.
                const {checkout_url} = await createStripeCheckoutSession({
                    params: {ticketItemId: ticketItem.id, authToken: authToken!},
                    clientMode: CLIENT_MODE
                })
                window.location.href = checkout_url
                return
            }

            closeModal(loading)
            await handleEVMPayment(ticketItem)
        } catch (e: unknown) {
            console.error(e)
            setPaymentError(e instanceof Error ? e.message : 'Failed to initiate payment')
            setBuying(false)
            closeModal(loading)
        }
    }

    const priceDiff = useMemo(() => {
        if (discountedPrice === null || !selectedMethod || !selectedToken) return 0
        return (selectedMethod.price - discountedPrice) / 10 ** selectedToken.decimals
    }, [discountedPrice, selectedMethod, selectedToken])

    return <div
        className="bg-background sm:p-4 p-3 rounded-lg shadow max-h-[100svh] overflow-y-auto w-[96vw] sm:w-[400px]">
        <div className="flex-row-item-center justify-between mb-6">
            <div className="font-semibold text-xl">{lang['Ticket Detail']}</div>
            <i className="uil-times-circle cursor-pointer text-xl text-gray-400" onClick={close}/>
        </div>

        <div className="flex-row-item-center !items-start">
            <div className="flex-1 mr-3 grid grid-cols-1 gap-1">
                <div className="font-semibold text-lg">[{ticket.title}]</div>
                <div className="text-sm">
                    <i className="uil-calendar-alt mr-1"/>
                    {formatEventTime(eventDetail.start_time, eventDetail.timezone)}
                </div>
                {
                    !!eventDetail.place?.name &&
                    <div className='text-sm'><i className="uil-location-point mr-1"/>{eventDetail.place.name}</div>
                }
            </div>
            {!!eventDetail.image_url ?
                <div className="w-[80px] h-[80px]">
                    <img className="w-full h-full object-cover rounded-lg" src={cfImage(eventDetail.image_url, { width: 900, format: 'auto', quality: 85 })} alt=""/>
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
                        {!!eventDetail.place?.name &&
                            <div className="text-lg absolute font-semibold left-[76px] top-[240px]">
                                {eventDetail.place.name}
                            </div>
                        }
                    </div>
                </div>
            }
        </div>

        <div className="text-sm my-3 max-h-20 overflow-auto">
            {ticket.content || ''}
        </div>

        {checkingBadgeCollected && <div>
            <div className="my-3 border-t pt-2">
                <div className="font-semibold mb-2">{lang['Badge Needed']}</div>
                <div className="loading-bg h-4 w-full mb-2"></div>
                <div className="loading-bg h-4 w-[80%]"></div>
            </div>
        </div>}


        {!!checkBadgeClass && !checkingBadgeCollected &&
            <div className="my-3 border-t pt-2">
                <div className="font-semibold mb-2">{lang['Badge Needed']}</div>
                <div className="flex-row-item-center">
                    <img src={cfImage(checkBadgeClass!.image_url, { width: 120, height: 120, fit: 'cover' })}
                         className="w-12 h-12 rounded-full bg-gray-50 mr-3" alt=""/>
                    <div>
                        <div className="font-semibold">{checkBadgeClass!.title}</div>

                        {badgeCollected
                            ? <div className="text-sm text-green-500 flex-row-item-center">
                                <i className="uil-check-circle text-lg mr-1"/>
                                <div>Collected</div>
                            </div>
                            : <div className="text-sm text-red-400 flex-row-item-center">
                                <i className="uil-info-circle text-lg mr-1"/>
                                <div>Not Collected</div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        }

        {gated &&
            <div className="my-3 border-t pt-2">
                <div className="font-semibold mb-2">{lang['Members Only']}</div>
                <div className="text-sm mb-1">
                    {gateGroups.map(g => g.nickname || g.name).join(' / ')}
                </div>
                {memberEligible
                    ? <div className="text-sm text-green-500 flex-row-item-center">
                        <i className="uil-check-circle text-lg mr-1"/>
                        <div>{lang['You are a member']}</div>
                    </div>
                    : <div className="text-sm text-red-400 flex-row-item-center">
                        <i className="uil-info-circle text-lg mr-1"/>
                        <div>{lang['Members only ticket notice']}</div>
                    </div>
                }
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

                {/* Said here, next to the choice that causes it, rather than
                    after a failed press: WeChat Pay is the default rail on CN,
                    so a buyer on a laptop meets it without having chosen it. */}
                {selectedPaymentType.chain === 'wechat' && wechatPayReady === false &&
                    <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        {lang['Open in WeChat to pay']}
                    </div>
                }
            </div>
        }

        {!!selectedPaymentType &&
            <div className="my-3 border-t pt-3">
                <div className="flex-row-item-center justify-between">
                    <div className="font-semibold">{lang['Promo Code']}</div>
                    <Switch checked={enablePromoCode} onClick={toggleEnablePromoCode}/>
                </div>
                {enablePromoCode &&
                    <div className="flex-row-item-center gap-2 mt-2">
                        <Input placeholder={lang['Promo Code']}
                               value={promoCode}
                               inputSize={'md'}
                               className={'flex-1'}
                               onChange={(e) => setPromoCode(e.target.value)}/>
                        <Button variant={'normal'} size={'sm'}
                                onClick={handleCheckPromoCode}
                                className="text-sm !h-[38px]">{lang['Apply']}</Button>
                    </div>
                }
                {!!promoCodeError && <div className="mt-2 text-red-400 text-sm">{promoCodeError}</div>}
            </div>
        }

        {!!selectedPaymentType &&
            <div className="my-3 border-t pt-6">
                <div className="flex-row-item-center mb-3 justify-between">
                    <div className="mr-4 text-gray-500">{lang['Price']}</div>
                    <div className="font-bold text-pink-500 text-xl">
                        {!!selectedMethod ? <>
                            {displayMethodPrice(selectedMethod)} {selectedToken!.name}
                        </> : "--"}
                    </div>
                </div>
                {!!priceDiff &&
                    <>
                        <div className="flex-row-item-center mb-3 justify-between">
                            <div className="mr-4 text-gray-500">{lang['Discount']}</div>
                            <div>
                                -{priceDiff} {selectedToken!.name}
                            </div>
                        </div>
                        <div className="flex-row-item-center mb-3 justify-between">
                            <div className="mr-4 text-gray-500">{lang['Total']}</div>
                            <div className="font-bold text-pink-500 text-xl">
                                {discountedPrice! / 10 ** selectedToken!.decimals} {selectedToken!.name}
                            </div>
                        </div>
                    </>
                }
            </div>
        }

        {!currProfile && <Button
            onClick={clientToSignIn}
            variant={'special'} className="text-sm w-full">{lang['Sign In']}</Button>
        }

        {!ticket.payment_methods?.length && !!currProfile && !soldOut && !stopSelling &&
            <Button variant={'special'}
                    disabled={!badgeCollected || !memberEligible || checkingBadgeCollected || buying}
                    onClick={() => handlePurchaseForFree()}
                    className="text-sm w-full">{lang['Purchase for Free']}</Button>
        }

        {/* The money is gone and the server has not caught up yet. Showing this
            in place of the Pay button is the point: a second press here would
            create a second order for a seat already paid for. */}
        {confirming &&
            <div className="flex items-center justify-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"/>
                {lang['Payment processing']}
            </div>
        }

        {!!ticket.payment_methods?.length && !!currProfile && !soldOut && !stopSelling && !pendingTicketItem && !confirming &&
            <Button variant={'special'}
                    disabled={!badgeCollected || !memberEligible || checkingBadgeCollected || buying || !selectedMethod
                        || (selectedPaymentType?.chain === 'wechat' && !wechatPayReady)}
                    onClick={handlePay}
                    className="text-sm w-full">{lang['Pay']}</Button>
        }

        {!!pendingTicketItem && paymentStep !== 'done' && (
            <div className="my-3 border-t pt-3">
                {paymentStep !== 'idle' && paymentStep !== 'error' && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"/>
                        {PAYMENT_STEP_LABEL[paymentStep]}
                    </div>
                )}
                {(paymentStep === 'idle' || paymentStep === 'error') && (
                    <Button variant={'special'}
                            onClick={() => handleEVMPayment(pendingTicketItem)}
                            className="text-sm w-full">
                        {paymentStep === 'error' ? 'Retry Payment' : 'Pay with Wallet'}
                    </Button>
                )}
            </div>
        )}

        {soldOut &&
            <Button variant={'secondary'}
                    disabled
                    className="text-sm w-full">{lang['Sold Out']}</Button>
        }

        {stopSelling &&
            <Button variant={'secondary'}
                    disabled
                    className="text-sm w-full">{lang['Stop Selling']}</Button>
        }

        {!!paymentError && <div className="mt-3 text-red-400 text-sm">{paymentError}</div>}
    </div>
}