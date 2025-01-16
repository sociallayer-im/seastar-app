'use client'

import {displayProfileName, getAvatar} from '@/utils'
import {Profile} from '@sola/sdk'
import {Dictionary} from '@/lang'
import {useState} from 'react'

export interface FollowerListProps {
    profile: Profile
    followers: Profile[]
    followings: Profile[],
    lang: Dictionary
}

export default function FollowerList({profile, followers, followings, lang}: FollowerListProps) {
    const [tab, setTab] = useState<'followers' | 'following'>('followers')

    return <div className="min-h-[calc(100svh-48px)] w-full bg-[#f8f8f8]">
        <div className="py-6 font-semibold text-center text-xl bg-white">{displayProfileName(profile)}</div>
        <div className="bg-white mt-[1px]">
            <div className="page-width-md flex-row-item-center">
                <div className="flex-1 text-center py-3 font-semibold relative cursor-pointer"
                     onClick={() => setTab('followers')}>
                    {lang['Followers']}
                    {tab === 'followers' && <div
                        className="absolute bottom-1 w-9 h-1 bg-primary left-[50%] translate-x-[-50%] rounded-2xl"/>}
                </div>
                <div className="flex-1 text-center py-3 font-semibold relative cursor-pointer"
                     onClick={() => setTab('following')}>
                    {lang['Following']}
                    {tab === 'following' && <div
                        className="absolute bottom-1 w-9 h-1 bg-primary left-[50%] translate-x-[-50%] rounded-2xl"/>}
                </div>
            </div>
        </div>

        {tab === 'followers' ?
            <div className="page-width-md grid grid-cols-1 gap-3 !pt-3">
                {
                    followers.map((follower, i) => {
                        return <a key={i}
                                  className="flex-row-item-center shadow rounded-lg px-6 py-4 duration-300 hover:scale-105"
                                  href={`/profile/${follower.handle}`}>
                            <div className="relative mr-2">
                                <img
                                    className="w-7 h-7 rounded-full"
                                    src={getAvatar(follower.id, follower.image_url)} alt=""/>
                            </div>
                            <div>{displayProfileName(follower)}</div>
                        </a>
                    })
                }
            </div> :
            <div className="page-width-md grid grid-cols-1 gap-3 !pt-3">
                {
                    followings.map((follower, i) => {
                        return <a key={i}
                                  className="flex-row-item-center shadow rounded-lg px-6 py-4 duration-300 hover:scale-105"
                                  href={`/profile/${follower.handle}`}>
                            <div className="relative mr-2">
                                <img
                                    className="w-7 h-7 rounded-full"
                                    src={getAvatar(follower.id, follower.image_url)} alt=""/>
                            </div>
                            <div>{displayProfileName(follower)}</div>
                        </a>
                    })
                }
            </div>
        }
    </div>
}