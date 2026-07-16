'use client'

import {ActivityDetail} from '@sola/sdk'
import {Dictionary} from '@/lang'
import NoData from '@/components/NoData'
import {Button} from '@/components/shadcn/Button'
import {useState} from 'react'
import Avatar from '@/components/Avatar'
import {displayProfileName, getAuth} from '@/utils'
import useShowVoucher from '@/hooks/useShowVoucher'
import {setActivityRead} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import Dynamic from 'next/dynamic'

const DynamicDisplayDateTime = Dynamic(() => import('@/components/client/DisplayDateTime'), {ssr: false})

export default function Notifications({activities, lang}: { activities: ActivityDetail[], lang: Dictionary }) {
    const {showVoucher} = useShowVoucher()


    const [localActivities, setLocalActivities] = useState<ActivityDetail[]>(activities)

    // filter activities and sort them by has_read
    const inviteActivities = localActivities
        .filter(activity => activity.action === 'group_invite/send')

    const badgeActivities = localActivities
        .filter(activity => activity.action === 'voucher/send_badge')

    const [currTab, setCurrTab] = useState('invite')

    const handleShowVoucher = (activity: ActivityDetail) => {
        // soon activities reference the voucher via item_type/item_id.
        const voucherId = activity.item_type === 'Voucher' ? activity.item_id : null
        if (!voucherId) return
        const authToken = getAuth()
        setActivityRead({
            params: {activityId: activity.id, authToken: authToken!},
            clientMode: CLIENT_MODE
        })
        setLocalActivities(localActivities.map(a => a.id === activity.id ? {...a, has_read: true} : a))
        showVoucher(voucherId, lang)
    }

    const handleShowInvite = (activity: ActivityDetail) => {
        const authToken = getAuth()
        setActivityRead({
            params: {activityId: activity.id, authToken: authToken!},
            clientMode: CLIENT_MODE
        })
        setLocalActivities(localActivities.map(a => a.id === activity.id ? {...a, has_read: true} : a))
        // soon activities do not embed the invite object; the invite itself is
        // handled on the group join page / pending invites flow.
        const groupName = typeof activity.payload?.group_name === 'string' ? activity.payload.group_name : null
        if (groupName) {
            window.location.href = `/group/${groupName}`
        }
    }

    return <div className="w-full pb-12">
        <div
            className="py-6 font-semibold text-center text-xl w-full sticky top-8 bg-white">{lang['Notifications']}</div>
        <div className="page-width-md grid grid-cols-1 gap-2">
            <div className="flex-row-item-center mb-3">
                <Button variant={currTab === 'invite' ? 'normal' : 'ghost'}
                        size={'sm'}
                        onClick={() => setCurrTab('invite')}
                        className="mr-2">
                    {lang['Invites']}
                </Button>
                <Button variant={currTab === 'badge' ? 'normal' : 'ghost'}
                        size={'sm'}
                        onClick={() => setCurrTab('badge')}
                        className="mr-2">
                    {lang['Badge']}
                </Button>
            </div>
            {currTab === 'badge' && badgeActivities.map((a, i) =>
                <div className="flex flex-col cursor-pointer border-b-[1px] pb-4" key={i}
                     onClick={() => handleShowVoucher(a)}>
                    <div className="flex-row-item-center mb-2 justify-between">
                        <div className="flex-row-item-center">
                            <Avatar profile={a.initiator} size={24} className="mr-2"/>
                            <div className="text-sm">
                                <span>{displayProfileName(a.initiator)}</span>
                                <span className="text-gray-500 ml-2">
                                    <DynamicDisplayDateTime dataTimeStr={a.created_at}/></span>
                            </div>
                        </div>
                        {!a.has_read && <i className="bg-red-400 w-3 h-3 rounded-full"/>}
                    </div>
                    <div>{displayProfileName(a.initiator)} {lang['Send you a badge']}</div>
                </div>)
            }

            {currTab === 'invite' && inviteActivities.map((a, i) =>
                <div className="flex flex-col cursor-pointer border-b-[1px] pb-4" key={i}
                     onClick={() => handleShowInvite(a)}>
                    <div className="flex-row-item-center mb-2 justify-between">
                        <div className="flex-row-item-center">
                            <Avatar profile={a.initiator} size={24} className="mr-2"/>
                            <div className="text-sm">
                                <span>{displayProfileName(a.initiator)}</span>
                                <span className="text-gray-500 ml-2">
                                    <DynamicDisplayDateTime dataTimeStr={a.created_at}/></span>
                            </div>
                        </div>
                        {!a.has_read && <i className="bg-red-400 w-3 h-3 rounded-full"/>}
                    </div>
                    <div>{typeof a.payload?.message === 'string' ? a.payload.message : lang['Invites']}</div>
                </div>)
            }

            {currTab === 'invite' && inviteActivities.length === 0 && <NoData/>}
            {currTab === 'badge' && badgeActivities.length === 0 && <NoData/>}
        </div>
    </div>
}