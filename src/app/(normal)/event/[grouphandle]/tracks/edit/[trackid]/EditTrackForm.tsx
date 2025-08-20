'use client'

import {GroupDetail, Profile, TrackDetail, Track, updateTrackV2} from '@sola/sdk'
import {Dictionary} from '@/lang'
import TrackForm from '@/app/(normal)/event/[grouphandle]/tracks/edit/[trackid]/TrackForm'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {getAuth} from '@/utils'
import {CLIENT_MODE} from '@/app/config'

export default function EditTrackForm({trackDetail, lang, groupDetail}: {
    trackDetail: TrackDetail,
    lang: Dictionary,
    groupDetail: GroupDetail
}) {

    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const handleSave = async (track: Track, managers: Profile[], members: Profile[]) => {
        const loading = showLoading()
        try {
            const authToken = getAuth()
            const oldManagersIds = trackDetail.track_roles
                .filter(r => r.role === 'manager')
                .map(r => r.profile_id )
            const oldMembersIds = trackDetail.track_roles
                .filter(r => r.role === 'member')
                .map(r => r.profile_id )
            
            const newManagersIds = managers.map(m => m.id)
            const newMembersIds = members.map(m => m.id)
            let addManagersIds: number[] = [], removedManagersIds: number[] = []
            let addMembersIds: number[] = [], removeMembersIds: number[] = []       
            
            if(oldManagersIds.length) {
                removedManagersIds =  oldManagersIds.filter(m => !newManagersIds.includes(m))
            }

            if(newManagersIds.length) {
                addManagersIds = newManagersIds.filter(m => !oldManagersIds.includes(m))
            }

            if(oldMembersIds.length) {
                removeMembersIds =  oldMembersIds.filter(m => !newMembersIds.includes(m))
            }

            if(newMembersIds.length) {
                addMembersIds = newMembersIds.filter(m => !oldMembersIds.includes(m))
            }

            await updateTrackV2({
                params: {
                    track: track,
                    addManagerIds: addManagersIds,
                    removeManagerIds: removedManagersIds,
                    addMemberIds: addMembersIds,
                    removeMemberIds: removeMembersIds,
                    authToken: authToken!
                },
                clientMode: CLIENT_MODE
            })
            toast({title: lang['Save successful'], variant: 'success'})
        } catch (e: unknown) {
            console.error(e)
            toast({
                description: e instanceof Error ? e.message : lang['Save failed'],
                variant: 'destructive'
            })
        } finally {
            closeModal(loading)
        }
    }

    return <TrackForm
        trackDetail={trackDetail}
        lang={lang}
        groupDetail={groupDetail}
        onConfirm={handleSave}
    />
}