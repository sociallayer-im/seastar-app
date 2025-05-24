'use client'

import {Dictionary} from '@/lang'
import {BadgeClass, Group, Profile, EventWithJoinStatus} from '@sola/sdk'
import {Input} from '@/components/shadcn/Input'
import {useState} from 'react'
import {Button,} from '@/components/shadcn/Button'
import CardEvent from '@/components/CardEvent'
import {displayProfileName} from '@/utils'
import Avatar from '@/components/Avatar'
import Image from 'next/image'

export interface SearchPageProps {
    lang: Dictionary,
    tab: string,
    keyword: string
    result: {
        events: EventWithJoinStatus[],
        groups: Group[],
        profiles: Profile[],
        badgeClasses: BadgeClass[]
    }
}

export default function SearchResult({lang, tab, keyword, result}: SearchPageProps) {
    const [currKeyword, setCurrKeyword] = useState(keyword)
    const [currTab, setCurrTab] = useState(tab)

    const handleSearch = () => {
        if (!currKeyword.trim()) return
        location.href = `/search?keyword=${encodeURIComponent(currKeyword)}&tab=${currTab}`
    }

    const tabs = [{
        id: 'event',
        label: lang['Event']
    },
        {
            id: 'group',
            label: lang['Group']
        },
        {
            id: 'profile',
            label: lang['User']
        },
        {
            id: 'badge',
            label: lang['Badge']
        }
    ]

    const changeTab = (tab: string) => {
        const newUrl = new URL(location.href)
        newUrl.searchParams.set('tab', tab)
        newUrl.searchParams.set('keyword', currKeyword)
        window.history.replaceState(null, '', newUrl.toString())
        setCurrTab(tab)
    }

    return <div className="min-h-[100svh] w-full">
        <div className="pt-8 pb-4 sticky top-8 z-[200] bg-background">
            <div className="page-width-md">
                <div className="flex-row-item-center">
                    <Input
                        onKeyUp={e => {
                            if (e.key === 'Enter') {
                                handleSearch()
                            }
                        }}
                        placeholder={lang['Events, Groups, Badges, Users']}
                        className="flex-1"
                        value={currKeyword}
                        onChange={e => {
                            setCurrKeyword(e.target.value)
                        }}/>
                    <Button variant={'special'} onClick={handleSearch} className="h-[48px] ml-3">
                        <i className="uil-search text-lg w-10"></i>
                    </Button>
                </div>
                <div className="flex gap-2 mt-3">
                    {tabs.map((item, index) => {
                        return <Button key={index}
                                       variant={currTab === item.id ? 'normal' : 'ghost'} size={'sm'}
                                       onClick={() => changeTab(item.id)}>
                            {item.label}
                        </Button>
                    })
                    }
                </div>
            </div>
        </div>
        <div className="page-width-md min-h-[100svh] px-3 !pt-0 !pb-16">
            {currTab === 'event' &&
                <div className="grid grid-cols-1 gap-3">
                    <div>{result.events.length} Results</div>
                    {result.events.map((event, index) => {
                        return <CardEvent event={event} key={index} lang={lang}/>
                    })}
                </div>
            }

            {currTab === 'group' &&
                <div className="grid grid-cols-1 gap-3">
                    <div>{result.groups.length} Results</div>
                    {result.groups.map((group, index) => {
                        return <a key={index}
                                  className="flex-row-item-center shadow rounded-lg px-6 py-4 duration-300 hover:scale-105"
                                  href={`/group/${group.handle}`}>
                            <div className="relative mr-2">
                                <Avatar profile={group} size={28}/>
                            </div>
                            <div>{displayProfileName(group)}</div>
                        </a>
                    })}
                </div>
            }

            {currTab === 'profile' &&
                <div className="grid grid-cols-1 gap-3">
                    <div>{result.profiles.length} Results</div>
                    {result.profiles.map((profile, index) => {
                        return <a key={index}
                                  className="flex-row-item-center shadow rounded-lg px-6 py-4 duration-300 hover:scale-105"
                                  href={`/profile/${profile.handle}`}>
                            <div className="relative mr-2">
                                <Avatar profile={profile} size={28}/>
                            </div>
                            <div>{displayProfileName(profile)}</div>
                        </a>
                    })}
                </div>
            }

            {currTab === 'badge' &&
                <div>
                    <div>{result.badgeClasses.length} Results</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4">
                        {
                            result.badgeClasses.map((badgeClass, i) => {
                                return <a key={i} href={`/badge-class/${badgeClass.id}`}
                                          className="h-[182px] bg-white shadow rounded-2xl shadow-badge p-2 cursor-pointer duration-200 hover:translate-y-[-6px]">
                                    <div
                                        className="bg-gray-100 flex flex-row items-center justify-center h-[130px] rounded-2xl relative overflow-auto">
                                        <Image width={90} height={90}
                                               src={badgeClass.image_url!}
                                               alt=""
                                               className="-[90px] h-[90px] rounded-full"/>
                                    </div>
                                    <div
                                        className="font-semibold overflow-hidden overflow-ellipsis whitespace-nowrap text-center p-2">
                                        {badgeClass.title}
                                    </div>
                                </a>
                            })
                        }
                    </div>
                </div>
            }
        </div>
    </div>
}