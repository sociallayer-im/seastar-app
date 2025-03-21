'use client'

import Image from 'next/image'
import {displayProfileName, prefixUrl} from '@/utils'
import Avatar from '@/components/Avatar'
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
        return cities.filter(city => {
            const startDate = new Date(city.start_date!)
            const endDate = new Date(city.end_date!)
            
            switch (filter) {
                case 'ongoing':
                    return startDate <= now && endDate >= now
                case 'upcoming':
                    return startDate > now
                case 'past':
                    return endDate < now
                default:
                    return true
            }
        })
    }

    const filteredCities = filterPopupCities(popupCities)

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
                    return <a key={index} href={`/event/${popupCity.group.handle}`}
                              className="h-[292px] rounded shadow p-3 duration-200 hover:translate-y-[-6px]">
                        <div className="rounded h-[148px] mb-3">
                            <Image className="object-cover w-full h-full rounded"
                                   width={227} height={148}
                                   src={popupCity.image_url || ''} alt=""/>
                        </div>
                        <div className="webkit-box-clamp-1 text-xs">
                            <DisplayDateTime format={'MMM DD'}
                                             dataTimeStr={popupCity.start_date!}/>
                            <span className="mx-1">-</span>
                            <DisplayDateTime format={'MMM DD'} dataTimeStr={popupCity.end_date!}/>
                        </div>
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
                            {!!popupCity.website && 
                                <div
                                onClick={(e) => {e.preventDefault();window.open(prefixUrl(popupCity.website!), '_blank')}}
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