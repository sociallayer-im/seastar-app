'use client'

import {createMarker, GroupDetail, MarkerDraft} from '@sola/sdk'
import {Button, buttonVariants} from '@/components/shadcn/Button'
import {MARKER_TYPES} from '@/app/(normal)/map/[grouphandle]/marker/marker_type'
import {Dictionary} from '@/lang'
import {useEffect, useRef} from 'react'
import useModal from '@/components/client/Modal/useModal'
import MarkerForm from '@/app/(normal)/marker/[grouphandle]/create/MarkerForm'
import {emptyMarker} from '@/app/(normal)/marker/[grouphandle]/create/data'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {getAuth} from '@/utils'
import {CLIENT_MODE} from '@/app/config'

export default function TopBar({groupDetail, lang, markerCategory}: {
    groupDetail: GroupDetail,
    lang: Dictionary,
    markerCategory?: string
}) {
    const {openModal} = useModal()

    const barRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleScroll = (e: Event) => {
            barRef.current!.scrollLeft = barRef.current!.scrollLeft + (e as WheelEvent).deltaY
        }

        const a = setInterval(() => {
            if (!!barRef.current) {
                barRef.current?.addEventListener('wheel', handleScroll)
                clearInterval(a)
            }
        }, 100)

        return () => {
            clearInterval(a)
            barRef.current?.removeEventListener('wheel', handleScroll)
        }
    }, [])

    useEffect(() => {
        document.getElementById(`category-${markerCategory}`)?.scrollIntoView({behavior: 'instant', block: 'center'})
    }, [])

    const showCreateMarkerModal = (draft?: MarkerDraft) => {
        draft = draft || {
            ...emptyMarker,
            group_id: groupDetail.id
        }
        openModal({
            content: (close) => <DialogCreateMarker
                lang={lang}
                groupDetail={groupDetail}
                draft={draft}
                close={close!}
            />
        })
    }

    useEffect(() => {
        if (typeof window === 'undefined') return
        window.addEventListener('message', (e) => {
            if (e.data.type === 'picked-location' && e.data.location) {
                const location = e.data.location
                const draft = JSON.parse(window.sessionStorage.getItem('marker-draft')!)
                draft.geo_lat = location.lat
                draft.geo_lng = location.lng
                draft.formatted_address = `${location.lat},${location.lng}`
                draft.location = 'Custom Location'
                window.sessionStorage.removeItem('marker-draft')
                showCreateMarkerModal(draft)
            }
        })
    }, [])

    return <div ref={barRef}
                className="flex-row-item-center absolute top-3 justify-start md:justify-center w-full flex-nowrap overflow-auto">

        <Button variant={'primary'} size={'sm'} onClick={() => showCreateMarkerModal()}
                className="bg-background ml-3 text-sm">
            <i className="uil-plus-circle text-lg"/>
            {lang['Create a Marker']}
        </Button>

        <a className={`${buttonVariants({
            variant: markerCategory ? 'white' : 'normal',
            size: 'sm'
        })} bg-background ml-3 text-sm`}
           href={`/map/${groupDetail.handle}/event`}
        >{lang['Events']}</a>

        <a className={`${buttonVariants({
            variant: markerCategory === 'all' ? 'normal' : 'white',
            size: 'sm'
        })} bg-background ml-3 text-sm`}
           href={`/map/${groupDetail.handle}/marker`}
        >{lang['All Markers']}</a>

        {MARKER_TYPES.map((type, i) => {
            return <a key={i}
                      id={`category-${type.label}`}
                      href={`/map/${groupDetail.handle}/marker?category=${encodeURIComponent(type.label)}`}
                      className={`${buttonVariants({
                          variant: markerCategory === type.label ? 'normal' : 'white',
                          size: 'sm'
                      })} bg-background ml-3 text-sm`}>
                {type.label}
            </a>
        })}
    </div>
}

export interface DialogCreateMarkerProps {
    draft: MarkerDraft
    lang: Dictionary
    groupDetail: GroupDetail
    close: () => void
}

function DialogCreateMarker({draft, lang, close, groupDetail}: DialogCreateMarkerProps) {
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const handleCreateMarker = async (draft: MarkerDraft) => {
        const loadingId = showLoading()
        try {
            const authToken = getAuth()
            await createMarker({
                params: {
                    marker: draft,
                    authToken: authToken!
                },
                clientMode: CLIENT_MODE
            })

            toast({
                title: 'Create marker success',
                variant: 'success'
            })

            setTimeout(() => {
                window.location.href = `../../event/[grouphandle]/map/${groupDetail.handle}/marker`
            }, 2000)
        } catch (e: unknown) {
            console.error(e)
            toast({
                title: e instanceof Error ? e.message : 'Create marker failed',
                variant: 'destructive'
            })
        } finally {
            closeModal(loadingId)
        }
    }

    const handlePickLocation = (draft: MarkerDraft) => {
        window.sessionStorage.setItem('marker-draft', JSON.stringify(draft))
        window.postMessage({type: 'pick-location'}, window.location.origin)
        close()
    }

    return <div
        className="max-w-[96vw] w-[500px] bg-white rounded-lg p-3 shadow max-h-[96svh] sm:max-h-[80svh] overflow-auto">
        <div className="font-semibold mb-6 text-lg flex-row-item-center justify-between">
            <div>{lang['Create a Marker']}</div>
            <i className="uil-times-circle text-2xl cursor-pointer text-gray-500" onClick={close}/>
        </div>
        <div className="flex-row-item-center !flex-wrap">
            <MarkerForm
                onCancel={close}
                markerDraft={draft}
                onConfirm={async (draft) => {
                    await handleCreateMarker(draft)
                    close()
                }}
                lang={lang}
                onPickLocation={handlePickLocation}
            />
        </div>
    </div>
}