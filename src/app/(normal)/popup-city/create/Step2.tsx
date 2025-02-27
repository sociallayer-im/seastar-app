'use client'

import {CreatePopupCityStepProps} from '@/app/(normal)/popup-city/create/Step0'
import {Input} from '@/components/shadcn/Input'
import TimezonePicker from '@/components/client/TimezonePicker'
import DatePicker from '@/components/client/DatePicker'
import Dayjs from '@/libs/dayjs'
import {Button} from '@/components/shadcn/Button'
import useUploadImage from '@/hooks/useUploadImage'
import {useState} from 'react'

export default function Step2({lang, groupDetailState, popupCityState, onNext, onBack}:CreatePopupCityStepProps) {
    const {uploadImage} = useUploadImage()
    const [step2Err, setStep2Err] = useState('')

    const handleToStep3 = () => {
        if (!popupCityState[0].image_url) {
            setStep2Err(lang['Please upload a cover image'])
            return
        }
        if (!popupCityState[0].location) {
            setStep2Err(lang['Please input the city name'])
            return
        }
        if (!popupCityState[0].start_date || !popupCityState[0].end_date) {
            setStep2Err(lang['Please input the duration'])
            return
        }
        if (popupCityState[0].start_date >= popupCityState[0].end_date) {
            setStep2Err(lang['The start time should be before the end time'])
            return
        }
        if (!groupDetailState![0].timezone) {
            setStep2Err(lang['Please select the timezone'])
            return
        }
        setStep2Err('')
        onNext()
    }

    return <div className="w-full max-w-[500px] mx-auto p-4">
        <div className="font-semibold text-2xl">{lang['More Details']}</div>
        <div className="mt-1 text-secondary-foreground">
            {lang['Set the detailed information for your Popup-City']}
        </div>
        <div className="my-4">
            <div className="my-3">
                <div className="font-semibold">{lang['Cover']}</div>
                <div onClick={() => {
                    uploadImage().then(url => {
                        popupCityState[1]({
                            ...popupCityState[0],
                            image_url: url
                        })
                    })
                }}
                     className="cursor-pointer bg-secondary rounded-lg h-[120px] flex-col flex justify-center items-center">
                    {popupCityState[0].image_url
                        ? <img className="max-h-[100px]"
                               src={popupCityState[0].image_url} alt=""/>
                        : <img className="w-[100px] h-[100px] rounded-full"
                               src='/images/upload_default.png' alt=""/>
                    }
                </div>
            </div>

            <div className="my-3">
                <div className="font-semibold">{lang['City Name']}</div>
                <Input placeholder={lang['City Name']}
                       inputSize={'md'}
                       className="w-full"
                       value={popupCityState[0].location || ''}
                       onChange={e => popupCityState[1]({...popupCityState[0], location: e.target.value})}/>
            </div>

            <div className="my-3">
                <div className="font-semibold">{lang['Website (optional)']}</div>
                <Input placeholder="https://..."
                       inputSize={'md'}
                       className="w-full"
                       value={popupCityState[0].website || ''}
                       onChange={e => popupCityState[1]({...popupCityState[0], website: e.target.value})}/>
            </div>

            <div className="my-3">
                <div className="font-semibold">{lang['Timezone']}</div>
                <TimezonePicker
                    className="w-full"
                    value={groupDetailState![0].timezone || 'UTC'}
                    onChange={(timezone) => {
                        groupDetailState![1]({
                            ...groupDetailState![0]!,
                            timezone: timezone
                        })
                    }}>
                    <Input
                        readOnly
                        placeholder={lang['Timezone']}
                        endAdornment={<i className="uil-angle-down text-lg"/>}
                        value={groupDetailState![0].timezone || ''} className="w-full" inputSize="md" />
                </TimezonePicker>
            </div>

            <div className="my-3">
                <div className="font-semibold">{lang['Duration']}</div>
                <div className="flex-row-item-center">
                    <DatePicker
                        initDate={popupCityState[0].start_date || Dayjs().format('YYYY/MM/DD')}
                        className="flex-1"
                        onChange={(date) => {
                            popupCityState[1]({
                                ...popupCityState[0],
                                start_date: date
                            })
                        }}>
                        <Input placeholder={'YYYY/MM/DD'}
                               inputSize={'md'}
                               className="w-full"
                               startAdornment={<i className="uil-calendar-alt"/>}
                               value={popupCityState[0].start_date || ''}
                               readOnly/>
                    </DatePicker>
                    <div className="mx-3">To</div>
                    <DatePicker
                        initDate={popupCityState[0].end_date || Dayjs().format('YYYY/MM/DD')}
                        className="flex-1"
                        onChange={(date) => {
                            popupCityState[1]({
                                ...popupCityState[0],
                                end_date: date
                            })
                        }}>
                        <Input placeholder={'YYYY/MM/DD'}
                               inputSize={'md'}
                               className="w-full"
                               startAdornment={<i className="uil-calendar-alt"/>}
                               value={popupCityState[0].end_date || ''}
                               readOnly/>
                    </DatePicker>
                </div>
            </div>

            <div className="flex-row-item-center mt-4">
                <Button
                    onClick={() => onBack()}
                    variant={'secondary'}
                    className="w-full mr-3">
                    {lang['Back']}
                </Button>
                <Button
                    onClick={handleToStep3}
                    variant={'primary'}
                    className="w-full">
                    {lang['Create Popup-City']}
                </Button>
            </div>
            <div className="text-red-400 text-sm mt-2">{step2Err}</div>
        </div>
    </div>
}