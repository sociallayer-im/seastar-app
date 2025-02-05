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

export interface MarkerFormProps {
    markerDraft: MarkerDraft
    lang: Dictionary,
    onConfirm?:  (draft: MarkerDraft) => any | Promise<any>
    onPickLocation?: () => void
    onCancel?: () => void
}

export default function MarkerForm({markerDraft, lang, onConfirm, onPickLocation, onCancel}: MarkerFormProps) {
    const {uploadAvatar} = useUploadAvatar()

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

        <div className="grid grid-cols-2 gap-3">
            <Button variant={'secondary'}
                    onClick={() => {
                        !!onCancel && onCancel()
                    }}>
                {lang['Cancel']}
            </Button>
            <Button variant={'primary'}
                    onClick={handleConfirm}
            >{lang['Create a Marker']}</Button>
        </div>
    </div>
}