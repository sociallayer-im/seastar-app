'use client'

import {Dictionary} from '@/lang'
import {useState} from 'react'
import {Input} from "@/components/shadcn/Input"
import {Button} from "@/components/shadcn/Button"
import {checkDomainInput, cfImage, getAuth, verifyUsername} from '@/utils'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import useModal from '@/components/client/Modal/useModal'
import {createGroup, createPopupCity, getGroupDetailByHandle, GroupDetail, updateGroup} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import TimezonePicker from '@/components/client/TimezonePicker'
import DatePicker from '@/components/client/DatePicker'
import Dayjs from '@/libs/dayjs'
import useUploadImage from '@/hooks/useUploadImage'

export default function RegisterForm(props: { lang: Dictionary }) {
    const {showConfirmDialog} = useConfirmDialog()
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()
    const {uploadImage} = useUploadImage()

    const [step, setStep] = useState(0)
    const [error, setError] = useState('')
    const [createError, setCreateError] = useState('')
    const [handle, setHandle] = useState('')
    const [groupDetail, setGroupDetail] = useState<GroupDetail | null>(null)

    const [nickname, setNickname] = useState('')
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [location, setLocation] = useState('')
    const [website, setWebsite] = useState('')
    const [startDate, setStartDate] = useState<string | null>(null)
    const [endDate, setEndDate] = useState<string | null>(null)
    const [detailError, setDetailError] = useState('')

    const handleRegister = async () => {
        if (!handle || error) return
        setCreateError('')

        showConfirmDialog({
            lang: props.lang,
            title: props.lang['Create a Group'],
            content: `${props.lang['Do you want to create a group with this name ?']}
                        <div style="text-align: center;margin-top: 12px"><b>${handle}</b></div>`,
            type: 'info',
            onConfig: async () => {
                const loading = showLoading()
                try {
                    const authToken = getAuth()
                    const group = await createGroup({
                        params: {handle, authToken: authToken!},
                        clientMode: CLIENT_MODE
                    })
                    const detail = await getGroupDetailByHandle({
                        params: {groupHandle: group.handle},
                        clientMode: CLIENT_MODE
                    })
                    setGroupDetail(detail!)
                    setNickname(detail?.nickname || '')
                    setStep(1)
                } catch (e: unknown) {
                    console.error(e)
                    setCreateError(e instanceof Error ? e.message : 'Error')
                } finally {
                    closeModal(loading)
                }
            },
        })
    }

    const handleChange = (value: string) => {
        if (checkDomainInput(value)) {
            const v = value.toLowerCase()
            setHandle(v)
            setError(verifyUsername(v, props.lang) || '')
        }
    }

    const handleSkip = () => {
        window.location.href = `/group/${handle}`
    }

    const handleCreatePopupCity = async () => {
        if (!imageUrl) {
            setDetailError(props.lang['Please upload a cover image'])
            return
        }
        if (!location.trim()) {
            setDetailError(props.lang['Please input the city name'])
            return
        }
        if (!startDate || !endDate) {
            setDetailError(props.lang['Please input the duration'])
            return
        }
        if (startDate >= endDate) {
            setDetailError(props.lang['The start time should be before the end time'])
            return
        }
        if (!groupDetail?.timezone) {
            setDetailError(props.lang['Please select the timezone'])
            return
        }
        setDetailError('')

        const loading = showLoading()
        try {
            const authToken = getAuth()
            await updateGroup({
                params: {
                    group: {...groupDetail!, nickname: nickname || groupDetail!.nickname},
                    authToken: authToken!
                },
                clientMode: CLIENT_MODE
            })
            await createPopupCity({
                params: {
                    popupCityDraft: {
                        image_url: imageUrl,
                        location: location.trim(),
                        website: website.trim() || null,
                        start_date: startDate,
                        end_date: endDate,
                        group_id: groupDetail!.id
                    },
                    authToken: authToken!
                },
                clientMode: CLIENT_MODE
            })
            toast({title: props.lang['You have create a Popup-City'], variant: 'success'})
            setTimeout(() => {
                window.location.href = `/group/${handle}`
            }, 1500)
        } catch (e: unknown) {
            console.error(e)
            setDetailError(e instanceof Error ? e.message : 'Error')
        } finally {
            closeModal(loading)
        }
    }

    if (step === 1) {
        return <div className="w-full max-w-[500px] mx-auto p-4">
            <div className="font-semibold text-2xl">{props.lang['More Details']}</div>
            <div className="mt-1 text-secondary-foreground">
                {props.lang['Set the detailed information for your Popup-City']}
            </div>
            <div className="my-4">
                <div className="my-3">
                    <div className="font-semibold">{props.lang['Popup-City Name']}</div>
                    <Input
                        className="w-full"
                        value={nickname}
                        placeholder={props.lang['Popup-City Name']}
                        onChange={e => setNickname(e.target.value)}
                    />
                </div>

                <div className="my-3">
                    <div className="font-semibold">{props.lang['Cover']}</div>
                    <div onClick={() => {
                        uploadImage().then(url => setImageUrl(url))
                    }}
                         className="cursor-pointer bg-secondary rounded-lg h-[120px] flex-col flex justify-center items-center">
                        {imageUrl
                            ? <img className="max-h-[100px]" src={cfImage(imageUrl, {width: 400, format: 'auto'})} alt=""/>
                            : <img className="w-[100px] h-[100px] rounded-full" src='/images/upload_default.png' alt=""/>
                        }
                    </div>
                </div>

                <div className="my-3">
                    <div className="font-semibold">{props.lang['City Name']}</div>
                    <Input placeholder={props.lang['City Name']}
                           inputSize={'md'}
                           className="w-full"
                           value={location}
                           onChange={e => setLocation(e.target.value)}/>
                </div>

                <div className="my-3">
                    <div className="font-semibold">{props.lang['Website (optional)']}</div>
                    <Input placeholder="https://..."
                           inputSize={'md'}
                           className="w-full"
                           value={website}
                           onChange={e => setWebsite(e.target.value)}/>
                </div>

                <div className="my-3">
                    <div className="font-semibold">{props.lang['Timezone']}</div>
                    <TimezonePicker
                        className="w-full"
                        value={groupDetail?.timezone || 'UTC'}
                        onChange={(tz) => setGroupDetail({...groupDetail!, timezone: tz})}>
                        <Input
                            readOnly
                            placeholder={props.lang['Timezone']}
                            endAdornment={<i className="uil-angle-down text-lg"/>}
                            value={groupDetail?.timezone || ''}
                            className="w-full"
                            inputSize="md"/>
                    </TimezonePicker>
                </div>

                <div className="my-3">
                    <div className="font-semibold">{props.lang['Duration']}</div>
                    <div className="flex-row-item-center">
                        <DatePicker
                            initDate={startDate || Dayjs().format('YYYY/MM/DD')}
                            className="flex-1"
                            onChange={setStartDate}>
                            <Input placeholder={'YYYY/MM/DD'}
                                   inputSize={'md'}
                                   className="w-full"
                                   startAdornment={<i className="uil-calendar-alt"/>}
                                   value={startDate || ''}
                                   readOnly/>
                        </DatePicker>
                        <div className="mx-3">To</div>
                        <DatePicker
                            initDate={endDate || Dayjs().format('YYYY/MM/DD')}
                            className="flex-1"
                            onChange={setEndDate}>
                            <Input placeholder={'YYYY/MM/DD'}
                                   inputSize={'md'}
                                   className="w-full"
                                   startAdornment={<i className="uil-calendar-alt"/>}
                                   value={endDate || ''}
                                   readOnly/>
                        </DatePicker>
                    </div>
                </div>

                <div className="flex-row-item-center mt-4">
                    <Button onClick={handleSkip} variant={'secondary'} className="w-full mr-3">
                        {props.lang['Skip']}
                    </Button>
                    <Button onClick={handleCreatePopupCity} variant={'primary'} className="w-full">
                        {props.lang['Create Popup-City']}
                    </Button>
                </div>
                {!!detailError && <div className="text-red-400 text-sm mt-2">{detailError}</div>}
            </div>
        </div>
    }

    return <>
        <Input
            className="w-full"
            autoFocus
            maxLength={100}
            autoComplete={'off'}
            value={handle}
            placeholder={props.lang['Your username']}
            onChange={(e) => {
                handleChange(e.target.value)
            }}
        />
        <Button onClick={handleRegister}
                disabled={!!error || !handle}
                variant={"primary"}
                className="my-4 w-full">
            {props.lang['Confirm']}
        </Button>
        {!!error && <div className="text-red-400 text-sm h-10">{error}</div>}
        {!!createError && <div className="text-red-400 text-sm h-10">{createError}</div>}
    </>
}
