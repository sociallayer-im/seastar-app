'use client'

import {Dictionary} from "@/lang"
import {Button} from "@/components/shadcn/Button"
import {useEffect, useState} from "react"
import ProfileInput from "@/components/client/ProfileInput"
import {Textarea} from "@/components/shadcn/Textarea"
import {Group, Profile, sendInvite} from '@sola/sdk'
import Avatar from '@/components/Avatar'
import {displayProfileName, getAuth} from '@/utils'
import DropdownMenu from '@/components/client/DropdownMenu'
import {Input} from '@/components/shadcn/Input'
import resolveLocalCsvFile from '@/utils/markdown/resolveLocalCsvFile'
import useModal from '@/components/client/Modal/useModal'
import {CLIENT_MODE} from '@/app/config'


export interface InviteFormProps {
    group: Group
    lang: Dictionary
}

type RoleOpt = { label: string, value: string }


export default function InviteForm({lang, group}: InviteFormProps) {
    const [receivers, setReceivers] = useState<Profile[]>([])
    const [reason, setReason] = useState('')
    const [role, setRole] = useState('member')
    const [error, setError] = useState('')
    const {showLoading, closeModal} = useModal()

    const roleOptions: RoleOpt[] = [
        {label: lang['Member'], value: 'member'},
        {label: lang['Manager'], value: 'manager'},
        {label: lang['Issuer'], value: 'issuer'},
    ]

    useEffect(() => {
        console.log('receivers', receivers)
    }, [receivers])

    useEffect(() => {
        const roleLabel = roleOptions.find(r => r.value === role)!.label
        setReason(lang['Invite you to become [1] [2]']
            .replace('[1]', displayProfileName(group))
            .replace('[2]', roleLabel))
    }, [role])

    const handleImportCsv = async () => {
        try {
            const rows = await resolveLocalCsvFile()
            const newReceivers = rows.map(row => {
                return {
                    nickname: row,
                    id: 0,
                    handle: '',
                    username: '',
                    image_url: ''
                } as Profile
            })
            setReceivers([...receivers, ...newReceivers])
        } catch (e: unknown) {
            console.error(e)
            setError(e instanceof Error ? e.message : 'Resolve CSV file failed')
        }
    }

    const handleDownloadCsv = () => {
        window.open('/files/invite_temp.csv', '_blank')
    }

    const handleSend = async () => {
        const loading = showLoading()
        const handles = receivers.map(r => r.handle || r.nickname) as string[]
        try {
            const authToken = getAuth()
            if (!authToken) {
                closeModal(loading)
                setError('You are not logged in')
                return
            }
            await sendInvite({
                params: {
                    groupId: group.id,
                    receivers: handles,
                    role,
                    message: reason,
                    authToken
                },
                clientMode: CLIENT_MODE
            })
            closeModal(loading)
            alert('ok')
            window.location.href = `/group/${group.handle}/management/invite/success?role=${role}`
        } catch (e: unknown) {
            console.error(e)
            closeModal(loading)
            setError(e instanceof Error ? e.message : 'Send invite failed')
        }

    }

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width-sm min-h-[calc(100svh-48px)] px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Invite Member']}</div>

            <div className="flex flex-col mx-auto">
                <div className="mb-8 rounded-lg h-[200px] bg-secondary flex flex-col justify-center items-center">
                    <Avatar profile={group} size={96} className="mb-2 border-2 border-white shadow"/>
                    <div className="font-semibold">{displayProfileName(group)} <i className="capitalize">{role}</i>
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <div className="font-semibold mb-1">{lang['Role']}</div>
                <DropdownMenu
                    options={roleOptions}
                    value={[roleOptions.find(r => r.value === role)!] as RoleOpt[]}
                    renderOption={opt => opt.label}
                    onSelect={opt => {
                        setRole(opt[0].value)
                    }}
                    valueKey="value">
                    <Input
                        className="w-full"
                        readOnly
                        value={roleOptions.find(r => r.value === role)!.label}
                        endAdornment={<i className="uil-angle-down text-xl"/>}
                    />
                </DropdownMenu>
            </div>

            <div className="mb-8">
                <div className="font-semibold mb-1">{lang['Invite Message (Optional)']}</div>
                <Textarea value={reason}
                          placeholder={lang['Reason (Optional)']}
                          onChange={e => setReason(e.target.value)}/>
            </div>

            <div className="mb-8">
                <div className="font-semibold mb-1">{lang['Receivers']}</div>
                <div
                    className="text-sm mb-1">{lang['Input the username or email of the people can receive the invite.']}</div>
                <Button
                    onClick={handleDownloadCsv}
                    size="xs" variant="secondary" className="text-xs mr-2 mb-2">
                    <i className="uil-import"/>
                    {lang['Download CSV Template']}
                </Button>
                <Button size="xs" variant="secondary"
                        onClick={handleImportCsv}
                        className="text-xs mb-2">
                    <i className="uil-upload"/>
                    {lang['Import From CSV File']}
                </Button>

                <ProfileInput
                    lang={lang}
                    value={receivers}
                    onChange={setReceivers}
                />
                <div className="text-red-400 text-sm my-3">{error}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 mx-auto rounded-lg">
                <Button variant="secondary"
                        onClick={() => {
                            history.go(-1)
                        }}>
                    {lang['Cancel']}
                </Button>
                <Button variant="special"
                        disabled={!receivers.length}
                        onClick={handleSend}>
                    {lang['Send Invite']}
                </Button>
            </div>
        </div>
    </div>
}