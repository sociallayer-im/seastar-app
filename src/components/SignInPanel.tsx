'use client'

import {Button} from '@/components/shadcn/Button'
import {clientToSignIn} from '@/utils'
import {Dictionary} from '@/lang'

export default function SignInPanel({lang}:{lang: Dictionary}) {
    return <div className="flex flex-col justify-center items-center rounded-lg border-dashed border-2 p-3 my-3">
        <img src="/images/balloon.png"  className="w-12" alt=""/>
        <div className="text-sm font-semibold my-2">{lang['Sign in to participate in a fun event']}</div>
        <Button onClick={clientToSignIn} variant={'special'} className="w-full">
            {lang['Sign In']}
        </Button>
    </div>
}