'use client'

import {Dictionary} from '@/lang'
import {EventFormField, FormSubmission} from '@sola/sdk'
import {Button} from '@/components/shadcn/Button'

/**
 * Download the responses as CSV.
 *
 * Built in the browser from the rows the page already fetched rather than from
 * a new endpoint: the server has no more than this, and an export that hit the
 * API again could disagree with what is on screen.
 *
 * Shown to the form's author only — a public responses page is readable by
 * anyone, but handing a stranger a one-click spreadsheet of everyone's answers
 * is a different thing from letting them read the page.
 */
export default function ExportCsvBtn({lang, title, fields, responses}: {
    lang: Dictionary
    title: string
    fields: EventFormField[]
    responses: FormSubmission[]
}) {
    const download = () => {
        const header = [lang['Submitted at'], lang['Name'], ...fields.map(f => f.label)]
        const rows = responses.map(sub => {
            const byField = new Map(sub.answers.map(a => [a.form_field_id, a.value]))
            return [
                new Date(sub.submitted_at).toLocaleString(),
                sub.user?.nickname || sub.user?.name || '',
                ...fields.map(f => byField.get(f.id) ?? '')
            ]
        })

        // Every cell is quoted, not just the ones that look like they need it:
        // an answer is free text and may contain a comma, a quote, or a newline
        // — a long-text answer usually does — and quoting everything means the
        // rule is the same for all of them.
        const csv = [header, ...rows]
            .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
            .join('\r\n')

        // The BOM is what makes Excel read the file as UTF-8. Without it a
        // Chinese answer opens as mojibake, which is most of the point of
        // exporting on this deployment.
        const blob = new Blob(['﻿' + csv], {type: 'text/csv;charset=utf-8;'})
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${title.replace(/[\\/:*?"<>|]/g, '_') || 'form'}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return <Button variant={'secondary'} className="text-sm h-8"
        disabled={!responses.length}
        onClick={download}>
        {lang['Download CSV']}
    </Button>
}
