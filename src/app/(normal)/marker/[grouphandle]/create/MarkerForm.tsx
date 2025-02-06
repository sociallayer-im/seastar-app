'use client'

import {useEffect, useState} from 'react'
import {MarkerDraft} from '@sola/sdk'
import {Dictionary} from '@/lang'
import {Input} from '@/components/shadcn/Input'
import {Button} from '@/components/shadcn/Button'
import {MARKER_TYPES} from '@/app/(normal)/map/[grouphandle]/marker/marker_type'
import SearchMarkerLocation from '@/components/client/SearchMarkerLocation'
import GoogleMapProvider from "@/providers/GoogleMapProvider"
import useUploadAvatar from '@/hooks/useUploadAvatar'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'

export interface MarkerFormProps {
    markerDraft: MarkerDraft
    lang: Dictionary,
    onConfirm?: (draft: MarkerDraft) => any | Promise<any>
    onPickLocation?: (draft: MarkerDraft) => void
    onCancel?: () => void
    onRemove?: () => void
}

export default function MarkerForm({
                                       markerDraft,
                                       lang,
                                       onConfirm,
                                       onPickLocation,
                                       onCancel,
                                       onRemove
                                   }: MarkerFormProps) {
    const {uploadAvatar} = useUploadAvatar()
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const [draft, setDraft] = useState<MarkerDraft>(markerDraft)

    const [locationError, setLocationError] = useState('')
    const [titleError, setTitleError] = useState('')

    useEffect(() => {
        console.log('draft', draft)
    }, [draft])

    const scrollToError = () => {
        setTimeout(() => {
            document.querySelector('.err-msg')?.scrollIntoView({behavior: 'smooth', block: 'center'})
        }, 200)
    }

    const handleConfirm = () => {
        if (!draft.geo_lat || !draft.geo_lng) {
            setLocationError('Please pick a location')
            scrollToError()
            return
        } else {
            setLocationError('')
        }

        if (!draft.title) {
            setTitleError('Please input a title')
            scrollToError()
            return
        } else {
            setTitleError('')
        }

        !!onConfirm && onConfirm(draft)
    }

    const getDriveLocation = () => {
        if (navigator.geolocation) {
            const loading = showLoading()
            navigator.geolocation.getCurrentPosition((position) => {
                setDraft({
                    ...draft,
                    geo_lat: position.coords.latitude,
                    geo_lng: position.coords.longitude,
                    formatted_address: `${position.coords.latitude},${position.coords.longitude}`,
                    location: 'Custom Address'
                })
                closeModal(loading)
            }, (error) => {
                closeModal(loading)
                console.error(error)
                toast({
                    title: 'Failed to get location',
                    variant: 'destructive'
                })
            })
        } else {
            toast({
                title: 'Geolocation is not supported by this browser',
                variant: 'destructive'
            })
        }
    }

    return <div className="grid grid-cols-1 gap-6 w-full">
        <div>
            <div className="font-semibold mb-1">{lang['Location']} <span className="text-red-500">*</span>
            </div>
            <GoogleMapProvider>
                <SearchMarkerLocation
                    state={{draft, setDraft}}
                    lang={lang}
                />
            </GoogleMapProvider>
            <div>
                {!!onPickLocation &&
                    <Button
                        onClick={() => onPickLocation(draft)}
                        variant={'secondary'} size={'sm'} className="mr-2 text-sm mt-2">
                        <i className="uil-map-pin-alt text-lg"/>
                        Map Location
                    </Button>
                }
                <Button
                    onClick={getDriveLocation}
                    variant={'secondary'}
                    size={'sm'}
                    className="text-sm mt-2">
                    <i className="uil-location-pin-alt text-lg"/>
                    Device Location
                </Button>
            </div>
            {!!locationError && <div className="text-red-400 mt-2 text-xs err-msg">{locationError}</div>}
        </div>

        <div>
            <div className="font-semibold mb-1">{lang['Title']} <span className="text-red-500">*</span>
            </div>
            <Input className="w-full"
                   placeholder={lang['Input marker title']}
                   value={draft.title}
                   required
                   onChange={e => setDraft({...draft, title: e.target.value})}/>
            {!!titleError && <div className="text-red-400 mt-2 text-xs err-msg">{titleError}</div>}
        </div>

        <div>
            <div className="font-semibold mb-1">{lang['Category']}</div>
            <div className="flex-row-item-center !flex-wrap">
                {
                    MARKER_TYPES.map((type, index) => {
                        return <Button
                            key={index}
                            variant={draft.category === type.label ? 'normal' : 'outline'}
                            size="sm"
                            className="mr-1 mb-1 text-sm"
                            onClick={() => setDraft({...draft, category: type.label})}>
                            {type.label}
                        </Button>
                    })
                }
            </div>
        </div>

        <div>
            <div className="font-semibold mb-1">{lang['Description (Optional)']}</div>
            <div className="flex-row-item-center !flex-wrap">
                <Input className="w-full"
                       placeholder={lang['Input marker description']}
                       value={draft.about || ''}
                       required
                       onChange={e => setDraft({...draft, about: e.target.value})}/>
            </div>
        </div>

        <div>
            <div className="font-semibold mb-1">{lang['Image (Optional)']}</div>
            <div onClick={() => {
                uploadAvatar({onUploaded: (url) => setDraft({...draft, cover_image_url: url})})
            }}
                 className="cursor-pointer bg-secondary rounded-lg h-[170px] flex-col flex justify-center items-center">
                <img className="w-[100px] h-[100px]"
                     src={draft.cover_image_url || '/images/upload_default.png'} alt=""/>
            </div>
        </div>

        <div>
            <div className="font-semibold mb-1">{lang['Link (Optional)']}</div>
            <div className="flex-row-item-center !flex-wrap">
                <Input className="w-full"
                       placeholder={lang['Input marker description']}
                       value={draft.link || ''}
                       required
                       onChange={e => setDraft({...draft, link: e.target.value})}/>
            </div>
        </div>

        <div className="flex-row-item-center justify-center">
            <Button variant={'secondary'} className="flex-1"
                    onClick={() => {
                        !!onCancel && onCancel()
                    }}>
                {lang['Cancel']}
            </Button>

            {!!draft.id &&
                <Button variant={'secondary'} className="flex-1 ml-3 !text-red-500"
                        onClick={() => {
                            !!onRemove && onRemove()
                        }}>
                    {lang['Remove']}
                </Button>
            }

            <Button variant={'primary'} className="flex-1 ml-3"
                    onClick={handleConfirm}
            >{draft.id ? lang['Save'] : lang['Create a Marker']}</Button>
        </div>
    </div>
}