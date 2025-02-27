'use client'

import {Button} from '@/components/shadcn/Button'
import {Dictionary} from '@/lang'
import {ShowConfirmDialogProps} from '@/hooks/useConfirmDialog'

export default function DialogConfirm({lang, title, content, onConfig, onCanceled, type='danger',hiddenCancelBtn,  close}: ShowConfirmDialogProps & {close: () => void}) {
    return <div className="max-w-[460px] rounded-lg bg-background shadow p-3" style={{width: '90vw'}}>
        {!!title &&
            <div className="font-semibold mb-2">{title}</div>
        }
        {!!content && <div className="mb-4" dangerouslySetInnerHTML={{__html: content}} />}
        <div className="flex-row-item-center">
            {!hiddenCancelBtn &&
                <Button className="flex-1 mr-2" variant="secondary"
                        onClick={() => {
                            onCanceled && onCanceled()
                            close && close()
                        }}>{lang['Cancel']}</Button>
            }
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