'use client'

import {useState} from 'react'
import {Dictionary} from '@/lang'
import EmailSignIn from '@/app/(auth)/signin/EmailSignIn'
import PhoneSignIn from '@/app/(auth)/signin/PhoneSignIn'

/**
 * The phone/email switch, rendered in place of the bare email field where SMS
 * sign-in exists (CN).
 *
 * Phone is the default tab, not email: on CN a mobile number is the identifier
 * people actually have, and the email field was only ever the fallback there.
 * Email stays reachable because CN accounts created before SMS existed sign in
 * with it, and taking it away would lock them out.
 *
 * Rendered as a switch rather than two stacked fields — two "Go" buttons with
 * no indication of which one applies is the thing this avoids.
 */
export default function PhoneOrEmailSignIn({lang}: {lang: Dictionary}) {
    const [tab, setTab] = useState<'phone' | 'email'>('phone')

    const tabClass = (active: boolean) =>
        `pb-2 text-sm font-medium border-b-2 duration-200 ${
            active ? 'border-primary' : 'border-transparent text-gray-400'
        }`

    return <div>
        <div className="flex flex-row gap-4 mb-3">
            <button type="button" className={tabClass(tab === 'phone')} onClick={() => setTab('phone')}>
                {lang['Phone number']}
            </button>
            <button type="button" className={tabClass(tab === 'email')} onClick={() => setTab('email')}>
                {lang['Email']}
            </button>
        </div>
        {/* Both stay mounted so switching back doesn't wipe what was typed. */}
        <div className={tab === 'phone' ? '' : 'hidden'}><PhoneSignIn lang={lang}/></div>
        <div className={tab === 'email' ? '' : 'hidden'}><EmailSignIn lang={lang}/></div>
    </div>
}
