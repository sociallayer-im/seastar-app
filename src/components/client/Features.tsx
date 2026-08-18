'use client'

import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel"
import Autoplay from 'embla-carousel-autoplay'
import { PopupCity } from "@sola/sdk"
import { useEffect, useState } from "react"
import DisplayDateTime from "./DisplayDateTime"
import Avatar from "../Avatar"
import { cfImage, displayProfileName } from "@/utils"
import Img from "@/components/Img"


export default function Features(props: { featuredPopupCities: PopupCity[] }) {
    // With nothing featured this rendered an empty bordered, shadowed box —
    // same defect as the pop-up city section below it, and just as visible.
    if (!props.featuredPopupCities.length) return null

    return <div className="w-full mb-8 overflow-hidden rounded-lg border-gray-200 shadow-sm">
        <Carousel opts={{
            loop: true
        }} plugins={[Autoplay({ delay: 5000 })]}>
            <CarouselContent>
                {props.featuredPopupCities.map((popupCity, index) => <CarouselItem key={popupCity.id}>
                    <FeatureItem popupCity={popupCity} priority={index === 0} />
                </CarouselItem>)}
            </CarouselContent>
        </Carousel>
    </div>
}

function FeatureItem(props: { popupCity: PopupCity, priority?: boolean }) {
    const [dominantColor, setDominantColor] = useState<string>('rgba(0,0,0,0)')
    const [textColor, setTextColor] = useState<string>('#333')
    useEffect(() => {
        if (props.popupCity.image_url) {
            getDominantColor(props.popupCity.image_url).then((color) => {
                // 从透明色到dominantColor的渐变
                const transparentColor = 'rgba(0,0,0,0)'
                const gradient = `linear-gradient(to bottom, ${transparentColor} 1%, ${color} 50%)`
                setDominantColor(gradient)
                setTextColor(getTextColor(color))
            })
        }
    }, [props.popupCity.image_url])

    // 固定 300px 高度。CarouselContent 是 flex 容器，slide 会被拉伸到最高的一张
    // 图片的高度，所以任由 img 用 h-auto 时，整个 carousel 的高度由最高的那张
    // 图片决定（一张竖图就能把首页顶开）。高度约束回到 slide 自身，图片用
    // object-cover 填充——这也是 a0cfb65 之前的做法。
    return <a className='relative block h-[300px]' href={`/event/${props.popupCity.group.name}`}>
        {props.popupCity.image_url &&
            // Only the first slide is visible on arrival, and it is the page's
            // LCP element — it loads eagerly at high priority. The other 20 are
            // 900px images nobody has scrolled to yet, so they wait.
            <Img src={cfImage(props.popupCity.image_url, { width: 900, fit: 'scale-down' })}
                alt={props.popupCity.title}
                priority={props.priority}
                className='w-full h-full object-cover' />
        }
        <div className='hidden absolute bottom-0 left-0 right-0 sm:pt-[140px] pt-[100px] px-6 h-[250px]' style={{ background: dominantColor }}>
            <h3 className='text-white text-3xl font-bold mb-1' style={{ color: textColor }}>{props.popupCity.title}</h3>
            <div className="flex sm:flex-row flex-col sm:gap-4 mb-2">
                {props.popupCity.start_date && props.popupCity.end_date && <div className="webkit-box-clamp-1 text-sm"
                    style={{ color: textColor }}>
                    <i className={'uil-calendar-alt mr-0.5'}></i>
                    <DisplayDateTime format={'MMM DD'} dataTimeStr={props.popupCity.start_date} />
                    <span className="mx-1">-</span>
                    <DisplayDateTime format={'MMM DD, YYYY'} dataTimeStr={props.popupCity.end_date} />
                </div>}
                <div className="flex-row-item-center text-sm">
                    <i className={'uil-location-point mr-0.5'}></i>
                    <div className="webkit-box-clamp-1 break-all" style={{ color: textColor }}>{props.popupCity.location}</div>
                </div>
            </div>
            <div className="flex-row-item-center text-xs">
                <Avatar profile={props.popupCity.group} size={14} className="mr-1" />
                <div className="webkit-box-clamp-1" style={{ color: textColor }}>by {displayProfileName(props.popupCity.group)}</div>
            </div>
        </div>
    </a>
}

function getDominantColor(imgUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'Anonymous'
        img.src = imgUrl
        img.onload = function () {
            const canvas = document.createElement('canvas')
            const ctx: any = canvas.getContext('2d')
            canvas.width = 64 // 缩小尺寸提升性能
            canvas.height = 64
            ctx.drawImage(img, 0, 0, 64, 64)
            const pixelData = ctx.getImageData(0, 0, 64, 64).data

            // 统计颜色频率
            const colorCounts: any = {}
            for (let i = 0; i < pixelData.length; i += 4) {
                const rgb = `${pixelData[i]},${pixelData[i + 1]},${pixelData[i + 2]}`
                colorCounts[rgb] = (colorCounts[rgb] || 0) + 1
            }
            // 取最高频颜色
            const dominantColor = Object.entries(colorCounts).sort((a: any, b: any) => b[1] - a[1])[0][0]
            resolve(`rgb(${dominantColor}, 0.8)`)
        }
    })
}

// 实现一个函数，根据背景颜色，获取文本颜色，目的是增大文字和背景的对比度
function getTextColor(bgColor: string): string {
    const rgb = bgColor.match(/\d+/g)
    if (!rgb) {
        return 'white'
    }
    const r = parseInt(rgb[0])
    const g = parseInt(rgb[1])
    const b = parseInt(rgb[2])
    const yiq = (r * 299 + g * 587 + b * 114) / 1000
    return yiq >= 128 ? '#333' : '#fff'
}

