'use client'

import {Dictionary} from '@/lang'
import {useEffect, useState} from 'react'
import {Input} from "@/components/shadcn/Input"
import {Button} from "@/components/shadcn/Button"
import {checkDomainInput, getAuth, verifyUsername} from '@/utils'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import useModal from '@/components/client/Modal/useModal'
import {createGroup} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {useToast} from '@/components/shadcn/Toast/use-toast'

export default function RegisterForm(props: { lang: Dictionary }) {
    const {showConfirmDialog} = useConfirmDialog()
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const [error, setError] = useState('')
    const [createError, setCreateError] = useState('')
    const [handle, setHandle] = useState('')

    useEffect(() => {
        if (!handle) {
            setError('')
            return
        }

        setError(verifyUsername(handle, props.lang) || '')
    }, [handle])


    const handleRegister = async () => {
        if (!handle || error) return
        setCreateError('')

        showConfirmDialog({
            lang: props.lang,
            title: props.lang['Create a Group'],
            content: `${props.lang['Do you want to create a group with this username ?']} 
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
                    toast({
                        title: props.lang['Create Successfully'],
                        variant: 'success'
                    })
                    setTimeout(() => {
                        window.location.href = `/group/${group.handle}`
                    }, 2000)
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
            setHandle(value.toLowerCase())
        }
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
        <div className="text-red-400 text-sm h-10">{error}</div>
        <div className="text-red-400 text-sm h-10">{createError}</div>
    </>
}
