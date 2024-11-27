'use client'

import {dictionaries} from '@/lang'
import Cookies from 'js-cookie'
import DropdownMenu from '@/components/client/DropdownMenu'

export default function LangSwitcher(props: { value: keyof typeof dictionaries, refresh?: boolean }) {
    const langTypes = Object.keys(dictionaries) as Array<keyof typeof dictionaries>
    const langTypesOpts = langTypes.map(langType => {return {id: langType, label: langType.toUpperCase()}})
    const value = langTypesOpts.find(opt => opt.id === props.value) || langTypesOpts[0]

    const handleSelect = (lang: keyof typeof dictionaries) => {
        Cookies.set('lang', lang, {expires: 365})
        if (props.refresh) {
            window.location.reload()
        }
    }

    return <DropdownMenu
        align="right"
        options={langTypesOpts}
        value={[value]}
        renderOption={(opt) => <div className="w-14">{opt.label}</div>}
        valueKey="id"
        onSelect={(opts) => handleSelect(opts[0].id)}>
        {props.value.toUpperCase()}
    </DropdownMenu>
}
