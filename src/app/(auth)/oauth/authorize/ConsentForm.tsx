'use client'

import {useState} from 'react'
import {Dictionary} from '@/lang'
import {
    buildOauthRedirect,
    decideOauthAuthorization,
    OauthAuthorizeInfo,
    OauthAuthorizeQuery
} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {Button} from '@/components/shadcn/Button'
import Img from '@/components/Img'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {getAuth} from '@/utils'

export default function ConsentForm({lang, langType, query, info}: {
    lang: Dictionary
    langType: string
    query: OauthAuthorizeQuery
    info: OauthAuthorizeInfo
}) {
    const [busy, setBusy] = useState(false)
    const {toast} = useToast()
    // The scope descriptions come from the API in both languages, so the
    // wording lives in one place (OauthClaims::DESCRIPTIONS) instead of being
    // duplicated into the frontend dictionaries and drifting out of step.
    const zh = langType === 'zh-CN'

    const decide = async (decision: 'allow' | 'deny') => {
        const authToken = getAuth()
        if (!authToken) {
            window.location.href = '/signin'
            return
        }

        setBusy(true)
        try {
            const result = await decideOauthAuthorization({
                params: {query, decision, authToken},
                clientMode: CLIENT_MODE
            })
            // The browser performs the navigation, not the API — and only to a
            // redirect_uri the backend has confirmed is registered for this
            // client, on both the allow and the deny path.
            window.location.href = buildOauthRedirect(result)
        } catch (e: any) {
            setBusy(false)
            toast({variant: 'destructive', title: e.description || e.message})
        }
    }

    return <div className="max-w-[460px] w-full bg-[var(--background)] rounded-lg shadow p-6">
        <div className="flex flex-col items-center text-center">
            {info.app_logo_url
                ? <Img src={info.app_logo_url} alt={info.app_name} width={56} height={56}
                       className="w-14 h-14 rounded-xl object-cover"/>
                : <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-xl">
                    {info.app_name.slice(0, 1).toUpperCase()}
                </div>}
            <div className="text-lg font-semibold mt-3">{info.app_name}</div>

            {/* Who is behind this app, stated before anything it is asking for.
                With no registration review, the owner handle and the redirect
                host are the only facts a user can actually judge. */}
            <div className="text-sm text-gray-500 mt-1">
                {lang['Provided by']} {info.owner_handle
                    ? <a className="text-[var(--color-theme)]"
                         href={`/${info.owner_type === 'group' ? 'group' : 'profile'}/${info.owner_handle}`}
                         target="_blank" rel="noreferrer">{info.owner_handle}</a>
                    : lang['an unknown developer']}
            </div>
            {info.app_description &&
                <div className="text-sm text-gray-500 mt-2">{info.app_description}</div>}
        </div>

        {!info.reviewed && !info.trusted &&
            <div className="mt-4 text-xs text-amber-700 bg-amber-50 rounded-md p-3">
                {lang['This application is provided by a third-party developer and has not been reviewed by Social Layer.']}
            </div>}

        <div className="mt-5 text-sm font-medium">{lang['This application will be able to access:']}</div>
        <ul className="mt-2 flex flex-col gap-2">
            {info.scope_details.map(detail =>
                <li key={detail.scope} className="flex items-start gap-2 text-sm">
                    <i className={`w-4 mt-[2px] ${detail.sensitive ? 'text-amber-600' : 'text-gray-400'}`}>•</i>
                    <div>
                        <span className={detail.sensitive ? 'font-semibold text-amber-700' : ''}>
                            {zh ? detail.zh : detail.en}
                        </span>
                        <span className="ml-2 text-xs text-gray-400 font-mono">{detail.scope}</span>
                    </div>
                </li>
            )}
        </ul>

        <div className="mt-5 text-xs text-gray-500 break-all">
            {lang['You will be returned to']} <span className="font-mono">{info.redirect_host}</span>
        </div>

        <div className="flex flex-row gap-3 mt-6">
            <Button variant="secondary" className="flex-1" disabled={busy} onClick={() => decide('deny')}>
                {lang['Deny']}
            </Button>
            <Button variant="special" className="flex-1" disabled={busy} onClick={() => decide('allow')}>
                {lang['Authorize']}
            </Button>
        </div>

        <div className="mt-4 text-xs text-gray-400 text-center">
            {lang['You can revoke this access at any time in Settings.']}
        </div>
    </div>
}
