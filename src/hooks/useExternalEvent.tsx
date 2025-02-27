import useModal from '@/components/client/Modal/useModal'
import {Dictionary} from '@/lang'
import {Button} from '@/components/shadcn/Button'
import {Input} from '@/components/shadcn/Input'
import {useState} from 'react'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {EventDraftType} from '@sola/sdk'


export default function useExternalEvent() {
    const {openModal, showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const getLumaEvent = (lang: Dictionary):Promise<EventDraftType | undefined> => {
        return new Promise((resolve) => {
            const loadEvent = async (slug: string) => {
                const loading = showLoading()
                try {
                    const res = await fetch(`https://luma-snap.unistate.io/${slug}`)
                    if (!res.ok) throw new Error(`Failed to load luma event ${res.statusText}`)

                    const data = await res.json()
                    if (data.error) throw new Error(`Failed to load luma event ${data.error}`)

                    const eventData = {
                        cover_url: data.cover_image || null,
                        title: data.title,
                        content: data.description || null,
                        geo_lat: data.location?.coordinates?.latitude || null,
                        geo_lng: data.location?.coordinates?.longitude || null,
                        formatted_address: data.location?.venue || null,
                        location:data.location?.coordinates?.locality || null,
                        location_data: data.location?.coordinates?.place_id || null,
                        start_time: data.start?.utc,
                        end_time: data.end?.utc,
                        timezone: data.start?.timezone,
                        event_roles: data.guests ? data.guests.map((g: any) => {
                            return {
                                role: 'co_host',
                                item_id: null,
                                nickname: g.name || 'unknown',
                                image_url: g.avatar_url
                            }
                        }): []

                    }

                    return eventData as EventDraftType
                } catch (e) {
                    console.error('[load luma Event]: ', e)
                    toast({title: 'Failed to load the event', variant: 'destructive'})
                } finally {
                    closeModal(loading)
                }
            }

            openModal({
                content: (close) => (
                    <DialogInputLumaEventUrl
                        lang={lang}
                        onConfig={async (url) => {
                            const res = await loadEvent(url)
                            !!res && close!()
                            resolve(res)
                        }}
                        onClose={() => {
                            close!()
                            resolve(undefined)
                        }}
                    />
                ),
            })
        })
    }

    return {
        getLumaEvent
    }
}

function DialogInputLumaEventUrl({lang, onConfig, onClose}: {
    lang: Dictionary,
    onConfig: (url: string) => void,
    onClose: () => void
}) {
    const [url, setUrl] = useState<string>('')
    const [err, setErr] = useState<string>('')

    return <div className="max-w-[500px] p-4 rounded-lg bg-background shadow" style={{width: '90vw'}}>
        <div className="text-lg font-semibold">{lang['Input event URL']}</div>
        <div className="mb-3">{lang['Support URL of Luma']}</div>

        <Input
            className="w-full"
            placeholder={'https://lu.ma/...'}
            value={url} onChange={e => setUrl(e.target.value)}/>
        <div className="text-red-400 text-sm mt-1 mb-3">{err}</div>

        <div className="flex-row-item-center">
            <Button variant={'secondary'} className="w-full mr-3" onClick={onClose}>{lang['Cancel']}</Button>
            <Button variant={'primary'} className="w-full"
                    disabled={!url.trim()}
                    onClick={() => {
                        const slug = url.match(/https:\/\/lu\.ma\/([^\/?]+)/)?.[1] || ''
                        if (!slug) {
                            setErr('Invalid URL')
                            return
                        }
                        setErr('')
                        onConfig(slug)
                    }}
            >{lang['Load the Event URL']}</Button>
        </div>
    </div>
}