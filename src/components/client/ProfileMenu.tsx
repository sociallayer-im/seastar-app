'use client'

import Cookies from 'js-cookie'
import {getAvatar} from "@/utils"
import DropdownMenu from "@/components/client/DropdownMenu"
import Image from "next/image"

export default function ProfileMenu(props: { profile: Solar.ProfileSample }) {
    const handleSignOut = () => {
        const currTopDomain = window.location.hostname.split('.').slice(-2).join('.')
        Cookies.remove(process.env.NEXT_PUBLIC_AUTH_FIELD!, {domain: currTopDomain})
        window.location.reload()
    }

    type Menu = {
        label: string
        href?: string
        action?: () => void
    }

    const menus = [
        {label: 'Profile', href: `/profile/${props.profile.handle}`},
        {label: 'Settings', href: `/profile/${props.profile.handle}/edit`},
        {label: 'Create Group', href: '/create-group'},
        {label: 'Notification', href: '/notification'},
        {label: 'Sign Out', action: handleSignOut},
    ] as Menu[]

    const handleSelect = (opt: Menu) => {
        !!opt.action && opt.action()
        !!opt.href && (window.location.href = opt.href)
    }


    return <DropdownMenu
        align="right"
        options={menus}
        value={[]}
        renderOption={(opt) => <div className="text-nowrap">{opt.label}</div>}
        valueKey="href"
        onSelect={(opts) => handleSelect(opts[0])}>
        <div className="flex-row-item-center cursor-pointer">
            <Image
                src={getAvatar(props.profile.id, props.profile.image_url)}
                width={16}
                height={16}
                className="rounded-full mr-1"
                alt=""/>
            <div className="max-w-[50px] overflow-hidden whitespace-nowrap overflow-ellipsis">
                {props.profile.nickname || props.profile.handle}
            </div>
        </div>
    </DropdownMenu>
}
