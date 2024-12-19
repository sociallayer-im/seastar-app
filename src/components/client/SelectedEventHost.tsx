import DropdownMenu from "@/components/client/DropdownMenu"
import {Dictionary} from "@/lang"
import {EventDraftType} from "@/app/(normal)/event/[grouphandle]/create/data"
import {useMemo} from "react"
import {getAvatar} from "@/utils"
import {buttonVariants} from "@/components/shadcn/Button"
import {Badge} from "@/components/shadcn/Badge"

interface SelectedEventHostProps {
    lang: Dictionary,
    availableHost: Array<Solar.ProfileSample | Solar.GroupSample>,
    state: { event: EventDraftType, setEvent: (event: EventDraftType) => void }
}

export default function SelectedEventHost({
    lang,
    availableHost,
    state: {event, setEvent}
}: SelectedEventHostProps) {
    const currHost = useMemo(() => {
        const opt = availableHost.find(host => host.id === event.event_roles?.find(role => role.role === 'group_host')?.item_id)
        return opt || availableHost[0]
    }, [availableHost, event])

    const handleSelectedHost = (host: Solar.ProfileSample | Solar.GroupSample) => {
        const eventRole: Solar.EventRole = {
            item_id : host.id,
            nickname: host.nickname,
            image_url: host.image_url,
            role: 'group_host',
            item_type: 'Group',
        }

        const index = availableHost.findIndex(item => item.id === host.id)
        if (index > 0) {
            if (!event.event_roles || event.event_roles.length === 0) {
                setEvent({...event, event_roles: [eventRole]})
            } else {
                const newRoles = [...event.event_roles].filter(role => role.role !== 'group_host')
                newRoles.push(eventRole)
                setEvent({...event, event_roles: newRoles})
            }
        } else {
            setEvent({...event, event_roles: []})
        }
    }

    return <DropdownMenu
        onSelect={(creator) => handleSelectedHost(creator[0])}
        valueKey="id"
        options={availableHost}
        value={currHost ? [currHost] : undefined}
        renderOption={(creator, index) => <div className="flex-row-item-center">
            <img src={getAvatar(creator.id, creator.image_url)} className="w-6 h-6 rounded-full mr-2" alt=""/>
            {creator.nickname || creator.handle}
            {index === 0
                ? <Badge variant="ongoing" className="ml-2">{lang['Profile']}</Badge>
                : <Badge variant="upcoming" className="ml-2">{lang['Group']}</Badge>
            }
        </div>}>
        <div
            className={`${buttonVariants({variant: 'secondary'})} w-full !justify-between items-center cursor-pointer`}>
            <div className="overflow-hidden whitespace-nowrap overflow-ellipsis font-normal flex-row-item-center">
                <img className="w-6 h-6 rounded-full mr-2"
                    src={getAvatar(currHost.id, currHost.image_url)} alt=""/>
                {currHost.nickname || currHost.handle}
            </div>

            <div className="flex items-center">
                <i className="uil-exchange-alt text-lg"/>
            </div>
        </div>
    </DropdownMenu>
}
