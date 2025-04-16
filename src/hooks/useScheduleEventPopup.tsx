import useModal from '@/components/client/Modal/useModal'
import {getEventDetailById, getGroupDetailById, getProfileDetailByAuth, GroupDetail, Profile, EventDetail} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {getAuth} from '@/utils'
import dynamic from 'next/dynamic'
import {Dictionary} from '@/lang'
import {useEffect} from 'react'
import {useToast} from '@/components/shadcn/Toast/use-toast'

const DynamicScheduleEventPopup = dynamic(
    () => import('@/components/client/ScheduleEventPopup'),
    {ssr: false}
)

let cachedGroupDetail: GroupDetail | undefined = undefined
let cachedProfile: {token: string, profile: Profile} | undefined = undefined

export default function useScheduleEventPopup() {
    const {openModal, showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const getCachedGroupDetail = async (groupId: number) => {
        if (cachedGroupDetail && cachedGroupDetail.id === groupId) {
            return cachedGroupDetail
        }
        const detail = await getGroupDetailById({
            params: {groupId},
            clientMode: CLIENT_MODE
        })
        cachedGroupDetail = detail || undefined
        return detail
    }
    
    const getCachedProfile = async (token: string) => {
        if (cachedProfile && cachedProfile.token === token) {
            return cachedProfile.profile
        }
        const profile = await getProfileDetailByAuth({params: {authToken: token}, clientMode: CLIENT_MODE})
        cachedProfile = profile ? {token, profile: profile!} : undefined
        return profile
    }

    const showPopup = async (eventId: number, groupId: number, starred: boolean, lang: Dictionary) => {
        const loadingModalId = showLoading()
        try {
            
            const [eventDetail, groupDetail] = await Promise.all([
                getEventDetailById({
                    params: {eventId},
                    clientMode: CLIENT_MODE
                }),
                getCachedGroupDetail(groupId)
            ])
    
            const authToken = getAuth()
            let profile: null | Profile = null
            if (authToken) {
                profile = await getCachedProfile(authToken) || null
            }
    
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
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load event detail',
                variant: 'destructive'
            })
        } finally {
            closeModal(loadingModalId)
        }
    }

    useEffect(() => {
        return () => {
            cachedGroupDetail = undefined
            cachedProfile = undefined
        }
    }, [])

    return {
        showPopup
    }
}