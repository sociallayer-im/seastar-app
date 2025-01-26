'use client'

import {Button} from '@/components/shadcn/Button'
import {getLabelColor} from '@/utils/label_color'

export interface TagsFilterProps {
    tags: string[]
    values?: string[]
    onSelected?: (tag: string | undefined) => void
}

export default function TagsFilter({tags, values, onSelected}: TagsFilterProps) {

    return <div className="flex-row-item-center !flex-wrap">
        <Button onClick={() => {
            onSelected?.(undefined)
        }}
                variant={values?.length ? 'outline' : 'normal'}
                className="select-none hover:brightness-95 mr-1 mb-1"
                size={'sm'}>
            <div className="text-xs font-normal">
                <div className="font-semibold">All Tags</div>
            </div>
        </Button>
        {tags.filter((t, index) => !t.startsWith(':'))
            .map((t, index) => {
                const color = getLabelColor(t)
                const selected = values?.includes(t)
                const themeStyle = selected
                    ? {
                        color: '#fff',
                        borderColor: color,
                        backgroundColor: color
                    }
                    : {
                        color: color,
                        borderColor: color
                    }

                return <Button
                    key={index}
                    onClick={() => {
                        onSelected?.(t)
                    }}
                    variant="outline"
                    size={'sm'}
                    style={themeStyle}
                    className="select-none hover:brightness-95 mr-1 mb-1">
                    <div className="text-xs font-normal">
                        <div className="font-semibold">{t}</div>
                    </div>
                </Button>
            })}
    </div>
}