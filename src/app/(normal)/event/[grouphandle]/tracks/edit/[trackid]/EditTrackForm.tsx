'use client'

import {GroupDetail, Profile, TrackDetail, Track, updateTrack} from '@sola/sdk'
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

    // soon syncs track managers as a whole set (manager_ids replaces the
    // track's admin roles); member-level roles are not persisted via the API.
    const handleSave = async (track: Track, managers: Profile[], _members: Profile[]) => {
        const loading = showLoading()
        try {
            const authToken = getAuth()
            await updateTrack({
                params: {
                    track: {...track, id: trackDetail.id},
                    managerIds: managers.map(m => m.id),
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
