import {SolaSdkFunctionParams} from '../types'
import {getGqlClient, getSdkConfig} from '../client'
import {Participant, PaymentMethod, TicketItem} from './types'
import {
    genDaimoLink,
    GET_EVENT_DETAIL_BY_ID,
    GET_PURCHASED_TICKET_ITEMS_BY_PROFILE_HANDLE_AND_EVENT_ID
} from '@sola/sdk'

export interface TicketPayment {
    authToken: string,
    eventId: number,
    ticketId: number,
    paymentMethodId?: number,
    coupon?: string
}

export const createTicketPayment = async ({params, clientMode}: SolaSdkFunctionParams<TicketPayment>) => {
    const props = {
        auth_token: params.authToken,
        id: params.eventId,
        ticket_id: params.ticketId,
        payment_method_id: params.paymentMethodId,
        coupon: params.coupon
    }

    const res = await fetch(`${getSdkConfig(clientMode).api}/ticket/rsvp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(props)
    })

    if (!res.ok) {
        throw new Error('Failed to create ticket payment')
    }

    const data = await res.json()

    return {
        participant: data.participant as Participant,
        ticketItem: data.ticket_item as TicketItem
    }
}

export interface CreateDaimoOrderProps {
    eventId: number,
    authToken: string,
    paymentMethod: PaymentMethod,
    coupon?: string
    redirectUri?: string
}

export const createDaimoOrder = async ({params, clientMode}: SolaSdkFunctionParams<CreateDaimoOrderProps>) => {
    const {ticketItem, participant} = await createTicketPayment({
        params: {
            authToken: params.authToken,
            eventId: params.eventId,
            ticketId: params.paymentMethod.item_id!,
            coupon: params.coupon,
            paymentMethodId: params.paymentMethod.id
        },
        clientMode,
    })

    const {id, url} = await genDaimoLink({
        params: {
            ticketItemId: ticketItem.id,
            authToken: params.authToken,
            redirectUri: params.redirectUri
        },
        clientMode
    })

    return {
        id,
        url,
        participant,
        ticketItem
    }
}

export const getPurchasedTicketItemsByProfileHandleAndEventId = async ({params, clientMode}: SolaSdkFunctionParams<{profileHandle: string, eventId: number}>) => {
    const client = getGqlClient(clientMode)

    const response = await client.query({
        query: GET_PURCHASED_TICKET_ITEMS_BY_PROFILE_HANDLE_AND_EVENT_ID,
        variables: {profileHandle: params.profileHandle, eventId: params.eventId}
    })

    return response.data.ticket_items as TicketItem[]
}