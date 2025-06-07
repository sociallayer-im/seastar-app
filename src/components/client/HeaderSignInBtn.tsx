'use client'

import {Dictionary} from '@/lang'
import {useEffect, useState} from 'react'

export default function HeaderSignInBtn({lang}: {lang: Dictionary}) {
    const [authUrl,  setAuthUrl] = useState<string>(process.env.NEXT_PUBLIC_SIGN_IN_URL!);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const currentPath = window.location.href
            setAuthUrl(`${process.env.NEXT_PUBLIC_SIGN_IN_URL}?return=${encodeURIComponent(currentPath)}`);
        }
    }, []);

    return  <a className="cursor-pointer flex-row-item-center btn btn-ghost btn-sm text-xs font-normal px-1"
               href={authUrl}>
        <i className="uil-wallet text-base mr-1" />
        <span>{lang['Sign In']}</span>
    </a>
}