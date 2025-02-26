'use client'

import {PopupCity, PopupCityDraft, updatePopupCity} from '@sola/sdk'
import {useState} from 'react'
import {Input} from '@/components/shadcn/Input'
import DatePicker from '@/components/client/DatePicker'
import Dayjs from '@/libs/dayjs'
import {Button} from '@/components/shadcn/Button'
import {Dictionary} from '@/lang'
import useUploadImage from '@/hooks/useUploadImage'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import useModal from '@/components/client/Modal/useModal'
import {getAuth} from '@/utils'
import {CLIENT_MODE} from '@/app/config'

export default function EditPopupCityForm({popupCity, lang}: { popupCity: PopupCityDraft, lang: Dictionary }) {
    const {uploadImage} = useUploadImage()
    const {toast} = useToast()
    const {showLoading, closeModal} = useModal()

    const [draft, setDraft] = useState<PopupCityDraft>(popupCity)
    const [titleErr, setTitleErr] = useState('')
    const [coverErr, setCoverErr] = useState('')
    const [locationErr, setLocationErr] = useState('')
    const [durationErr, setDurationErr] = useState('')

    const handleSave = async () => {
        if (!draft.title.trim()) {
            setTitleErr(lang['Please input Popup-City name'])
            return
        } else {
            setTitleErr('')
        }

        if (!draft.image_url) {
            setCoverErr(lang['Please upload a cover image'])
            return
        } else {
            setCoverErr('')
        }

        if (!draft.location) {
            setLocationErr(lang['Please input the city name'])
            return
        } else {
            setLocationErr('')
        }

        if (!draft.start_date || !draft.end_date) {
            setDurationErr(lang['Please input the duration'])
            return
        } else {
            setDurationErr('')
        }

        if (draft.start_date >= draft.end_date) {
            setDurationErr(lang['The start time should be before the end time'])
            return
        } else {
            setDurationErr('')
        }

        const loading = showLoading()
        try {
            const authToken = getAuth()
            await updatePopupCity({
                params: {
                    popupCity: draft as PopupCity,
                    authToken: authToken!
                },
                clientMode: CLIENT_MODE
            })
            toast({title: lang['Save successful'], variant: 'success'})
            setTimeout(() => {
                window.history.go(-1)
            }, 1000)
        } catch (e: unknown) {
            console.error(e)
            toast({
                description: e instanceof Error ? e.message : lang['Save failed'],
                variant: 'destructive'
            })
        } finally {
            closeModal(loading)
        }
    }

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width-md min-h-[calc(100svh-48px)] px-3 !pb-12 pt-0">
            <div className="my-6 font-semibold text-center text-xl">
                {lang['Edit Popup-City']}
            </div>

            <div className="my-4">
                <div className="my-3">
                    <div className="font-semibold mb-1">{lang['Popup-City Name']}</div>
                    <Input placeholder={lang['City Name']}
                           className="w-full"
                           value={draft.title || ''}
                           onChange={e => setDraft({...draft, title: e.target.value})}/>
                    <div className="text-red-400 text-sm mt-2">{titleErr}</div>
                </div>

                <div className="my-3">
                    <div className="font-semibold mb-1">{lang['Cover']}</div>
                    <div onClick={() => {
                        uploadImage().then(url => {
                            setDraft({
                                ...draft,
                                image_url: url
                            })
                        })
                    }}
                         className="cursor-pointer bg-secondary rounded-lg h-[170px] flex-col flex justify-center items-center">
                        {draft.image_url
                            ? <img className="max-h-[150px]"
                                   src={draft.image_url} alt=""/>
                            : <img className="w-[100px] h-[100px] rounded-full"
                                   src='/images/upload_default.png' alt=""/>
                        }
                    </div>
                    <div className="text-red-400 text-sm mt-2">{coverErr}</div>
                </div>

                <div className="my-3">
                    <div className="font-semibold mb-1">{lang['City Name']}</div>
                    <Input placeholder={lang['City Name']}
                           className="w-full"
                           value={draft.location || ''}
                           onChange={e => setDraft({...draft, location: e.target.value})}/>
                    <div className="text-red-400 text-sm mt-2">{locationErr}</div>
                </div>

                <div className="my-3">
                    <div className="font-semibold mb-1">{lang['Website (optional)']}</div>
                    <Input placeholder="https://..."
                           className="w-full"
                           value={draft.website || ''}
                           onChange={e => setDraft({...draft, website: e.target.value})}/>
                </div>

                <div className="my-3">
                    <div className="font-semibold mb-1">{lang['Duration']}</div>
                    <div className="flex-row-item-center">
                        <DatePicker
                            initDate={draft.start_date || Dayjs().format('YYYY/MM/DD')}
                            className="flex-1"
                            onChange={(date) => {
                                setDraft({
                                    ...draft,
                                    start_date: date
                                })
                            }}>
                            <Input placeholder={'YYYY/MM/DD'}
                                   className="w-full"
                                   startAdornment={<i className="uil-calendar-alt"/>}
                                   value={draft.start_date || ''}
                                   readOnly/>
                        </DatePicker>
                        <div className="mx-3">To</div>
                        <DatePicker
                            initDate={draft.end_date || Dayjs().format('YYYY/MM/DD')}
                            className="flex-1"
                            onChange={(date) => {
                                setDraft({
                                    ...draft,
                                    end_date: date
                                })
                            }}>
                            <Input placeholder={'YYYY/MM/DD'}
                                   className="w-full"
                                   startAdornment={<i className="uil-calendar-alt"/>}
                                   value={draft.end_date || ''}
                                   readOnly/>
                        </DatePicker>
                    </div>
                    <div className="text-red-400 text-sm mt-2">{durationErr}</div>
                </div>

                <div className="flex-row-item-center mt-4">
                    <Button
                        onClick={() => {
                            window.history.go(-1)
                        }}
                        variant={'secondary'}
                        className="w-full mr-3">
                        {lang['Back']}
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant={'primary'}
                        className="w-full">
                        {lang['Save']}
                    </Button>
                </div>
            </div>
        </div>
    </div>
}