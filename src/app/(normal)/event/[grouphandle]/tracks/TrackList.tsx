'use client'

import {GroupDetail, removeTrack} from '@sola/sdk'
import {Dictionary} from '@/lang'
import {buttonVariants} from '@/components/shadcn/Button'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {getAuth} from '@/utils'
import {CLIENT_MODE} from '@/app/config'
import NoData from '@/components/NoData'


export default function TrackList({groupDetail, lang}: { groupDetail: GroupDetail, lang: Dictionary }) {

    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()
    const {showConfirmDialog} = useConfirmDialog()

    const handleRemove = async (trackId: number) => {
        showConfirmDialog({
            lang: lang,
            title: lang['Remove Track'],
            content: lang['Are you sure you want to remove this track?'],
            onConfig: async () => {
                const loading = showLoading()
                try {
                    const authToken = getAuth()
                    await removeTrack({
                        params: {
                            trackId: trackId,
                            authToken: authToken!
                        },
                        clientMode: CLIENT_MODE
                    })
                   window.location.reload()
                } catch (e: unknown) {
                    console.error(e)
                    toast({
                        description: e instanceof Error ? e.message : lang['Remove failed'],
                        variant: 'destructive'
                    })
                } finally {
                    closeModal(loading)
                }
            }
        })
    }

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width-md min-h-[calc(100svh-48px)] px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Tracks']}</div>
            {!groupDetail.tracks?.length && <NoData/>}
            <div className="grid grid-cols-1 gap-3">
                {
                    groupDetail.tracks?.map((track, index) => {
                        return <div key={index} className="flex-row-item-center w-full">
                            <a href={`/event/${groupDetail.handle}/tracks/edit/${track.id}`}
                               className={`${buttonVariants({variant: 'secondary'})} flex-1 mr-3 justify-between`}>
                                <div className="font-normal">{track.title}</div>
                                <i className="uil-edit-alt"/>
                            </a>
                            <i onClick={() => handleRemove(track.id)}
                               className="uil-minus-circle text-3xl text-gray-500 cursor-pointer"/>
                        </div>
                    })
                }
            </div>

            <a href={`/event/${groupDetail.handle}/tracks/create/`} className={`${buttonVariants({variant: 'secondary'})} mt-3`}>
                <i className="uil-plus-circle text-lg"/>
                {lang['Create a Track']}
            </a>
        </div>
    </div>
}