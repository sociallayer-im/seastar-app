'use client'

import Cookies from 'js-cookie'
import {getAvatar} from "@/utils"

export default function ProfileMenu(props: { profile: Solar.ProfileSample }) {
    const menus = [
        {label: 'Profile', href: '/profile'},
        {label: 'Settings', href: '/settings'},
        {label: 'Create Group', href: '/group/create'},
        {label: 'Notification', href: '/notification'},
    ]

    const handleSignOut = () => {
        Cookies.remove(process.env.NEXT_PUBLIC_AUTH_FIELD!)
        window.location.reload()
    }

    return <div className="dropdown dropdown-bottom dropdown-end">
        <div tabIndex={0} role="button"
            className="flex-row-item-center btn btn-ghost btn-sm text-xs font-normal px-1">
            <img
                src={getAvatar(props.profile.id, props.profile.image_url)}
                width={16}
                height={16}
                className="rounded-full mr-[2]"
                alt=""/>
            {props.profile.nickname || props.profile.handle}
        </div>
        <ul tabIndex={0}
            className="dropdown-content menu bg-white rounded-lg z-[1] p-2 shadow">
            {
                menus.map((menu, index) => {
                    return <li key={index} >
                        <a href={menu.href} className="whitespace-nowrap">{menu.label}</a>
                    </li>
                })
            }
            <li>
                <div onClick={handleSignOut}>Sign out</div>
            </li>
        </ul>
    </div>
}
