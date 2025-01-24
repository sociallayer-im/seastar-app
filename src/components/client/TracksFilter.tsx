'use client'

import {Button} from '@/components/shadcn/Button'
import {getLabelColor} from '@/utils/label_color'
import {Swiper, SwiperSlide} from 'swiper/react'
import {FreeMode} from 'swiper/modules';

import 'swiper/css'
import 'swiper/css/free-mode'
import {Track} from '@sola/sdk'

export interface TracksFilterProps {
    tracks: Track[]
    value?: number
    onSelect?: (trackId?: number) => void
}

export default function TracksFilter({tracks, value, onSelect}: TracksFilterProps) {
    const activeSlideIndex = !!value
        ? tracks.findIndex(t => t.id === value) + 1
        : 0

    return <Swiper
        slidesPerView={'auto'}
        freeMode={true}
        modules={[FreeMode]}
        direction={'horizontal'}
        onAfterInit={(swiper) => {
            swiper.slideTo(activeSlideIndex, 300)
        }}
    >
        <SwiperSlide className={'!w-auto pr-2'}>
            <Button
                onClick={() => onSelect?.()}
                variant={!!value ? 'outline' : 'normal'}
                className="!h-11 select-none hover:brightness-95"
                size={'sm'}>
                <div className="text-xs font-normal">
                    <div className="font-semibold">All Tracks</div>
                </div>
            </Button>
        </SwiperSlide>
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
            return <SwiperSlide className={'!w-auto pr-2'} key={index}>
                <Button
                    onClick={() => onSelect?.(t.id)}
                    variant="outline"
                    size={'sm'}
                    style={themeStyle}
                    className="select-none hover:brightness-95">
                    <div className="text-xs font-normal">
                        <div className="font-semibold">{t.title}</div>
                        <div className="capitalize">{t.kind}</div>
                    </div>
                </Button>
            </SwiperSlide>
        })}
    </Swiper>
}