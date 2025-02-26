'use client'

import {Media_Meta, urlToUsername, usernameToUrl} from "@/utils/social_media_meta"
import {Dictionary} from "@/lang"
import {Input} from "@/components/shadcn/Input"
import {useState} from "react"
import {Button} from "@/components/shadcn/Button"

export interface DialogEditSocialMediaProps {
    close?: () => void
    value?: string
    type: keyof Solar.SocialMedia
    lang: Dictionary,
    onConfirm?: (value: string) => void
}

export default function DialogEditSocialMedia({close, value, type, lang, onConfirm}: DialogEditSocialMediaProps) {
    const [newValue, setNewValue] = useState(value || '')
    const [error, setError] = useState('')

    const handleConfirm = () => {
        if (!newValue) {
            setError('Please enter a valid value')
            return
        }

        close && close()
        onConfirm && onConfirm(usernameToUrl(urlToUsername(newValue.trim(), type as any), type))
    }

    return <div
        className="shadow rounded-lg bg-white p-4 w-80">
        <div className="font-semibold mb-3">{lang['Edit']} {(Media_Meta as any)[type].label}</div>
        <div className="text-[#999] mb-3 text-sm">{(Media_Meta as any)[type].eg}</div>
        <Input value={newValue}
            className="w-full"
            onChange={e => {
                setNewValue(e.target.value)
            }}/>

        <div className="text-red-400 h-4 text-sm">{error}</div>
        <div className="flex-row-item-center mt-3">
            <Button variant="secondary" onClick={() => {!!close && close()}} className="flex-1 mr-2">{lang['Cancel']}</Button>
            <Button variant="primary" onClick={handleConfirm} className="flex-1">{lang['Confirm']}</Button>
        </div>
    </div>
}
