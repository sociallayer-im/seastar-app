'use client'

import { Input } from '@/components/shadcn/Input'
import { Button, buttonVariants } from '@/components/shadcn/Button'
import { GroupDetail, Membership, Profile, TrackDetail, Track } from '@sola/sdk'
import { Dictionary } from '@/lang'
import { useEffect, useState } from 'react'
import useUploadImage from '@/hooks/useUploadImage'
import DatePicker from '@/components/client/DatePicker'
import Dayjs from '@/libs/dayjs'
import useModal from '@/components/client/Modal/useModal'
import Avatar from '@/components/Avatar'
import { displayProfileName } from '@/utils'
import { scrollToErrMsg } from '@/components/client/Subscription/uilts'
import DropdownMenu from '@/components/client/DropdownMenu'

export interface TrackFormProps {
    trackDetail: TrackDetail
    lang: Dictionary
    groupDetail: GroupDetail
    onConfirm?: (trackDetail: Track, managers: Profile[], members: Profile[]) => void
}

type TrackMemberItem = { profile: Profile, role: 'manager' | 'member' }

export default function TrackForm({ trackDetail, lang, groupDetail, onConfirm }: TrackFormProps) {
    const { uploadImage } = useUploadImage()
    const { openModal } = useModal()

    const [draft, setDraft] = useState(trackDetail)
    const [titleError, setTitleError] = useState('')
    const [timeError, setTimeError] = useState('')
    const [members, setMembers] = useState<TrackMemberItem[]>(trackDetail.track_roles?.map(r => ({ profile: r.profile, role: r.role as 'manager' | 'member' })) || [])

    useEffect(() => {
        console.log('draft', draft)
        console.log('members', members)
    }, [draft, members]);

    const handleSelectManager = () => {
        openModal({
            content: (close) =>
                <DialogSelectorMember
                    close={close!}
                    lang={lang}
                    memberships={groupDetail.memberships}
                    onChange={(profile) => {
                        if (!profile) return
                        if (members.find(m => m.profile.id === profile.id)) {
                            return
                        } else {
                            const newMembers = [...members, { profile, role: 'member' as 'manager' | 'member' }]
                            setMembers(newMembers)
                            !!close && close()
                        }
                    }}
                />
        })
    }

    const removeManager = (profile: Profile) => {
        setMembers(members.filter(m => m.profile.id !== profile.id))
    }

    const handleConfirm = () => {
        if (!draft.title) {
            setTitleError('Please enter the name')
            scrollToErrMsg()
            return
        } else {
            setTitleError('')
        }

        if (!!draft.start_date && !!draft.end_date && draft.start_date >= draft.end_date) {
            setTimeError('The start date must be earlier than the end date')
            scrollToErrMsg()
            return
        } else {
            setTimeError('')
        }

        const _managers = members.filter(m => m.role === 'manager').map(m => m.profile)
        const _members = members.filter(m => m.role === 'member').map(m => m.profile)

        onConfirm && onConfirm(draft, _managers, _members)
    }

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width-md min-h-[calc(100svh-48px)] px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{
                !!trackDetail.id
                    ? lang['Edit Program']
                    : lang['Create Program']
            }
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Name of program']}</div>
                <Input className="w-full" value={draft.title} onChange={(e) => {
                    setDraft({ ...draft, title: e.target.value })
                }} />
                {!!titleError && <div className="err-msg text-red-400 mt-2 text-xs">{titleError}</div>}
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Icon (optional)']}</div>
                <div className="mb-1 text-sm text-gray-500">{lang['Display on the schedule page']}</div>
                <div onClick={async () => setDraft({ ...draft, icon_url: await uploadImage() })}
                    className="cursor-pointer bg-secondary rounded-lg h-[170px] flex-col flex justify-center items-center mb-4">
                    {
                        draft.icon_url
                            ? <img
                                className="max-w-[100%] max-h-[100px]"
                                src={draft.icon_url} alt="" />
                            : <img className="w-[100px] h-[100px] rounded-full"
                                src={'/images/upload_default.png'} alt="" />
                    }
                </div>
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Description (Optional)']}</div>
                <Input className="w-full" value={draft.about || ''}
                    onChange={(e) => {
                        setDraft({ ...draft, about: e.target.value })
                    }} />
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Visibility']}</div>
                <div onClick={e => {
                    setDraft({ ...draft, kind: 'public' })
                }}
                    className={`flex-row-item-center justify-between border cursor-pointer p-2  rounded-lg mt-2 h-auto border-gray-200 w-full text-left hover:bg-gray-100`}>
                    <div>
                        <div className="text-sm font-semibold">Public</div>
                        <div className="text-gray-500 text-xs font-normal">
                            {lang['Everyone can view events in the program']}
                        </div>
                    </div>
                    {draft.kind == 'public'
                        ? <i className="flex-shrink-0 ml-2 uil-check-circle text-2xl text-green-500" />
                        : <i className="flex-shrink-0 ml-2 uil-circle text-2xl text-gray-500" />
                    }
                </div>
                <div onClick={e => {
                    setDraft({ ...draft, kind: 'private' })
                }}
                    className={`flex-row-item-center justify-between border cursor-pointer p-2  rounded-lg mt-2 h-auto border-gray-200 w-full text-left hover:bg-gray-100`}>
                    <div>
                        <div className="text-sm font-semibold">Private</div>
                        <div className="text-gray-500 text-xs font-normal">
                            {lang['Only program members or group managers can view events in the program.']}
                        </div>
                    </div>
                    {draft.kind == 'private'
                        ? <i className="flex-shrink-0 ml-2 uil-check-circle text-2xl text-green-500" />
                        : <i className="flex-shrink-0 ml-2 uil-circle text-2xl text-gray-500" />
                    }
                </div>
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Available Date (Optional)']}</div>
                <div className="flex sm:flex-row flex-col flex-wrap ">
                    <div className="flex-row-item-center mb-3 flex-1">
                        <div className="w-16 text-center">From</div>
                        <DatePicker
                            className="w-full"
                            initDate={draft.start_date || Dayjs().format('YYYY/MM/DD')}
                            onChange={(date) => {
                                setDraft({ ...draft, start_date: date })
                            }}>
                            <Input className="w-full flex-1" value={draft.start_date || ''} readOnly
                                placeholder={'YYYY/MM/DD'} />
                        </DatePicker>

                    </div>
                    <div className="flex-row-item-center mb-3 flex-1">
                        <div className="w-16 text-center">To</div>
                        <DatePicker
                            className="w-full"
                            initDate={draft.end_date || Dayjs().add(1, 'month').format('YYYY/MM/DD')}
                            onChange={(date) => {
                                setDraft({ ...draft, end_date: date })
                            }}>
                            <Input className="w-full flex-1" value={draft.end_date || ''} readOnly
                                placeholder={'YYYY/MM/DD'} />
                        </DatePicker>
                    </div>
                </div>
                {!!timeError && <div className="err-msg text-red-400 mt-2 text-xs">{timeError}</div>}
            </div>

            <div className="mb-4">
                <div className="font-semibold mb-1">{lang['Members']}</div>
                {
                    members.map((member, index) => {
                        return <div key={index} className="flex-row-item-center w-full mb-2">
                            <div
                                className={`${buttonVariants({ variant: 'secondary' })} flex-1 mr-3 flex !justify-start`}>
                                <Avatar profile={member.profile} size={24} />
                                <div className="font-normal">
                                    {displayProfileName(member.profile)}
                                </div>
                            </div>
                            <DropdownMenu
                                options={[{
                                    label: 'Manager',
                                    value: 'manager'
                                }, {
                                    label: 'Member',
                                    value: 'member'
                                }]}
                                onSelect={(opt) => {
                                    setMembers(members.map(m => m.profile.id === member.profile.id ? { ...m, role: opt[0].value } : m) as TrackMemberItem[])
                                }}
                                valueKey="value"
                                renderOption={(option, index) => {
                                    return <div key={index}>{option.label}</div>
                                }}
                            >
                                <Input
                                    className="w-full max-w-[130px]"
                                    readOnly
                                    value={member.role === 'manager' ? 'Manager' : 'Member'}
                                    endAdornment={<i className="uil-angle-down text-xl" />}
                                />
                            </DropdownMenu>

                            <i onClick={() => removeManager(member.profile)}
                                className="uil-minus-circle text-3xl text-gray-500 cursor-pointer ml-3" />
                        </div>
                    })
                }
                <Button variant={'secondary'} className='mt-3'
                    onClick={handleSelectManager}>
                    <i className="uil-plus-circle text-xl" />
                    Add new Members
                </Button>
            </div>

            <div className="mt-6 flex-row-item-center justify-center">
                <Button variant={'secondary'}
                    onClick={() => history.go(-1)}
                    className="mr-3 flex-1">{lang['Back']}</Button>
                <Button variant={'primary'}
                    onClick={handleConfirm}
                    className="mr-3 flex-1">
                    {trackDetail.id
                        ? lang['Save']
                        : lang['Create']
                    }
                </Button>
            </div>
        </div>
    </div>
}

interface DialogSelectorMemberProps {
    memberships: Membership[]
    onChange: (profile: Profile | null) => void
    close: () => void
    lang: Dictionary
}

function DialogSelectorMember({ lang, onChange, close, memberships }: DialogSelectorMemberProps) {
    const [selected, setSelected] = useState<Profile | null>(null)
    return <div className="w-[100vw] h-[100svh] bg-white p-3 overflow-auto relative">
        <div className="page-width-md">
            <div className="font-semibold text-lg text-center py-3">
                Selector Member
            </div>

            <div className="pb-[30px]">
                {memberships.map((member, i) => {
                    return <div key={i}
                        onClick={() => {
                            setSelected(member.profile)
                        }}
                        className="mb-3 justify-between cursor-pointer flex-row-item-center shadow rounded-lg px-6 h-[60px] duration-300 hover:bg-secondary">
                        <div className='flex-row-item-center'>
                            <Avatar
                                size={28}
                                profile={member.profile}
                                className="rounded-full mr-2" />
                            <div>{displayProfileName(member.profile)}</div>
                        </div>
                        {
                            selected?.id === member.profile.id &&
                            <i className="uil-check-circle text-2xl text-green-500"></i>
                        }
                    </div>
                })
                }
            </div>

            <div className="sticky bottom-6 mx-auto grid grid-cols-2 gap-3 mb-3">
                <Button variant={"secondary"} onClick={close}>{lang['Cancel']}</Button>
                <Button variant={"primary"}
                    onClick={() => {
                        onChange(selected);
                        close()
                    }}>
                    {lang['Select']}
                </Button>
            </div>
        </div>
    </div>
}