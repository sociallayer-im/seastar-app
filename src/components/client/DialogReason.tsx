'use client'

import {useState} from 'react'
import {Button} from '@/components/shadcn/Button'
import {Dictionary} from '@/lang'

/**
 * Asks a moderator why, when they hide something.
 *
 * Built as a sibling of DialogConfirm rather than an option on it: this one
 * carries state (the text), and threading a value back out of a confirm
 * dialog would change the shape of every existing caller.
 *
 * The reason is optional, and the dialog says so — a moderator who is not
 * going to write one should not be made to fake one, but the field is in
 * front of them because the author is the one who reads it.
 */
export default function DialogReason({lang, title, description, confirmLabel, onConfirm, close}: {
    lang: Dictionary,
    title: string,
    description?: string,
    confirmLabel?: string,
    onConfirm: (reason?: string) => void,
    close: () => void
}) {
    const [reason, setReason] = useState('')

    return <div className="max-w-[460px] rounded-lg bg-background shadow p-4" style={{width: '90vw'}}>
        <div className="font-semibold mb-1">{title}</div>
        {!!description && <div className="text-sm text-gray-500 mb-3">{description}</div>}

        <textarea className="w-full border border-gray-200 rounded-lg p-3 text-sm min-h-[90px]"
            autoFocus
            maxLength={200}
            placeholder={lang['Reason (optional)']}
            value={reason}
            onChange={e => setReason(e.target.value)}/>

        <div className="flex-row-item-center mt-3">
            <Button className="flex-1 mr-2" variant="secondary" onClick={close}>
                {lang['Cancel']}
            </Button>
            <Button className="flex-1" variant="destructive"
                onClick={() => { onConfirm(reason.trim() || undefined); close() }}>
                {confirmLabel || lang['Confirm']}
            </Button>
        </div>
    </div>
}
