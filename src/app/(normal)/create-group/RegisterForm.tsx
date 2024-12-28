'use client'

import {Dictionary} from '@/lang'
import {useState} from 'react'
import {Input} from "@/components/shadcn/Input"
import {Button} from "@/components/shadcn/Button"

export default function RegisterForm(props: { lang: Dictionary}) {
    const [error, setError] = useState('')
    const [handle, setHandle] = useState('')

    const handleCheckUsername = (username: string) => {
        if (!username) {
            setError('Please input username')
            return
        }

        const errorMessages = []
        if (!/^[A-Za-z0-9-]+$/.test(username)) {
            errorMessages.push(props.lang['Contain the English-language letters and the digits 0-9'])
        }
        if (/^-|-$/.test(username)) {
            errorMessages.push(props.lang['Hyphens can also be used but it can not be used at the beginning and at the end'])
        }
        if (/--/.test(username)) {
            errorMessages.push(props.lang['Hyphens cannot appear consecutively'])
        }
        if (username.length < 6) {
            errorMessages.push(props.lang['Should be equal or longer than 6 characters'])
        }
        setError(errorMessages.join('; '))
    }

    const handleRegister = async () => {

    }

    return <>
        <Input
            className="w-full"
            autoFocus
            maxLength={100}
            autoComplete={'off'}
            value={handle}
            placeholder={props.lang['Your username']}
            onBlur={() => {
                handleCheckUsername(handle.trim())
            }}
            onChange={(e) => {
                setHandle(e.target.value)
            }}
        />
        <Button onClick={handleRegister} variant={"primary"} className="my-4 w-full">
            {props.lang['Confirm']}
        </Button>
        <div className="text-red-400 text-sm h-10">{error}</div>
    </>
}
