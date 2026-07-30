'use client'

import {Dictionary} from '@/lang'
import {useEffect, useState} from 'react'
import {signInUrl} from '@/utils'

export default function HeaderSignInBtn({lang}: {lang: Dictionary}) {
    // The return target is window.location.href, which doesn't exist during
    // SSR. Render without it, then fill it in on mount — the button stays
    // clickable either way, it just lands on the home page if someone manages
    // to click within that first tick.
    const [authUrl, setAuthUrl] = useState<string>(signInUrl())

    useEffect(() => {
        setAuthUrl(signInUrl(window.location.href))
    }, [])

    return  <a className="cursor-pointer flex-row-item-center btn btn-ghost btn-sm text-xs font-normal px-1"
               href={authUrl}>
        <i className="uil-wallet text-base mr-1" />
        <span>{lang['Sign In']}</span>
    </a>
}
