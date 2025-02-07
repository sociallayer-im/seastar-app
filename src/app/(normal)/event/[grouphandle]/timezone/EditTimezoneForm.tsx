'use client'

import {GroupDetail, updateGroup} from '@sola/sdk'
import {Dictionary} from '@/lang'
import TimezoneForm from '@/app/(normal)/event/[grouphandle]/timezone/TimezoneForm'
import {Button} from '@/components/shadcn/Button'
import {useState} from 'react'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {getAuth} from '@/utils'
import {CLIENT_MODE} from '@/app/config'

export default function EditTimezoneForm({groupDetail, lang}: { groupDetail: GroupDetail, lang: Dictionary }) {
    const [draft, setDraft] = useState(groupDetail)

    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const handleSave = async () => {
        const loading = showLoading()
        try {
            const authToken = getAuth()
            await updateGroup({
                params: {
                    group: draft,
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
        <div className="page-width-md min-h-[calc(100svh-48px)] px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Timezone']}</div>
            <div className="mb-4">
                {lang['Default time zone for group event, but you can still change it when creating the event. If keep it blank, the default time zone will follow the operating system.']}
            </div>

            <div>
                <TimezoneForm value={draft.timezone} onSelect={(tz) => {
                    setDraft({...draft, timezone: tz})
                }}/>
            </div>

            <div className="grid-cols-2 grid gap-3 mt-6 flex-row-item-center justify-center w-full mx-auto">
                <Button variant={'secondary'} className="w-full"
                        onClick={() => {
                            history.go(-1)
                        }}
                >{lang['Cancel']}</Button>
                <Button variant={'primary'} className="w-full"
                        onClick={handleSave}
                >{lang['Save']}</Button>
            </div>
        </div>
    </div>
}