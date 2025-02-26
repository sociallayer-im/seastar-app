'use client'
import {VenueOverride, VenueRole} from '@sola/sdk'
import {useEffect, useState} from 'react'
import useModal from '@/components/client/Modal/useModal'
import {Dictionary} from '@/lang'
import DatePicker from '@/components/client/DatePicker'
import Dayjs from '@/libs/dayjs'
import {Input} from '@/components/shadcn/Input'
import TimePicker from '@/components/client/TimePicker'
import {Button} from '@/components/shadcn/Button'
import {inValidStartEndTime} from '@/utils'
import {Switch} from '@/components/shadcn/Switch'
import DropdownMenu from '@/components/client/DropdownMenu'
import {scrollToErrMsg} from '@/components/client/Subscription/uilts'

const ROLE_OPTIONS: { value: VenueRole, label: string }[] = [
    {value: 'all', label: 'All'},
    {value: 'member', label: 'Member'},
    {value: 'manager', label: 'Manager'},
]

const getTargetRole = (role?: string) => {
    if (!role) return ROLE_OPTIONS[0]
    return ROLE_OPTIONS.find(option => option.value === role)
}

export interface DialogEditOverrideProps {
    override: VenueOverride
    lang: Dictionary
    onCancel?: () => void
    onConfig?: (override: VenueOverride) => void
}

export function DialogEditOverride({override, lang, onConfig, onCancel}: DialogEditOverrideProps) {
    const [draft, setDraft] = useState<VenueOverride>(override)

    const handleConfirm = () => {
        const errMsg = document.querySelector('.err-msg')
        if (errMsg) {
            scrollToErrMsg()
            return
        }

        onConfig?.(draft)
    }

    return <div className="w-[100vw] h-[100svh] p-13 bg-background overflow-auto">
        <div className="page-width-md !pb-12 !pt-3">
            <div className="font-semibold text-lg text-center mb-6">
                {!!draft.id ? lang['Edit Override'] : lang['Create Override']}
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Override Date']}</div>
                <DatePicker initDate={draft.day || Dayjs().format('YYYY/MM/DD')} className="w-full"
                            onChange={(date) => {
                                setDraft({...draft, day: date})
                            }}>
                    <Input startAdornment={<i className="uil-calendar-alt text-lg"/>}
                           className="w-full" value={draft.day}
                           readOnly={true}
                    />
                </DatePicker>
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Override Time']}</div>
                <div className="flex flex-row items-center pb-3 px-2 ">
                    <TimePicker
                        initTime={draft.start_at || '00:00'}
                        onChange={(time) => {
                            setDraft({...draft, start_at: time})
                        }}
                    />
                    <span className="mx-2">To</span>
                    <TimePicker initTime={draft.end_at || '23:59'}
                                onChange={(time) => {
                                    setDraft({...draft, end_at: time})
                                }}
                    />
                    <div className="mx-2 text-center">For</div>
                    <DropdownMenu
                        onSelect={option => {
                            setDraft({...draft, role: option[0].value})
                        }}
                        value={[getTargetRole(draft.role)!]}
                        options={ROLE_OPTIONS}
                        valueKey={'value'}
                        renderOption={option => <div
                            className="capitalize">{option.value}</div>}
                    >
                        <Input className="w-full flex-1 !capitalize"
                               value={getTargetRole(draft.role)!.label}
                               readOnly
                               endAdornment={<i
                                   className="uil-angle-down text-lg"/>}
                               placeholder={'role'}/>
                    </DropdownMenu>
                </div>
                {inValidStartEndTime(draft.start_at, draft.end_at)
                    && <div className="err-msg text-red-400">{lang['Start time must be before end time']}</div>
                }
            </div>

            <div className="my-8 flex-row-item-center justify-between">
                <div className="font-semibold mb-1">{lang['Mark Unavailable']}</div>
                <Switch onClick={() => {
                    setDraft({...draft, disabled: !draft.disabled})
                }}
                        checked={draft.disabled}/>
            </div>

            <div className="mt-6 flex-row-item-center justify-center">
                <Button variant={'secondary'} className="mr-3 flex-1" onClick={onCancel}>{lang['Back']}</Button>
                <Button variant={'primary'}
                onClick={handleConfirm}
                className="mr-3 flex-1">{lang['Confirm']}</Button>
            </div>
        </div>
    </div>
}

export default function useEditOverride() {
    const {openModal} = useModal()

    function editOverride(override: VenueOverride, lang: Dictionary): Promise<VenueOverride | null> {
        return new Promise((resolve) => {
            openModal({
                content: (close) => <DialogEditOverride
                    override={override}
                    lang={lang}
                    onCancel={() => {
                        resolve(null)
                        close!()
                    }}
                    onConfig={(override) => {
                        close!()
                        resolve(override)
                    }}/>
            })
        })
    }

    return {editOverride}
}