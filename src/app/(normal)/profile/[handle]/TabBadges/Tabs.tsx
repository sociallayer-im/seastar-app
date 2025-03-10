'use client'

import {Button} from "@/components/shadcn/Button"
import {useState} from "react"
import {type Badge, type BadgeClass} from "@sola/sdk"
import NoData from "@/components/NoData"
import Image from 'next/image'

export default function Tabs({labels, created, owned, isSelf}: {
    owned: Badge[],
    created: BadgeClass[],
    handle: string,
    isSelf: boolean,
    labels?: { created?: string, collected?: string }
}) {
    const [tab, setTab] = useState('collected')

    return <div className="py-4">
        <div className="flex flex-row-item-center">
            <Button variant={tab === 'collected' ? 'outline' : 'ghost'}
                size={'sm'}
                onClick={() => setTab('collected')}>
                <span className="font-normal text-sm">{labels?.collected || 'Collected'}</span>
            </Button>
            <Button variant={tab === 'created' ? 'outline' : 'ghost'}
                className={'font-normal'}
                size={'sm'}
                onClick={() => setTab('created')}>
                <span className="font-normal text-sm">{labels?.created || 'Created'}</span>
            </Button>
        </div>

        {(tab=== 'collected' && !owned.length) || (tab === 'created' && !created.length) && <NoData />}

        {tab === 'collected' &&
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4">
                {owned.map((badge, i) => {
                    const title = badge.badge_class.badge_type === 'private' && !isSelf ? '🔒' : badge.badge_class.title
                    const cover = badge.badge_class.badge_type === 'private' && !isSelf ? '/images/badge_private.png' : badge.badge_class.image_url

                    return <a key={i} href={`/badge/${badge.id}`}
                        className="h-[182px] bg-white shadow rounded-2xl shadow-badge p-2 cursor-pointer duration-200 hover:translate-y-[-6px]">
                        <div
                            className="bg-gray-100 flex flex-row items-center justify-center h-[130px] rounded-2xl relative overflow-auto">
                            {
                                badge.display === 'top' &&
                                <div
                                    className="bg-[#ffdc62] rounded-br-lg px-3 py-1 font-semibold absolute left-0 top-0">
                                    Top
                                </div>
                            }
                            <Image className="w-[90px] h-[90px] rounded-full" width={90} height={90}
                                   src={cover!} alt=""/>
                        </div>
                        <div
                            className="font-semibold overflow-hidden overflow-ellipsis whitespace-nowrap text-center p-2">
                            {title}
                        </div>
                    </a>
                })}
            </div>
        }

        { tab === 'created' &&
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4">
                {created.map((badgeClass, i) => {
                    const title = badgeClass.badge_type === 'private' && !isSelf ? '🔒' : badgeClass.title
                    const cover = badgeClass.badge_type === 'private' && !isSelf ? '/images/badge_private.png' : badgeClass.image_url

                    return <a key={i} href={`/badge-class/${badgeClass.id}`}
                        className="h-[182px] bg-white shadow rounded-2xl shadow-badge p-2 cursor-pointer duration-200 hover:translate-y-[-6px]">
                        <div
                            className="bg-gray-100 flex flex-row items-center justify-center h-[130px] rounded-2xl relative overflow-auto">
                            {badgeClass.display === 'top' && <div
                                className="bg-[#ffdc62] rounded-br-lg px-3 py-1 font-semibold absolute left-0 top-0">Top
                            </div>
                            }
                            <Image className="w-[90px] h-[90px] rounded-full" width={90} height={90}
                                src={cover!} alt=""/>
                        </div>
                        <div
                            className="font-semibold overflow-hidden overflow-ellipsis whitespace-nowrap text-center p-2">
                            {title}
                        </div>
                    </a>
                })}
            </div>
        }
    </div>
}
