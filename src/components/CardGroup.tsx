import {getAvatar} from "@/utils"
import {GroupWithOwner} from '@sola/sdk'
import Avatar from '@/components/Avatar'
import Link from 'next/link'

export default function CardGroup({group, currProfileHandle}: {group: GroupWithOwner, currProfileHandle?: string}) {
    // Goes to the group's event home (/event/<handle>), not its profile page
    // (/group/<handle>). What someone wants from a group they belong to is its
    // events; the profile page is reachable from there.
    return <Link href={`/event/${group.name}`}
        className="h-[210px] shadow-sm bg-white rounded-2xl shadow-badge p-4 cursor-pointer flex flex-col items-center duration-200 hover:translate-y-[-6px]">
        <Avatar profile={group} size={64} className="mt-4 mb-2"/>
        <div className="w-full font-semibold overflow-hidden text-ellipsis whitespace-nowrap text-center p-2">
            {group.nickname || group.name}
        </div>
        {
            !!currProfileHandle && !!group.role &&
            <div className="bg-gray-100 h-7 p-4 rounded-2xl flex flex-row items-center mt-4">
                {group.role.charAt(0).toUpperCase() + group.role.slice(1)}
            </div>
        }
    </Link>
}
