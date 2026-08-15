'use client'

import {useState} from 'react'
import {EventFormField, uploadDocument} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {Dictionary} from '@/lang'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import useUploadImage from '@/hooks/useUploadImage'
import chooseFile from '@/utils/choseFile'
import {getAuth} from '@/utils'

/**
 * The applicant's side of a form: one control per field, values keyed by field
 * id. Shared by the event RSVP dialog and the standalone form page so an
 * `image` or `file` question behaves identically wherever it is answered —
 * they diverged once already, and a field type that renders in one place and
 * not the other is invisible until someone loses an upload.
 *
 * An upload answer is a URL in `value`, exactly like a text answer: the file
 * goes to the object store first and the form only ever carries the link.
 * Nothing about a submission is binary.
 */

/** Types the document rail accepts — mirrors UploadsController::ALLOWED_FILE_TYPES. */
const DOCUMENT_TYPES = [
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/zip',
    'image/png', 'image/jpeg', 'image/gif', 'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
]

export type FormValues = Record<string, string>

/**
 * An answer's value is whatever the respondent typed, and the field's type can
 * be changed by the author AFTER it was answered — so a value reaching an
 * `image`/`file` renderer is not guaranteed to be a URL we produced. React
 * does not block `javascript:` in an href, so rendering one unchecked turns a
 * text answer into script that runs in the organizer's session when they open
 * the responses page. Only http(s) is ever linked.
 */
const safeUrl = (value: string) => {
    try {
        const url = new URL(value)
        return url.protocol === 'https:' || url.protocol === 'http:' ? value : null
    } catch {
        return null
    }
}

/** Empty for a required field is the only rule; the API re-checks it anyway. */
export function validateFormValues(fields: EventFormField[], values: FormValues, lang: Dictionary) {
    const errors: Record<string, string> = {}
    fields.forEach(field => {
        if (field.required && !(values[field.id] || '').trim()) {
            errors[field.id] = lang['This field is required'] || 'This field is required'
        }
    })
    return errors
}

export default function FormFieldsInput({fields, values, errors, onChange, lang}: {
    fields: EventFormField[]
    values: FormValues
    errors?: Record<string, string>
    onChange: (fieldId: string, value: string) => void
    lang: Dictionary
}) {
    return <div className="space-y-4">
        {fields.map(field => (
            <div key={field.id}>
                <div className="text-sm font-medium mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                </div>

                {field.field_type === 'select' ? (
                    <select
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400 bg-white"
                        value={values[field.id] || ''}
                        onChange={e => onChange(field.id, e.target.value)}>
                        <option value="">{lang['-- Select --'] || '-- Select --'}</option>
                        {(field.options || []).map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                        ))}
                    </select>
                ) : field.field_type === 'image' ? (
                    <ImageAnswer value={values[field.id] || ''} lang={lang}
                        onChange={url => onChange(field.id, url)}/>
                ) : field.field_type === 'file' ? (
                    <FileAnswer value={values[field.id] || ''} lang={lang}
                        onChange={url => onChange(field.id, url)}/>
                ) : (
                    <input
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
                        placeholder={field.label}
                        value={values[field.id] || ''}
                        onChange={e => onChange(field.id, e.target.value)}/>
                )}

                {errors?.[field.id] && (
                    <div className="text-xs text-red-500 mt-1">{errors[field.id]}</div>
                )}
            </div>
        ))}
    </div>
}

function ImageAnswer({value, onChange, lang}: {
    value: string
    onChange: (url: string) => void
    lang: Dictionary
}) {
    // The image rail, not the document one: useUploadImage re-encodes what the
    // camera roll hands over, which is what makes a HEIC or a 12MP photo
    // usable here at all.
    const {uploadImage} = useUploadImage()

    const preview = safeUrl(value)

    return <div className="flex-row-item-center gap-3">
        {!!preview && <img src={preview} alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-200"/>}
        <button type="button"
            className="text-sm text-green-500 hover:text-green-600 flex-row-item-center gap-1"
            onClick={() => uploadImage().then(onChange).catch(() => undefined)}>
            <i className="uil-image-upload"/>
            {value ? (lang['Replace'] || 'Replace') : (lang['Upload Image'] || 'Upload Image')}
        </button>
        {!!value && <button type="button" className="text-sm text-gray-400 hover:text-red-400"
            onClick={() => onChange('')}>
            <i className="uil-times"/>
        </button>}
    </div>
}

function FileAnswer({value, onChange, lang}: {
    value: string
    onChange: (url: string) => void
    lang: Dictionary
}) {
    const {toast} = useToast()
    const [busy, setBusy] = useState(false)
    // The stored key is a content hash, so the URL's last segment is not a
    // name anyone would recognise. Remember what they picked for this session;
    // once saved, the link is all that survives, which is why the backend
    // keeps the extension on the key.
    const [name, setName] = useState('')

    const pick = async () => {
        const files = await chooseFile({accepts: DOCUMENT_TYPES})
        if (!files.length) return

        const authToken = getAuth()
        if (!authToken) {
            toast({title: lang['Please login first'] || 'Please login first', variant: 'destructive'})
            return
        }

        setBusy(true)
        try {
            const result = await uploadDocument({
                params: {file: files[0], authToken},
                clientMode: CLIENT_MODE
            })
            setName(result.filename)
            onChange(result.url)
        } catch (e: unknown) {
            toast({
                title: e instanceof Error ? e.message : (lang['Upload failed'] || 'Upload failed'),
                variant: 'destructive'
            })
        } finally {
            setBusy(false)
        }
    }

    const link = safeUrl(value)

    return <div className="flex-row-item-center gap-3 flex-wrap">
        {!!link && <a href={link} target="_blank" rel="noreferrer"
            className="text-sm text-blue-500 underline break-all">
            <i className="uil-file-alt mr-1"/>{name || link.split('/').pop()}
        </a>}
        <button type="button" disabled={busy}
            className="text-sm text-green-500 hover:text-green-600 flex-row-item-center gap-1 disabled:opacity-50"
            onClick={pick}>
            <i className="uil-upload"/>
            {busy
                ? (lang['Uploading'] || 'Uploading…')
                : value ? (lang['Replace'] || 'Replace') : (lang['Upload File'] || 'Upload File')}
        </button>
        {!!value && !busy && <button type="button" className="text-sm text-gray-400 hover:text-red-400"
            onClick={() => { setName(''); onChange('') }}>
            <i className="uil-times"/>
        </button>}
    </div>
}

/** Read-only rendering of an answer, for the organizer's submission list. */
export function FormAnswerValue({field, value}: {field?: EventFormField, value: string | null}) {
    if (!value) return <span className="text-gray-400">—</span>

    const href = field?.field_type === 'image' || field?.field_type === 'file'
        ? safeUrl(value)
        : null

    if (href && field?.field_type === 'image') {
        return <a href={href} target="_blank" rel="noreferrer">
            <img src={href} alt="" className="w-20 h-20 rounded object-cover border border-gray-200"/>
        </a>
    }
    if (href && field?.field_type === 'file') {
        return <a href={href} target="_blank" rel="noreferrer"
            className="text-blue-500 underline break-all">
            <i className="uil-file-alt mr-1"/>{href.split('/').pop()}
        </a>
    }
    // Not a link we are willing to make — show it as the text it is.
    return <span className="whitespace-pre-wrap break-words">{value}</span>
}
