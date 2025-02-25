'use client'

import {createPopupCity, getGroupDetailByHandle, Group, GroupDetail, PopupCityDraft, updateGroup} from '@sola/sdk'
import {Dictionary} from '@/lang'
import {useMemo, useState} from 'react'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {CLIENT_MODE} from '@/app/config'
import Step0 from '@/app/(normal)/popup-city/create/Step0'
import Step1 from '@/app/(normal)/popup-city/create/Step1'
import Step2 from '@/app/(normal)/popup-city/create/Step2'
import Step3 from '@/app/(normal)/popup-city/create/Step3'
import {getAuth} from '@/utils'

export interface CreatePopupCityFormProps {
    availableGroups: Group[],
    lang: Dictionary
}

export default function CreatePopupCityForm({availableGroups, lang}: CreatePopupCityFormProps) {
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const groupOpts = useMemo(() => {
        return [
            {
                nickname: lang['Create a Group'],
                id: 0
            } as Group,
            ...availableGroups
        ]
    }, [availableGroups])

    const [step, setStep] = useState(0)
    const [draft, setDraft] = useState<PopupCityDraft>({
        image_url: null,
        location: null,
        title: '',
        website: null,
        start_date: null,
        end_date: null,
        group_id: null,
    })

    const selectedGroup = useMemo(() => {
        return groupOpts.find(g => g.id === draft.group_id)
    }, [draft, groupOpts])

    const [groupDetail, setGroupDetail] = useState<GroupDetail | null>(null)
    const handleSetStep1 = async () => {
        const loading = showLoading()
        const groupDetail = await getGroupDetailByHandle({
            params: {groupHandle: selectedGroup!.handle},
            clientMode: CLIENT_MODE
        })
        setGroupDetail(groupDetail)
        closeModal(loading)
        setStep(1)
    }

    const handleCreatePopupCity = async () => {
        const loading = showLoading()
        try {
            const authToken = getAuth()
            if (groupDetail?.timezone) {
                await updateGroup({
                    params: {
                        group: groupDetail,
                        authToken: authToken!
                    },
                    clientMode: CLIENT_MODE
                })
            }
            await createPopupCity({
                params: {popupCityDraft: draft, authToken: authToken!},
                clientMode: CLIENT_MODE
            })
            setStep(3)
        } catch (e: unknown) {
            toast({
                description: e instanceof Error ? e.message : 'Fail to create popup-city',
                variant: 'destructive'
            })
        } finally {
            closeModal(loading)
        }
    }

    return <div>
        <div className="absolute left-0 top-0 w-full h-[400px] opacity-[0.3] pointer-events-none"
             style={{background: 'linear-gradient(180deg, #9efedd, rgba(237, 251, 246, 0))'}}/>
        <div className="w-full min-h-[calc(100svh-48px)] flex flex-row justify-center items-center relative z-10">
            {step === 0 &&
                <Step0
                    availableGroups={availableGroups}
                    lang={lang}
                    popupCityState={[draft, setDraft]}
                    onBack={() => location.href = '/'}
                    onNext={handleSetStep1}
                />
            }

            {step === 1 &&
                <Step1
                    lang={lang}
                    popupCityState={[draft, setDraft]}
                    onBack={() => setStep(0)}
                    onNext={() => setStep(2)}
                />
            }

            {step === 2 &&
                <Step2
                    lang={lang}
                    groupDetailState={[groupDetail!, setGroupDetail]}
                    popupCityState={[draft, setDraft]}
                    onBack={() => setStep(1)}
                    onNext={handleCreatePopupCity}
                />
            }

            {step === 3 &&
                <Step3
                    lang={lang}
                    popupCityName={draft.title || ''}
                    groupHandle={selectedGroup?.handle || ''}
                />
            }
        </div>
    </div>
}