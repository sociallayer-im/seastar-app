'use client'

import {VenueDetail, VenueRole, VenueTimeslot, Weekday} from '@sola/sdk'
import {Dictionary} from '@/lang'
import {Input} from '@/components/shadcn/Input'
import {Button, buttonVariants} from '@/components/shadcn/Button'
import {Switch} from '@/components/shadcn/Switch'
import {useEffect, useState} from 'react'
import {
    categorizeTimeslotByWeekDay,
    checkTimeSlotOverlapInWeekDay,
    inValidStartEndTime
} from '@/utils'
import DatePicker from '@/components/client/DatePicker'
import TimePicker from '@/components/client/TimePicker'
import DropdownMenu from '@/components/client/DropdownMenu'
import SearchVenueLocation from '@/components/client/SearchVenueLocation'
import GoogleMapProvider from '@/providers/GoogleMapProvider'
import Dayjs from '@/libs/dayjs'
import {scrollToErrMsg} from '@/components/client/Subscription/uilts'

const ROLE_OPTIONS: { value: VenueRole, label: string }[] = [
    {value: 'all', label: 'All'},
    {value: 'member', label: 'Member'},
    {value: 'manager', label: 'Manager'},
]

const getTargetRole = (role: string) => {
    return ROLE_OPTIONS.find(option => option.value === role)
}

export interface VenueFormProps {
    venueDetail: VenueDetail,
    lang: Dictionary,
    onConfirm?: (venue: VenueDetail) => void,
}

export default function VenueForm({lang, venueDetail, onConfirm}: VenueFormProps) {
    const [draft, setDraft] = useState(venueDetail)
    const [enableTimeslots, setEnableTimeslots] = useState(!!venueDetail.venue_timeslots?.length)
    const [timeslots, setTimeslots] = useState(categorizeTimeslotByWeekDay(venueDetail.venue_timeslots || []))

    const [titleError, setTitleError] = useState('')
    const [locationError, setLocationError] = useState('')

    useEffect(() => {
        console.log('draft', draft)
        console.log('timeslots', timeslots)
    }, [draft, timeslots])

    const toggleWeekdayTimeslotsDisable = (weekDay: Weekday) => {
        const newTimeslots = timeslots[weekDay].map(timeslot => {
            return {...timeslot, disabled: !timeslot.disabled}
        })
        setTimeslots({...timeslots, [weekDay]: newTimeslots})
    }

    const updateTimeslot = (weekDay: Weekday, index: number, newtTimeslot: VenueTimeslot) => {
        const newTimeslots = timeslots[weekDay].map((timeslot, i) => {
            if (i === index) {
                return newtTimeslot
            }
            return timeslot
        })

        console.log('updateTimeslot', index, timeslots[weekDay], newTimeslots)

        setTimeslots({...timeslots, [weekDay]: newTimeslots})
    }

    const addNewTimeslot = (weekDay: Weekday) => {
        const newTimeslots = [...timeslots[weekDay], {
            day_of_week: weekDay,
            disabled: false,
            start_at: '08:00',
            end_at: '20:00',
            role: 'all'
        }]
        setTimeslots({...timeslots, [weekDay]: newTimeslots})
    }

    const removeTimeslot = (weekDay: Weekday, index: number) => {
        const newTimeslots = timeslots[weekDay].filter((_, i) => i !== index)
        setTimeslots({...timeslots, [weekDay]: newTimeslots})
    }

    const cleanStarDate = () => {
        setDraft({...draft, start_date: null})
    }

    const cleanEndDate = () => {
        setDraft({...draft, end_date: null})
    }

    const handleConfirm = () => {
        const errMsg = document.querySelector('.err-msg')
        if (errMsg) {
            scrollToErrMsg()
            return
        }

        if (!draft.title) {
            setTitleError('Please input the name of venue')
            scrollToErrMsg()
            return
        } else {
            setTitleError('')
        }

        if (!draft.formatted_address) {
            setLocationError('Please input location')
            scrollToErrMsg()
            return
        } else {
            setLocationError('')
        }

        const plantTimeslots = enableTimeslots
            ? Object.values(timeslots).reduce((acc, timeslots) => {
                return acc.concat(timeslots)
            }, [] as VenueTimeslot[])
            : []

        !!onConfirm && onConfirm({...draft, venue_timeslots: plantTimeslots})
    }

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width-md min-h-[calc(100svh-48px)] px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Edit Venue']}</div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Name of venue']}</div>
                <Input className="w-full" value={draft.title}
                       onChange={e => {
                           setDraft({...draft, title: e.target.value})
                       }}/>
                {!!titleError && <div className="err-msg text-red-400 mt-3">{titleError}</div>}
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Default location']}</div>
                <GoogleMapProvider>
                    <SearchVenueLocation
                        state={{draft, setDraft}}
                        lang={lang}
                    />
                </GoogleMapProvider>
                {!!locationError && <div className="err-msg text-red-400 mt-3">{locationError}</div>}
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Description (Optional)']}</div>
                <Input className="w-full" value={draft.about || ''}
                       onChange={e => setDraft({...draft, about: e.target.value})}/>
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Link (Optional)']}</div>
                <Input className="w-full" value={draft.link || ''}
                       onChange={(e) => setDraft({...draft, link: e.target.value})}/>
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Available Date (Optional)']}</div>
                <div className="flex sm:flex-row flex-col flex-wrap ">
                    <div className="flex-row-item-center mb-3 flex-1">
                        <div className="w-16 text-center">From</div>
                        <DatePicker initDate={draft.start_date || Dayjs().format('YYYY/MM/DD')}
                                    className={'w-full'}
                                    format={'YYYY-MM-DD'}
                                    onChange={date => {
                                        setDraft({...draft, start_date: date})
                                    }}>
                            <Input className="w-full flex-1" readOnly
                                   value={draft.start_date || ''}
                                   endAdornment={!!draft.start_date &&
                                       <i onClick={(e) => {
                                           cleanStarDate();
                                           e.stopPropagation()
                                       }}
                                          className="uil-times-circle cursor-pointer"/>}
                                   placeholder={'YYYY/MM/DD'}/>
                        </DatePicker>
                    </div>
                    <div className="flex-row-item-center mb-3 flex-1">
                        <div className="w-16 text-center">To</div>
                        <DatePicker initDate={draft.end_date || Dayjs().add(1, 'month').format('YYYY/MM/DD')}
                                    className={'w-full'}
                                    format={'YYYY-MM-DD'}
                                    onChange={date => {
                                        setDraft({...draft, end_date: date})
                                    }}>
                            <Input className="w-full flex-1" readOnly
                                   value={draft.end_date || ''}
                                   endAdornment={!!draft.end_date &&
                                       <i onClick={(e) => {
                                           cleanEndDate();
                                           e.stopPropagation()
                                       }}
                                          className="uil-times-circle cursor-pointer"/>}
                                   placeholder={'YYYY/MM/DD'}/>
                        </DatePicker>
                    </div>
                </div>
                {inValidStartEndTime(draft.start_date, draft.end_date) &&
                    <div className="err-msg text-sm text-red-400">
                        {lang['Start time must be before end time']}
                    </div>
                }
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Visibility']}</div>
                <Button onClick={() => setDraft({...draft, visibility: 'all'})}
                        variant={'secondary'} className="w-full mb-3">
                    <div className="flex-row-item-center justify-between w-full">
                        <div className="font-normal">Everyone</div>
                        {(draft.visibility === 'all' || !draft.visibility)
                            ? <i className="uil-check-circle text-green-400 text-2xl"/>
                            : <i className="uil-circle text-gray-300 text-2xl"/>
                        }
                    </div>
                </Button>
                <Button onClick={() => setDraft({...draft, visibility: 'manager'})}
                        variant={'secondary'} className='w-full mb-3'>
                    <div className="flex-row-item-center justify-between w-full">
                        <div className="font-normal">Manager</div>
                        {(draft.visibility === 'manager' || !draft.visibility)
                            ? <i className="uil-check-circle text-green-400 text-2xl"/>
                            : <i className="uil-circle text-gray-300 text-2xl"/>
                        }
                    </div>
                </Button>
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Venue Capacity (Optional)']}</div>
                <Input className="w-full"
                       placeholder={'Unlimited'}
                       onChange={e => {
                           setDraft({...draft, capacity: parseInt(e.target.value)})
                       }}
                       value={draft.capacity || ''}
                       type={'number'}
                       onWheel={(e) => e.currentTarget.blur()}/>
            </div>

            <div className="my-8 flex-row-item-center justify-between">
                <div className="font-semibold mb-1">{lang['Require Approval (Optional)']}</div>
                <Switch onClick={() => {
                    setDraft({...draft, require_approval: !draft.require_approval})
                }}
                        checked={draft.require_approval}/>
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-2">{lang['Opening Hours']}</div>
                <div
                    className="flex-row-item-center justify-between w-full border border-gray-200 rounded-lg  px-3 py-2 mb-2">
                    <div>
                        <div className="text-sm font-semibold mb-1">7/24 Hours</div>
                        <div className="text-xs text-gray-500">Opening all the time</div>
                    </div>
                    {!enableTimeslots
                        ? <i className="uil-check-circle text-green-500 text-2xl"/>
                        : <i className="uil-circle text-gray-300 text-2xl cursor-pointer"
                             onClick={e => setEnableTimeslots(false)}/>
                    }
                </div>

                <div
                    className="w-full border border-gray-200 rounded-lg px-3 py-3">
                    <div className="flex-row-item-center justify-between w-full">
                        <div>
                            <div className="text-sm font-semibold mb-1">Timeslots</div>
                            <div className="text-xs text-gray-500">Opening within specific timeslots</div>
                        </div>
                        {enableTimeslots
                            ? <i className="uil-check-circle text-green-500 text-2xl"/>
                            : <i className="uil-circle text-gray-300 text-2xl cursor-pointer"
                                 onClick={e => setEnableTimeslots(true)}/>
                        }
                    </div>

                    {enableTimeslots &&
                        (Object.keys(timeslots) as Weekday[]).map((weekDay, index) => {
                            return <div key={index} className="mt-3 border rounded-lg p-3">
                                <div className="flex-row-item-center justify-between  text-sm">
                                    <div className="font-semibold capitalize">{weekDay}</div>
                                    <div className="flex-row-item-center">
                                        <div className="mr-2">Closed</div>
                                        <Switch
                                            onClick={() => toggleWeekdayTimeslotsDisable(weekDay)}
                                            checked={timeslots[weekDay][0]!.disabled}/>
                                    </div>
                                </div>
                                {
                                    timeslots[weekDay].map((timeslot, i) => {
                                        const style = timeslot.disabled
                                            ? {opacity: '0.4', pointerEvents: 'none' as any}
                                            : undefined
                                        return <div key={i + weekDay}>
                                            <div style={style}
                                                 className="flex flex-row items-center pb-3 px-2 mt-3 rounded bg-gray-50">
                                                <div
                                                    className="flex sm:flex-row flex-col flex-wrap sm:items-center flex-1 mr-2">
                                                    <div className="flex-row-item-center mt-3 flex-1 text-sm">
                                                        <div className="w-16 text-center">From</div>
                                                        <TimePicker
                                                            onChange={(time) => {
                                                                const newtTimeslot = {...timeslot, start_at: time}
                                                                updateTimeslot(weekDay, i, newtTimeslot)
                                                            }}
                                                            initTime={timeslot.start_at || ''}/>
                                                    </div>
                                                    <div className="flex-row-item-center mt-3 flex-1 text-sm">
                                                        <div className="w-16 text-center">To</div>
                                                        <TimePicker
                                                            onChange={(time) => {
                                                                const newtTimeslot = {...timeslot, end_at: time}
                                                                updateTimeslot(weekDay, i, newtTimeslot)
                                                            }}
                                                            initTime={timeslot.end_at || ''}/>
                                                    </div>
                                                    <div className="flex-row-item-center mt-3 flex-1 text-sm">
                                                        <div className="min-w-16 text-center">For</div>
                                                        <DropdownMenu
                                                            onSelect={option => {
                                                                const newtTimeslot = {
                                                                    ...timeslot,
                                                                    role: option[0].value
                                                                }
                                                                updateTimeslot(weekDay, i, newtTimeslot)
                                                            }}
                                                            value={[getTargetRole(timeslot.role)!]}
                                                            options={ROLE_OPTIONS}
                                                            valueKey={'value'}
                                                            renderOption={option => <div
                                                                className="capitalize">{option.value}</div>}
                                                        >
                                                            <Input className="w-full flex-1 !capitalize"
                                                                   value={getTargetRole(timeslot.role)!.label}
                                                                   readOnly
                                                                   endAdornment={<i
                                                                       className="uil-angle-down text-lg"/>}
                                                                   placeholder={'role'}/>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                                {i === timeslots[weekDay].length - 1 &&
                                                    <i className="uil-plus-circle text-3xl text-green-500 cursor-pointer mt-3 mr-1"
                                                       onClick={e => addNewTimeslot(weekDay)}/>
                                                }
                                                {timeslots[weekDay].length !== 1 &&
                                                    <i onClick={() => removeTimeslot(weekDay, i)}
                                                       className="uil-minus-circle text-gray-500 text-3xl mt-3 cursor-pointer"/>
                                                }
                                            </div>

                                            {inValidStartEndTime(timeslots[weekDay][i].start_at, timeslots[weekDay][i].end_at) &&
                                                <div className="err-msg text-red-400 text-sm mt-3">
                                                    {lang['Start time must be before end time']}
                                                </div>
                                            }
                                        </div>
                                    })
                                }

                                {checkTimeSlotOverlapInWeekDay(timeslots[weekDay])
                                    && <div className="err-msg text-red-400 text-sm mt-3">Timeslot overlap</div>
                                }
                            </div>
                        })
                    }
                </div>
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Overrides']}</div>
                <div className="text-sm text-gray-500 mb-2">
                    {lang['Add dates when your availability changes from your daily hours.']}
                </div>
                <div className="grid grid-cols-1 gap-3">
                    {
                        new Array(3).fill('').map((_, index) => {
                            return <div key={index} className="flex-row-item-center w-full">
                                <div
                                    className={`${buttonVariants({variant: 'secondary'})} flex-1 mr-3 justify-between`}>
                                    <div className="font-normal">venue {index}</div>
                                    <i className="uil-edit-alt"/>
                                </div>
                                <i className="uil-minus-circle text-3xl text-gray-500 cursor-pointer"/>
                            </div>
                        })
                    }
                </div>
                <Button variant={'secondary'} className='mt-3'>
                    <i className="uil-plus-circle text-xl"/>
                    Add new Override
                </Button>
            </div>

            <div className="mt-6 flex-row-item-center justify-center">
                <Button variant={'secondary'} className="mr-3 flex-1" onClick={() => {
                    window.history.go(-1)
                }}>{lang['Back']}</Button>
                <Button variant={'primary'}
                        onClick={handleConfirm}
                        className="mr-3 flex-1">{lang['Save']}</Button>
            </div>
        </div>
    </div>
}