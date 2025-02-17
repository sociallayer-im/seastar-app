'use client'
export default function Radio({checked, className, onChange}: {checked: boolean, className?: string, onChange?: () => void}) {
    const handleClick = () => {
        !!onChange && onChange()
    }

    return checked
        ? <i className={`uil-check-circle cursor-pointer ml-2 text-2xl text-green-500 ${className}`} onClick={handleClick}/>
        : <i className={`uil-circle ml-2 cursor-pointer text-2xl text-gray-500 ${className}`} onClick={handleClick}/>
}