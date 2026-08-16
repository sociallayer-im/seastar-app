'use client'

import {Dictionary} from '@/lang'
import {EventFormField, FormFieldType} from '@sola/sdk'

/**
 * The author's side of a form: the question list. Shared by the event's
 * application-form section and the standalone form editor, so a field type
 * added here is offered in both — the alternative is a question an organizer
 * can only create on one of the two pages.
 */
export type FormFieldDraft = Pick<EventFormField, 'label' | 'required' | 'position'> & {
    id?: string
    field_type: FormFieldType
    options: string[]
}

/** The two types that carry a choice list — mirrors FormField::OPTION_TYPES. */
const OPTION_TYPES: string[] = ['select', 'multi_select']

export const emptyField = (position: number): FormFieldDraft =>
    ({label: '', required: false, position, field_type: 'text', options: []})

export default function FormFieldsEditor({fields, setFields, lang}: {
    fields: FormFieldDraft[]
    setFields: (fields: FormFieldDraft[]) => void
    lang: Dictionary
}) {
    const updateField = (index: number, patch: Partial<FormFieldDraft>) => {
        setFields(fields.map((f, i) => i === index ? {...f, ...patch} : f))
    }

    return <div className="space-y-2">
        {fields.map((field, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="flex-row-item-center gap-2">
                    <div className="flex-1">
                        <input
                            className="w-full text-sm border-none outline-none bg-transparent"
                            placeholder={lang['Question label']}
                            value={field.label}
                            onChange={e => updateField(index, {label: e.target.value})}/>
                    </div>
                    <select
                        className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white shrink-0"
                        value={field.field_type}
                        onChange={e => updateField(index, {
                            field_type: e.target.value as FormFieldType,
                            // Choices belong to a select and nothing else; keeping
                            // them across a type change lets a stale list
                            // reappear if the author switches back and forth.
                            options: OPTION_TYPES.includes(e.target.value)
                                ? (field.options.length ? field.options : [''])
                                : []
                        })}>
                        <option value="text">{lang['Text']}</option>
                        <option value="textarea">{lang['Long Text']}</option>
                        <option value="select">{lang['Select']}</option>
                        <option value="multi_select">{lang['Multi Select']}</option>
                        <option value="date">{lang['Date']}</option>
                        <option value="url">{lang['Link']}</option>
                        <option value="image">{lang['Image']}</option>
                        <option value="file">{lang['File']}</option>
                    </select>
                    <label className="flex-row-item-center gap-1 text-xs text-gray-500 cursor-pointer shrink-0">
                        <input type="checkbox" checked={field.required}
                            onChange={e => updateField(index, {required: e.target.checked})}/>
                        {lang['Required']}
                    </label>
                    <button className="text-gray-400 hover:text-red-400 shrink-0"
                        onClick={() => setFields(fields.filter((_, i) => i !== index))}>
                        <i className="uil-times text-lg"/>
                    </button>
                </div>

                {OPTION_TYPES.includes(field.field_type) && (
                    <div className="pl-1 space-y-1">
                        <div className="text-xs text-gray-400 mb-1">Options</div>
                        {field.options.map((opt, oi) => (
                            <div key={oi} className="flex-row-item-center gap-1">
                                <input
                                    className="flex-1 text-xs border border-gray-200 rounded px-2 py-0.5 outline-none"
                                    placeholder={`Option ${oi + 1}`}
                                    value={opt}
                                    onChange={e => {
                                        const opts = [...field.options]
                                        opts[oi] = e.target.value
                                        updateField(index, {options: opts})
                                    }}/>
                                <button className="text-gray-400 hover:text-red-400"
                                    onClick={() => updateField(index, {
                                        options: field.options.filter((_, i) => i !== oi)
                                    })}>
                                    <i className="uil-times"/>
                                </button>
                            </div>
                        ))}
                        <button className="text-xs text-green-500 hover:text-green-600 flex-row-item-center gap-1"
                            onClick={() => updateField(index, {options: [...field.options, '']})}>
                            <i className="uil-plus-circle"/> Add option
                        </button>
                    </div>
                )}

                {(field.field_type === 'image' || field.field_type === 'file') && (
                    <div className="pl-1 text-xs text-gray-400">
                        {field.field_type === 'image'
                            ? lang['Upload Image']
                            : lang['Upload File']}
                    </div>
                )}
            </div>
        ))}

        <button className="text-sm text-green-500 hover:text-green-600 flex-row-item-center gap-1 mt-1"
            onClick={() => setFields([...fields, emptyField(fields.length)])}>
            <i className="uil-plus-circle"/> {lang['Add question']}
        </button>
    </div>
}
