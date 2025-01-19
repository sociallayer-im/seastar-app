'use client'

import {Button} from '@/components/shadcn/Button'
import {Dictionary} from '@/lang'

export interface DialogConfirmProps {
    lang: Dictionary
    title?: string
    content?: string
    onConfig?: () => void
    onCanceled?: () => void
    type?: 'danger' | 'info'
    close?: () => void
}

export default function DialogConfirm({lang, title, content, onConfig, onCanceled, type='danger', close}: DialogConfirmProps) {
    return <div className="w-[300px] rounded-lg bg-background shadow p-3">
        {!!title &&
            <div className="font-semibold mb-2">{title}</div>
        }
        {!!content && <div className="mb-4" dangerouslySetInnerHTML={{__html: content}} />}
        <div className="flex-row-item-center">
            <Button className="flex-1 mr-2" variant="secondary"
                    onClick={() => {
                        onCanceled && onCanceled()
                        close && close()
                    }}>{lang['Cancel']}</Button>
            <Button variant={type=== 'danger' ? 'destructive': 'primary'}
                    className="flex-1 mr-2"
                    onClick={() => {
                onConfig && onConfig()
                close && close()
            }}>{lang['Confirm']}
            </Button>
        </div>
    </div>
}