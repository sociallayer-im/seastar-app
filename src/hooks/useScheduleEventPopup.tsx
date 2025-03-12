import useModal from '@/components/client/Modal/useModal'
import {getEventDetailById, getGroupDetailById, getProfileDetailByAuth, Profile} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {checkEventPermissionsForProfile, getAuth} from '@/utils'
import dynamic from 'next/dynamic'
import {Dictionary} from '@/lang'

const DynamicScheduleEventPopup = dynamic(
    () => import('@/components/client/ScheduleEventPopup'),
    {ssr: false}
)

export default function useScheduleEventPopup() {
    const {openModal, showLoading, closeModal} = useModal()


    const showPopup = async (eventId: number, starred: boolean, lang: Dictionary) => {
        const loadingModalId = showLoading()
        const eventDetail = await getEventDetailById({
            params: {eventId},
            clientMode: CLIENT_MODE
        })
        const groupDetail = await getGroupDetailById({
            params: {groupId: eventDetail?.group_id!},
            clientMode: CLIENT_MODE
        })
        const authToken = getAuth()
        let profile: null | Profile = null
        if (authToken) {
            profile = await getProfileDetailByAuth({
                params: {authToken},
                clientMode: CLIENT_MODE
            })
        }

        closeModal(loadingModalId)
        const url = new URL(window.location.href)
        url.searchParams.set('popup', eventId.toString())
        window.history.pushState({}, '', url.toString())
        openModal({
            content: () => <DynamicScheduleEventPopup
                profile={profile || undefined}
                groupDetail={groupDetail!}
                starred={starred}
                lang={lang}
                event={eventDetail!}
                timezone={groupDetail?.timezone|| eventDetail?.timezone || 'UTC'}
            />,
            onClose: () => {
                const url = new URL(window.location.href)
                url.searchParams.delete('popup')
                window.history.pushState({}, '', url.toString())
            }
        })
    }

    return {
        showPopup
    }
}