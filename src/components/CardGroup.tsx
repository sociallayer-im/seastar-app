import {getAvatar} from "@/utils"
import {GroupWithOwner} from '@sola/sdk'
import Avatar from '@/components/Avatar'

export default function CardGroup({group, currProfileHandle}: {group: GroupWithOwner, currProfileHandle?: string}) {
    return <a href={`/group/${group.handle}`}
        className="h-[210px] shadow bg-white rounded-2xl shadow-badge p-4 cursor-pointer flex flex-col items-center duration-200 hover:translate-y-[-6px]">
        <Avatar profile={group} size={64} className="mt-4 mb-2"/>
        <div className="w-full font-semibold overflow-hidden overflow-ellipsis whitespace-nowrap text-center p-2">
            {group.nickname || group.handle}
        </div>
        {
            !!currProfileHandle &&
            <div className="bg-gray-100 h-7 p-4 rounded-2xl flex flex-row items-center mt-4">
                {group.owner.handle === currProfileHandle ? 'Owner' : 'Member'}
            </div>
        }
    </a>
}
