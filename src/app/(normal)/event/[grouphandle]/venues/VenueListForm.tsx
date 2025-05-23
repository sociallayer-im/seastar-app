'use client'

import {GroupDetail, removeVenue} from '@sola/sdk'
import {Dictionary} from '@/lang'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import {getAuth} from '@/utils'
import {CLIENT_MODE} from '@/app/config'
import VenueCard from './components/VenueCard'
import NoData from '@/components/NoData'
import Link from 'next/link'

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
                    <Link href={`/event/${groupDetail.handle}`} className="absolute left-0 text-primary-foreground font-semibold flex items-center gap-1">
                        <i className="uil-arrow-left" />
                        {lang['Back']}
                    </Link>
                    <h1 className="text-2xl font-semibold">{lang['Venues']}</h1>
                    {isManager &&
                        <a href={`/event/${groupDetail.handle}/venues/create`}
                           className="text-primary-foreground absolute right-0 font-semibold">
                            <span className="hidden sm:block">{lang['Create a Venue']}</span>
                            <i className="uil-plus-circle text-3xl block sm:hidden" />
                        </a>
                    }
                </div>

                <div className="grid grid-cols-1 gap-6 w-full">
                    {!groupDetail.venues.length && <NoData/>}
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