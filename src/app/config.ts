import {ClientMode} from '@sola/sdk'
import {PaymentsType} from '@/utils/payment_setting'

export const CLIENT_MODE = process.env.NEXT_PUBLIC_CLIENT_MODE! as ClientMode

export const AVAILABLE_PAYMENT_TYPES = ['daimo_op', 'daimo_base']