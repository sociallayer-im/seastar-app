import {GroupDetail} from '@sola/sdk'
import {buttonVariants} from '@/components/shadcn/Button'
import {MARKER_TYPES} from '@/app/(normal)/map/[grouphandle]/marker/marker_type'
import {Dictionary} from '@/lang'
import {useEffect, useRef} from 'react'

export default function TopBar({groupDetail, lang, markerCategory}:{groupDetail: GroupDetail, lang: Dictionary, markerCategory?: string}) {
    const barRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleScroll = (e: Event) => {
            barRef.current!.scrollLeft = barRef.current!.scrollLeft + (e as WheelEvent).deltaY
        }

        const a = setInterval(() => {
            if (!!barRef.current) {
                barRef.current?.addEventListener('wheel', handleScroll)
                clearInterval(a)
            }
        }, 100)

        return () => {
            clearInterval(a)
            barRef.current?.removeEventListener('wheel', handleScroll)
        }
    }, [])

    useEffect(() => {
        document.getElementById(`category-${markerCategory}`)?.scrollIntoView({behavior: 'instant', block: 'center'})
    }, []);

    return <div ref={barRef}
        className="flex-row-item-center absolute top-3  justify-start md:justify-center w-full flex-nowrap overflow-auto">

        <a className={`${buttonVariants({
            variant: 'primary',
            size: 'sm'
        })} bg-background ml-3 text-sm`}>
            <i className="uil-plus-circle text-lg"/>
            {lang['Create a Marker']}
        </a>

        <a className={`${buttonVariants({
            variant: markerCategory ? 'white' : 'normal',
            size: 'sm'
        })} bg-background ml-3 text-sm`}
           href={`/map/${groupDetail.handle}/event`}
        >{lang['Events']}</a>

        <a className={`${buttonVariants({
            variant: markerCategory === 'all' ? 'normal' : 'white',
            size: 'sm'
        })} bg-background ml-3 text-sm`}
           href={`/map/${groupDetail.handle}/marker`}
        >{lang['All Markers']}</a>

        {MARKER_TYPES.map((type, i) => {
            return <a key={i}
                      id={`category-${type.label}`}
                      href={`/map/${groupDetail.handle}/marker?category=${encodeURIComponent(type.label)}`}
                      className={`${buttonVariants({
                          variant: markerCategory === type.label ? 'normal': 'white',
                          size: 'sm'
                      })} bg-background ml-3 text-sm`}>
                {type.label}
            </a>
        })}
    </div>
}