'use client'

import {useRouter} from 'next/navigation'
import {Dictionary} from '@/lang'
import {OauthGrant, revokeOauthGrant} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {Button} from '@/components/shadcn/Button'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import useModal from '@/components/client/Modal/useModal'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import Img from '@/components/Img'
import {getAuth} from '@/utils'

export default function OauthGrants({lang, langType, grants}: {
    lang: Dictionary, langType: string, grants: OauthGrant[]
}) {
    const router = useRouter()
    const {toast} = useToast()
    const {showLoading, closeModal} = useModal()
    const {showConfirmDialog} = useConfirmDialog()
    const zh = langType === 'zh-CN'

    const revoke = (grant: OauthGrant) => showConfirmDialog({
        lang,
        title: grant.app_name,
        content: lang['Revoke access for this application? It will lose its tokens immediately.'],
        onConfig: async () => {
            const authToken = getAuth()
            if (!authToken) {
                window.location.href = '/signin'
                return
            }
            const loading = showLoading()
            try {
                await revokeOauthGrant({params: {id: grant.id, authToken}, clientMode: CLIENT_MODE})
                router.refresh()
            } catch (e: any) {
                toast({variant: 'destructive', title: e.message})
            } finally {
                closeModal(loading)
            }
        }
    })

    return <div className="max-w-[720px] mx-auto">
        <div className="text-xl font-semibold mb-4">{lang['Authorized Applications']}</div>

        {!grants.length &&
            <div className="text-sm text-gray-400 py-12 text-center">{lang['No authorized applications']}</div>}

        <div className="flex flex-col gap-3">
            {grants.map(grant =>
                <div key={grant.id} className="rounded-lg bg-[var(--background)] shadow p-4">
                    <div className="flex-row-item-center gap-3">
                        {grant.app_logo_url
                            ? <Img src={grant.app_logo_url} alt={grant.app_name} width={40} height={40}
                                   className="w-10 h-10 rounded-lg object-cover"/>
                            : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                {grant.app_name.slice(0, 1).toUpperCase()}
                            </div>}
                        <div className="flex-1">
                            <div className="font-semibold">{grant.app_name}</div>
                            <div className="text-xs text-gray-400">
                                {lang['Provided by']} {grant.owner_handle || lang['an unknown developer']}
                            </div>
                        </div>
                        <Button variant="destructive" size="xs" onClick={() => revoke(grant)}>
                            {lang['Revoke Access']}
                        </Button>
                    </div>

                    <ul className="mt-3 flex flex-row flex-wrap gap-2">
                        {grant.scope_details.map(detail =>
                            <li key={detail.scope}
                                className={`text-xs px-2 py-1 rounded ${detail.sensitive ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                {zh ? detail.zh : detail.en}
                            </li>
                        )}
                    </ul>

                    <div className="mt-2 text-xs text-gray-400">
                        {lang['Authorized on']} {new Date(grant.created_at).toLocaleDateString()}
                    </div>
                </div>
            )}
        </div>
    </div>
}
