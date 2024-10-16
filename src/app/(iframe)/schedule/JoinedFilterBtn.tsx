'use client'

export default function JoinedFilterBtn(props: { checked?: boolean }) {
    const handleClick = () => {
        const currSearchParams = new URLSearchParams(window.location.search)
        !props.checked ? currSearchParams.set('applied', 'true') : currSearchParams.delete('applied')
        window.location.href = `${window.location.pathname}?${currSearchParams.toString()}`
    }

    return <div className="mr-4 flex-row-item-center text-sm cursor-pointer" onClick={handleClick}>
        <div>Joined</div>
        <input
            readOnly={true}
            type="radio" name="radio-1" className={`ml-2 radio ${props.checked ? 'radio-primary ' : ''}radio-xs`}
            checked={props.checked}/>
    </div>
}
