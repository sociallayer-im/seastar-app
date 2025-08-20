'use client'

import {createTrack, GroupDetail, Profile, Track, TrackDetail, updateTrack} from '@sola/sdk'
import {Dictionary} from '@/lang'
import TrackForm from '@/app/(normal)/event/[grouphandle]/tracks/edit/[trackid]/TrackForm'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {getAuth} from '@/utils'
import {CLIENT_MODE} from '@/app/config'

export interface TrackFormProps {
    trackDetail: TrackDetail
    lang: Dictionary
    groupDetail: GroupDetail
}

export default function CreateTrackForm({trackDetail, lang, groupDetail}: TrackFormProps) {
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const handleCreate = async (track: Track, managers: Profile[], members: Profile[]) => {
        const loading = showLoading()
        try {
            const authToken = getAuth()
            await createTrack({
                params: {
                    track: track,
                    managers: managers,
                    members: members,
                    authToken: authToken!
                },
                clientMode: CLIENT_MODE
            })
            toast({title: lang['Create successful'], variant: 'success'})
            // setTimeout(() => {
            //     window.location.href = `/event/${groupDetail.handle}/tracks`
            // }, 2000)
        } catch (e: unknown) {
            console.error(e)
            toast({
                description: e instanceof Error ? e.message : lang['Create failed'],
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
        onConfirm={handleCreate}
    />
}