'use client'

import DropdownMenu from "@/components/client/DropdownMenu"
import Avatar from '@/components/Avatar'
import {useEffect, useState} from 'react'
import {Dictionary} from '@/lang'
import {ProfileDetail} from '@sola/sdk'
import {bindEmailUrl, signOut} from '@/utils'

export default function ProfileMenu({lang, currentPath, ...props}: { profile: ProfileDetail, lang: Dictionary, currentPath: string }) {
    const handleSignOut = () => {
        // signOut() owns the cookie's domain, which has to match what setAuth
        // wrote or the removal silently does nothing.
        signOut()
        window.location.reload()
    }

    type Menu = {
        label: string
        href?: string
        id: string
        action?: () => void
    }

    const menus = [
        {id: 'Profile', label: lang['Profile'], href: `/profile/${props.profile.name}`},
        {id: 'Settings', label: lang['Settings'], href: `/profile/${props.profile.name}/edit`},
        {id: 'Create Group', label: lang['Create Group'], href: '/group/create'},
        {id: 'Notification', label: lang['Notification'], href: '/notifications'},
        {id: 'Sign Out', label: lang['Sign Out'], action: handleSignOut},
    ] as Menu[]

    if(!props.profile.email) {
        menus.push({
            id: 'Bind Email',
            label: lang['Bind Email'],
            href: bindEmailUrl(currentPath)
        })
    }

    const handleSelect = (opt: Menu) => {
        !!opt.action && opt.action()
        !!opt.href && (window.location.href = opt.href)
    }

    const [hasUnreadActivities, setHasUnreadActivities] = useState(0)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('message', (msg) => {
                if (msg.data.type === 'has-unread-activities') {
                    setHasUnreadActivities(Math.min(msg.data.data.length, 99))
                }
            })
        }
    }, [])


    return <DropdownMenu
        align="right"
        options={menus}
        value={[]}
        renderOption={(opt) => {
            return <div className="text-nowrap flex-row-item-center">
                {opt.label}
                {!!hasUnreadActivities
                    && opt.id === 'Notification'
                    && <span className="scale-75 text-white flex-row-item-center justify-center font-semibold text-xs  px-2 h-5 bg-red-500 rounded-full ">{hasUnreadActivities}</span>
                }
            </div>
        }}
        valueKey="href"
        onSelect={(opts) => handleSelect(opts[0])}>
        <div className="flex-row-item-center cursor-pointer relative">
            <Avatar profile={props.profile} size={16} className="mr-1"/>
            <div className="max-w-[50px] overflow-hidden whitespace-nowrap text-ellipsis">
                {props.profile.nickname || props.profile.name}
            </div>
            {!!hasUnreadActivities && <i className="absolute w-2 h-2 top-0 left-3 -mt-0.5 -mr-2 bg-red-500 rounded-full" />}
        </div>
    </DropdownMenu>
}
