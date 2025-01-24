'use client'

import {Button} from '@/components/shadcn/Button'
import {getLabelColor} from '@/utils/label_color'
import {Swiper, SwiperSlide} from 'swiper/react'
import {FreeMode} from 'swiper/modules';

import 'swiper/css'
import 'swiper/css/free-mode'

export interface TagsFilterProps {
    tags: string[]
    values?: string[]
    onSelected?: (tag: string | undefined) => void
}

export default function TagsFilter({tags, values, onSelected}: TagsFilterProps) {
    const activeSlideIndex = !!values && values.length
        ? tags.findIndex(t => t === values[0]) + 1
        : 0

    return <Swiper
        slidesPerView={'auto'}
        spaceBetween={0}
        freeMode={true}
        modules={[FreeMode]}
        onAfterInit={(swiper) => {
            swiper.slideTo(activeSlideIndex, 300)
        }}
        direction={'horizontal'}>
        <SwiperSlide className={'!w-auto pr-2'}>
            <Button onClick={() => {
                onSelected?.(undefined)
            }}
                variant={values?.length ? 'outline' : 'normal'}
                className="select-none hover:brightness-95"
                size={'sm'}>
                <div className="text-xs font-normal">
                    <div className="font-semibold">All Tags</div>
                </div>
            </Button>
        </SwiperSlide>

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

                return <SwiperSlide className={'!w-auto pr-2'} key={index}>
                    <Button
                        onClick={() => {
                            onSelected?.(t)
                        }}
                        variant="outline"
                        size={'sm'}
                        style={themeStyle}
                        className="select-none hover:brightness-95">
                        <div className="text-xs font-normal">
                            <div className="font-semibold">{t}</div>
                        </div>
                    </Button>
                </SwiperSlide>
            })}
    </Swiper>
}