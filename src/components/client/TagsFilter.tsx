'use client'

import {Button} from '@/components/shadcn/Button'
import {getLabelColor} from '@/utils/label_color'
import {Dictionary} from '@/lang'

export interface TagsFilterProps {
    lang: Dictionary
    allowResetBtn?: boolean
    tags: string[]
    multiple?: boolean
    values?: string[]
    onSelected?: (tags: string[] | undefined) => void
}

export default function TagsFilter({tags, values, onSelected, multiple, lang, allowResetBtn=true}: TagsFilterProps) {

    const handleSelect = (tag: string) => {
        if (values?.includes(tag)) {
            const newValues = values.filter(v => v !== tag)
            onSelected?.(newValues.length ? newValues : undefined)
        } else {
            multiple ? onSelected?.([...values!, tag]) : onSelected?.([tag])
        }
    }

    return <div className="flex-row-item-center !flex-wrap">
        {allowResetBtn &&
            <Button onClick={() => {
                onSelected?.(undefined)
            }}
                    variant={values?.length ? 'outline' : 'normal'}
                    className={`select-none hover:brightness-95 mr-1 mb-1 ${values?.length ? 'border-gray-300' : 'border-foreground'}`}
                    size={'sm'}>
                <div className="text-xs font-normal">
                    <div className="font-semibold">{lang['All Tags']}</div>
                </div>
            </Button>
        }
        {tags.filter((t, index) => !t.startsWith(':'))
            .map((t, index) => {
                const selected = values?.includes(t)
                
                return <Button
                    key={index}
                    onClick={() => handleSelect(t)}
                    variant={selected ? 'normal' : 'outline'}
                    size={'sm'}
                    className={`select-none hover:brightness-95 mr-1 mb-1 ${selected ? 'border-foreground' : 'border-gray-300'}`}>
                    <div className="text-xs font-normal">
                        <div className="font-semibold">{t}</div>
                    </div>
                </Button>
            })}
    </div>
}