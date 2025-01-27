'use client'

import {Button} from '@/components/shadcn/Button'
import {getLabelColor} from '@/utils/label_color'
import {Track} from '@sola/sdk'
import {Dictionary} from '@/lang'

export interface TracksFilterProps {
    lang: Dictionary
    allowResetBtn?: boolean
    tracks: Track[]
    multiple?: boolean
    values?: number[] | null
    onSelect?: (trackIds?: number[]) => void
}

export default function TracksFilter({tracks, values, onSelect, multiple, lang, allowResetBtn=true}: TracksFilterProps) {

    const handleSelect = (trackId: number) => {
        if (values?.includes(trackId)) {
            const newValues = values.filter(v => v !== trackId)
            onSelect?.(newValues.length ? newValues : undefined)
        } else {
            multiple ? onSelect?.([...values!, trackId]) : onSelect?.([trackId])
        }
    }

    return <div className="flex-row-item-center !flex-wrap">
        {allowResetBtn &&
            <Button
                onClick={() => onSelect?.()}
                variant={!!values && values.length ? 'outline' : 'normal'}
                className="!h-11 select-none hover:brightness-95 mb-1 mr-1 border-foreground border"
                size={'sm'}>
                <div className="text-xs font-normal">
                    <div className="font-semibold">{lang['All Tracks']}</div>
                </div>
            </Button>
        }
        {tracks.map((t, index) => {
            const color = getLabelColor(t.title)
            const selected = values?.includes(t.id)
            const themeStyle = selected
                ? {
                    color: '#fff',
                    borderColor: color,
                    backgroundColor: color,
                    height: '44px',
                } :
                {
                    color: color,
                    borderColor: color,
                    height: '44px',
                }
            return <Button
                key={index}
                onClick={() => handleSelect(t.id)}
                variant="outline"
                size={'sm'}
                style={themeStyle}
                className="select-none hover:brightness-95 mb-1 mr-1">
                <div className="text-xs font-normal">
                    <div className="font-semibold">{t.title}</div>
                    <div className="capitalize">{t.kind}</div>
                </div>
            </Button>
        })}
    </div>
}