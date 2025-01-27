'use client'

import {Button} from '@/components/shadcn/Button'
import {getLabelColor} from '@/utils/label_color'
import {Track} from '@sola/sdk'

export interface TracksFilterProps {
    tracks: Track[]
    value?: number | null
    onSelect?: (trackId?: number) => void
}

export default function TracksFilter({tracks, value, onSelect}: TracksFilterProps) {

    return <div className="flex-row-item-center !flex-wrap">
        <Button
            onClick={() => onSelect?.()}
            variant={!!value ? 'outline' : 'normal'}
            className="!h-11 select-none hover:brightness-95 mb-1 mr-1"
            size={'sm'}>
            <div className="text-xs font-normal">
                <div className="font-semibold">All Tracks</div>
            </div>
        </Button>
        {tracks.map((t, index) => {
            const color = getLabelColor(t.title)
            const selected = value === t.id
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
                onClick={() => onSelect?.(t.id)}
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