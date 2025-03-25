'use client'

import {GroupDetail, removeVenue} from '@sola/sdk'
import {Dictionary} from '@/lang'
import {buttonVariants} from '@/components/shadcn/Button'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import {getAuth} from '@/utils'
import {CLIENT_MODE} from '@/app/config'
import VenueCard from './components/VenueCard'

export default function VenueListForm({groupDetail, lang, isManager}: { groupDetail: GroupDetail, isManager?: boolean, lang: Dictionary }) {
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()
    const {showConfirmDialog} = useConfirmDialog()

    const handleRemove = async (venueId: number) => {
        showConfirmDialog({
            lang: lang,
            title: lang['Remove Venue'],
            content: lang['Are you sure you want to remove this venue?'],
            onConfig: async () => {
                const loading = showLoading()
                try {
                    const authToken = getAuth()
                    await removeVenue({
                        params: {
                            venueId: venueId,
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

    return (
        <div className="min-h-[calc(100svh-48px)] w-full">
            <div className="page-width-md min-h-[calc(100svh-48px)] px-3 !pb-12 pt-0">
                <div className="flex justify-center items-center py-6 relative">
                    <h1 className="text-2xl font-semibold">{lang['Venues']}</h1>
                    {isManager &&
                        <a href={`/event/${groupDetail.handle}/venues/create`}
                           className="text-primary-foreground absolute right-0 font-semibold">
                            {lang['Create a Venue']}
                        </a>
                    }
                </div>

                <div className="grid grid-cols-1 gap-6 w-full">
                    {groupDetail.venues.map((venue, index) => (
                        <VenueCard
                            isManager={isManager}
                            key={index}
                            venue={venue}
                            lang={lang}
                            groupHandle={groupDetail.handle}
                            onRemove={handleRemove}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}