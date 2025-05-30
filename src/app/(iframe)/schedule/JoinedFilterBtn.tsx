'use client'

import { IframeSchedulePageSearchParams } from "./utils"

export default function JoinedFilterBtn(props: { checked?: boolean, label?: string, onChange?: (searchParams: IframeSchedulePageSearchParams) => void }) {
    const handleClick = () => {
        const currSearchParams = new URLSearchParams(window.location.search)
        !props.checked ? currSearchParams.set('applied', 'true') : currSearchParams.delete('applied')
        if (!!props.onChange) {
            props.onChange(Object.fromEntries(currSearchParams.entries()) as IframeSchedulePageSearchParams)
        } else {
            window.location.href = `${window.location.pathname}?${currSearchParams.toString()}`
        }
    }

    return <div className="mr-4 sm:flex flex-row items-center text-sm cursor-pointer hidden" onClick={handleClick}>
        <div>{props.label || 'Joined' }</div>
        <input
            readOnly={true}
            type="radio" name="radio-1" className={`ml-2 radio ${props.checked ? 'radio-primary ' : ''}radio-xs`}
            checked={props.checked}/>
    </div>
}
