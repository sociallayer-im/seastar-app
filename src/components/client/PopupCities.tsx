'use client'

import {cfImage, displayProfileName, prefixUrl} from '@/utils'
import Avatar from '@/components/Avatar'
import Img from '@/components/Img'
import DisplayDateTime from '@/components/client/DisplayDateTime'
import {Button} from '@/components/shadcn/Button'
import {useState} from 'react'
import {PopupCity as SolaPopupCity} from '@sola/sdk'

type FilterType = 'all' | 'ongoing' | 'upcoming' | 'past'

interface PopupCitiesProps {
    popupCities: SolaPopupCity[]
    lang: any
}

export default function PopupCities({popupCities, lang}: PopupCitiesProps) {
    const [filter, setFilter] = useState<FilterType>('all')

    const filterPopupCities = (cities: SolaPopupCity[]) => {
        const now = new Date()
        const list = cities.filter(city => {
            if (!city.start_date || !city.end_date) return filter === 'all'
            const startDate = new Date(city.start_date)
            const endDate = new Date(city.end_date)
            if (filter === 'ongoing') return startDate <= now && endDate >= now
            if (filter === 'upcoming') return startDate > now
            if (filter === 'past') return endDate < now
            return true
        })
        return list.sort((a, b) => {
            if (!a.start_date) return 1
            if (!b.start_date) return -1
            return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        })
    }

    const filteredCities = filterPopupCities(popupCities)

    // Nothing curated as a pop-up city: hide the whole section — heading,
    // filter buttons and all — rather than show a titled empty box. Keyed on
    // the input rather than `filteredCities`, so a filter that happens to
    // match nothing still leaves the controls on screen to undo it.
    if (!popupCities.length) return null

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-3 md:flex-row flex items-center justify-between flex-col">
                <div>{lang['Pop-up Cities']}</div>
                <a href="/popup-city" className="flex-row-item-center text-sm">
                    <span>{lang['See all Pop-up Cities events']}</span>
                    <i className="uil-arrow-right text-2xl ml-1"/>
                </a>
            </h2>

            <div className="flex gap-2 mb-4">
                <Button 
                    variant={'outline'} 
                    size={'sm'}
                    style={filter !== 'all' ? {borderColor: "#EDEDED"} : undefined}
                    className="text-xs"
                    onClick={() => setFilter('all')}
                >
                    {lang['All']}
                </Button>
                <Button 
                    size={'sm'}
                    style={filter !== 'ongoing' ? {borderColor: "#EDEDED"} : undefined}
                    className="text-xs"
                    variant={'outline'} 
                    onClick={() => setFilter('ongoing')}
                >
                    {lang['Ongoing']}
                </Button>
                <Button 
                    size={'sm'}
                    style={filter !== 'upcoming' ? {borderColor: "#EDEDED"} : undefined}
                    className="text-xs"
                    variant={'outline'} 
                    onClick={() => setFilter('upcoming')}
                >
                    {lang['Upcoming']}
                </Button>
                <Button 
                    size={'sm'}
                    style={filter !== 'past' ? {borderColor: "#EDEDED"} : undefined}
                    className="text-xs"
                    variant={'outline'} 
                    onClick={() => setFilter('past')}
                >
                    {lang['Past']}
                </Button>
            </div>

            <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-2">
                {filteredCities.map((popupCity, index) => {
                    return <a key={index} href={`/event/${popupCity.group.name}`}
                              className="rounded-sm shadow-sm p-3 duration-200 hover:translate-y-[-6px]">
                        <div className="rounded-sm aspect-3/2 mb-3 overflow-hidden">
                            <Img className="object-cover w-full h-full rounded-sm"
                                   width={227} height={148}
                                   src={cfImage(popupCity.image_url || popupCity.group.image_url || '', { width: 454, height: 296, fit: 'cover' })} alt=""/>
                        </div>
                        {popupCity.start_date && popupCity.end_date && <div className="webkit-box-clamp-1 sm:text-sm text-xs">
                            <DisplayDateTime format={'MMM DD'} dataTimeStr={popupCity.start_date}/>
                            <span className="mx-1">-</span>
                            <DisplayDateTime format={'MMM DD, YYYY'} dataTimeStr={popupCity.end_date}/>
                        </div>}
                        <div className="webkit-box-clamp-2 text-lg font-semibold leading-5 h-10 mb-4">
                            {popupCity.title}
                        </div>

                        <div className="flex items-end flex-row justify-between">
                            <div className="flex-1">
                                <div className="flex-row-item-center text-xs">
                                    <i className={'uil-location-point mr-0.5'}></i>
                                    <div className="webkit-box-clamp-1 break-all">{popupCity.location}</div>
                                </div>
                                <div className="flex-row-item-center text-xs">
                                    <Avatar profile={popupCity.group} size={14} className="mr-0.5"/>
                                    <div className="webkit-box-clamp-1">by {displayProfileName(popupCity.group)}</div>
                                </div>
                            </div>
                            {!!(popupCity as typeof popupCity & {website?: string | null}).website && 
                                <div
                                onClick={(e) => {e.preventDefault();window.open(prefixUrl((popupCity as typeof popupCity & {website?: string | null}).website!), '_blank')}}
                                className="whitespace-nowrap text-xs bg-[#EEF2FE] py-1.5 px-2 rounded-lg ml-1">
                                <i className="uil-link-alt text-[#7492EF]" />
                            </div>
                            }
                        </div>
                    </a>
                })
                }
            </div>
        </div>
    )
} 