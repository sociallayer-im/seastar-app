'use client'

import {GroupDetail, updateGroup} from '@sola/sdk'
import {useState} from 'react'
import {Input} from '@/components/shadcn/Input'
import DatePicker from '@/components/client/DatePicker'
import Dayjs from '@/libs/dayjs'
import {Button} from '@/components/shadcn/Button'
import {Dictionary} from '@/lang'
import useUploadImage from '@/hooks/useUploadImage'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import useModal from '@/components/client/Modal/useModal'
import {cfImage, getAuth} from '@/utils'
import {CLIENT_MODE} from '@/app/config'

export default function PopupCityForm({groupDetail, lang}: { groupDetail: GroupDetail, lang: Dictionary }) {
    const {uploadImage} = useUploadImage()
    const {toast} = useToast()
    const {showLoading, closeModal} = useModal()

    const [draft, setDraft] = useState(groupDetail)
    const [durationErr, setDurationErr] = useState('')

    const handleSave = async () => {
        if (draft.start_date && draft.end_date && draft.start_date >= draft.end_date) {
            setDurationErr(lang['The start time should be before the end time'])
            return
        }
        setDurationErr('')

        const loading = showLoading()
        try {
            const authToken = getAuth()
            await updateGroup({
                params: {
                    group: {
                        id: draft.id,
                        featured_image_url: draft.featured_image_url,
                        location: draft.location,
                        start_date: draft.start_date,
                        end_date: draft.end_date
                    },
                    authToken: authToken!
                },
                clientMode: CLIENT_MODE
            })
            toast({title: lang['Save successful'], variant: 'success'})
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
        <div className="page-width-md min-h-[calc(100svh-48px)] px-3 pb-12! pt-0">
            <div className="my-6 font-semibold text-center text-xl">
                {lang['Pop-up Cities']}
            </div>
            <div className="mb-4">
                {lang['Set a city and date range to run this group as a popup city — it will then be eligible to appear in Popup City discovery. Leave the date range blank to keep it a regular community.']}
            </div>

            <div className="my-4">
                <div className="my-3">
                    <div className="font-semibold mb-1">{lang['Featured Image']}</div>
                    <div onClick={() => {
                        uploadImage().then(url => {
                            setDraft({...draft, featured_image_url: url})
                        })
                    }}
                         className="cursor-pointer bg-secondary rounded-lg h-[170px] flex-col flex justify-center items-center">
                        {draft.featured_image_url
                            ? <img className="max-h-[150px]"
                                   src={cfImage(draft.featured_image_url, {width: 800, format: 'auto'})} alt=""/>
                            : <img className="w-[100px] h-[100px] rounded-full"
                                   src='/images/upload_default.png' alt=""/>
                        }
                    </div>
                </div>

                <div className="my-3">
                    <div className="font-semibold mb-1">{lang['City Name']}</div>
                    <Input placeholder={lang['City Name']}
                           className="w-full"
                           value={draft.location || ''}
                           onChange={e => setDraft({...draft, location: e.target.value})}/>
                </div>

                <div className="my-3">
                    <div className="font-semibold mb-1">{lang['Duration']}</div>
                    <div className="flex-row-item-center">
                        <DatePicker
                            initDate={draft.start_date || Dayjs().format('YYYY/MM/DD')}
                            className="flex-1"
                            onChange={(date) => {
                                setDraft({...draft, start_date: date})
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
                                setDraft({...draft, end_date: date})
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
