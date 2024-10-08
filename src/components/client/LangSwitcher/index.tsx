'use client'

import {dictionaries} from '@/lang'
import Cookies from 'js-cookie'

export default function LangSwitcher(props: { value: keyof typeof dictionaries, refresh?: boolean }) {
    const opts = Object.keys(dictionaries) as Array<keyof typeof dictionaries>

    const handleSelect = (lang: keyof typeof dictionaries) => {
        Cookies.set('lang', lang, {expires: 365})
        if (props.refresh) {
            window.location.reload()
        }
    }

    return <div className="dropdown dropdown-bottom dropdown-end">
        <div tabIndex={0} role="button"
            className="flex-row-item-center btn btn-ghost btn-sm text-xs font-normal px-1">
            {props.value.toUpperCase()}
        </div>
        <ul tabIndex={0}
            className=" dropdown-content menu bg-white rounded-lg z-[1] p-2 shadow">
            {
                opts.map((opt) => {
                    return <li key={opt}>
                        <div onClick={() => handleSelect(opt)}>{opt.toUpperCase()}</div>
                    </li>
                })
            }
        </ul>
    </div>
}
