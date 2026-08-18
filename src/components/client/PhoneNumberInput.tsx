'use client'

import {Input} from '@/components/shadcn/Input'

/**
 * Mainland mobile numbers, the only ones SMS sign-in accepts. Deliberately the
 * same shape as soon's CN_MOBILE — the backend re-validates and owns the real
 * verdict; this only catches a typo before spending a text message on it.
 *
 * Widening this is not a frontend change: the Aliyun 签名 and 模板 are domestic,
 * so an international number would be accepted, billed and then rejected by
 * the gateway.
 */
export const CN_MOBILE_RE = /^1[3-9]\d{9}$/

/** Strips what people type between the digits, so the regex sees just digits. */
export const stripPhone = (value: string) => value.replace(/[\s\-()]/g, '')

/**
 * The shared +86 number field: sign-in and the bind step ask for exactly the
 * same thing, and a second copy of the country prefix and the input mode is a
 * second place for them to drift.
 *
 * inputMode="numeric" matters more here than it looks — on the WeChat browser,
 * which is where most of these are typed, it is what brings up the digit pad.
 */
export default function PhoneNumberInput({value, onChange, onEnter, invalid, autoFocus, placeholder, endAdornment}: {
    value: string
    onChange: (value: string) => void
    onEnter?: () => void
    invalid?: boolean
    autoFocus?: boolean
    placeholder?: string
    endAdornment?: React.ReactNode
}) {
    return <Input
        className={`w-full shadow-xs ${invalid ? 'border-red-400' : ''}`}
        type="tel"
        name="phone"
        autoComplete="tel"
        inputMode="numeric"
        maxLength={13}
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
            if (e.key === 'Enter') onEnter?.()
        }}
        startAdornment={<span className="text-gray-400 whitespace-nowrap select-none">+86</span>}
        endAdornment={endAdornment}/>
}
