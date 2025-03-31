'use client'

import useModal from '@/components/client/Modal/useModal'
import {getVenueDetailById} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import DialogVenue from '@/components/client/DialogVenue'
import {Dictionary} from '@/lang'

export default function VenueDetailBtn({className, label, venueId, lang, groupHandle}:{className?: string, venueId: number, label: string, lang: Dictionary, groupHandle: string}) {

    const {openModal, showLoading, closeModal} = useModal()

    const showVenueDetail = async () => {
        const loading = showLoading()
        const detail = await getVenueDetailById({
            params: {venueId: venueId},
            clientMode: CLIENT_MODE
        })
        closeModal(loading)

        if (!detail) return
        openModal({
            content: (close) => <DialogVenue
                groupHandle={groupHandle}
                venue={detail}
                lang={lang}
                isManager={false}
                close={close!}  />
        })
    }

    return <div className={className} onClick={showVenueDetail}>
        {label}
    </div>
}