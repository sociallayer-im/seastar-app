import useModal from "@/components/client/Modal/useModal"
import DropdownMenu from "@/components/client/DropdownMenu"
import {useMemo, useState} from "react"
import {Input} from "@/components/shadcn/Input"
import {Button} from "@/components/shadcn/Button"
import dayjs from "@/libs/dayjs"
import {Dictionary} from "@/lang"
import {EventDraftType} from '@sola/sdk'

export interface RepeatFormType {
    interval: string | null
    event_count: number | null
}

export interface RepeatFormProps {
    event: EventDraftType
    repeatForm: RepeatFormType
    onChange: (value: RepeatFormType) => void
    lang: Dictionary
}

const getRepeatInterval = (lang: Dictionary) => {
    return [
        {
            value: '',
            label: lang['Does not Repeat']
        },
        {
            value: 'day',
            label: lang['Every Day']
        },
        {
            value: 'week',
            label:  lang['Every Week']
        },
        {
            value: 'month',
            label: lang['Every Month']
        }
    ]
}


export default function RepeatForm(props: RepeatFormProps) {
    const {openModal, closeModal} = useModal()

    const showSetting = () => {
        openModal({
            content: (close) => <DialogRepeatSetting
                lang={props.lang}
                start_time={props.event.start_time}
                timezone={props.event.timezone || 'UTC'}
                form={props.repeatForm}
                close={close!}
                onConfirm={(form) => {
                    !!props.onChange && props.onChange(form)
                    closeModal()
                }}/>
        })
    }

    const repeatText = useMemo(() => {
        if (props.repeatForm.interval) {
            const RepeatInterval = getRepeatInterval(props.lang)
            switch (props.repeatForm.interval) {
            case RepeatInterval[1].value:
                return `${props.lang['Every Day']}, ${props.lang['repeat']} ${props.repeatForm.event_count} ${props.lang['times']}`
            case RepeatInterval[2].value:
                return `${props.lang['Every Week']}, ${props.lang['repeat']} ${props.repeatForm.event_count} ${props.lang['times']}`
            case RepeatInterval[3].value:
                return `${props.lang['Every Month']}, ${props.lang['repeat']} ${props.repeatForm.event_count} ${props.lang['times']}`
            default:
                return ''
            }
        }
    }, [props.repeatForm.interval, props.lang, props.repeatForm.event_count])
    
    return <div
        onClick={showSetting}
        className={`${repeatText? 'bg-secondary ' : ''} cursor-pointer hover:bg-secondary px-2 rounded text-xs flex-row-item-center !inline-flex font-semibold active:brightness-90`}>
        <i className="uil-repeat text-base mr-0.5"/>
        {repeatText || props.lang['Does not Repeat']}
    </div>
}

export interface DialogRepeatSettingProps {
    lang: Dictionary
    form: RepeatFormType
    start_time: string,
    onConfirm: (form: RepeatFormType) => void
    timezone: string
    close: () => void
}

function DialogRepeatSetting({form, onConfirm, timezone, start_time, close, lang}: DialogRepeatSettingProps) {
    const [repeatForm, setRepeatForm] = useState(form)
    const [error, setError] = useState('')

    const preview = useMemo(() => {
        if (!repeatForm.interval
            || !repeatForm.event_count
            && (!!repeatForm.event_count && repeatForm.event_count < 1)) {
            return  []
        }

        const start = dayjs.tz(new Date(start_time).getTime(), timezone)
        return new Array(repeatForm.event_count).fill(0).map((_, i) => {
            return start.add(i, repeatForm.interval as any).format('YYYY-MM-DD HH:mm')
        })
    }, [repeatForm.event_count, repeatForm.interval, start_time])
    
    const handleConfirm = () => {
        if (!!repeatForm.interval) {
            if (!repeatForm.event_count) {
                setError('Please enter a valid value')
                return
            } else if (repeatForm.event_count < 1) {
                setError('The minimum number of repetitions is 1')
                return
            } else if (repeatForm.event_count > 100) {
                setError('The maximum number of repetitions is 100')
                return
            }
        }

        onConfirm(repeatForm)
    }
    
    const RepeatInterval = getRepeatInterval(lang)

    return <div className="shadow rounded-lg bg-white p-4 w-80">
        <div className="max-h-[60svh] overflow-auto">
            <div className="font-semibold mb-3">{lang['Repeat Setting']}</div>
            <div>{lang['Repeat period']}</div>
            <div className="mb-3">
                <DropdownMenu
                    value={RepeatInterval.filter((r => r.value === repeatForm.interval))}
                    options={RepeatInterval}
                    valueKey={'value'}
                    renderOption={(opt) => <div>{opt.label}</div>}
                    onSelect={(opt) => {
                        setRepeatForm({
                            ...repeatForm,
                            interval: opt[0].value || null,
                            event_count: 1
                        })
                    }}>
                    <Input
                        type="text"
                        readOnly
                        value={RepeatInterval.find((r => r.value === repeatForm.interval))?.label || lang['Does not Repeat']}
                        className="cursor-pointer w-full"
                        endAdornment={<i className="uil-angle-down text-lg"/>}
                    />
                </DropdownMenu>
            </div>
            <div>{lang['Repeat Times']}</div>
            <Input value={repeatForm.event_count || ''}
                disabled={!repeatForm.interval}
                onChange={e => {
                    setRepeatForm({...repeatForm, event_count:  Number(e.target.value)})
                }}
                type="number"
                className={'w-full mb-3'}
                endAdornment={lang['Times']}
                onWheel={(e) => {
                    e.currentTarget.blur()
                }}/>
            <div className="text-red-400 mb-2 text-xs">{error}</div>


            {!!preview.length &&
                <div className="mb-3">
                    <div>{lang['Event Times Preview']}</div>
                    {preview.map((t) => <div key={t}
                        className="px-2 py-1 rounded mb-1 bg-secondary"
                    >{t}</div>)}
                </div>
            }

            <div className="flex-row-item-center">
                <Button variant={'secondary'} 
                    onClick={close}
                    className="flex-1">{lang['Cancel']}</Button>
                <Button variant={'primary'} 
                    onClick={handleConfirm}
                    className="flex-1 ml-2">{lang['Confirm']}</Button>
            </div>
        </div>
    </div>
}