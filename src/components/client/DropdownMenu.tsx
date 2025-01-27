import {useState, useRef, useEffect, CSSProperties, useCallback} from "react"

export interface DropdownTrigger {
    trigger: null | ((show: boolean) => void)
}

export default function DropdownMenu<T>(props: {
    children: React.ReactNode
    options: T[],
    multiple?: boolean,
    value?: T[],
    onSelect: (values: T[]) => void,
    renderOption: (option: T, index: number) => React.ReactNode,
    valueKey: keyof T
    align?: 'left' | 'right'
    fixWidth?: boolean,
    trigger?: DropdownTrigger
    optDividers?: boolean
}) {

    const triggerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const [show, setShow] = useState(false)
    const [positionStyle, setPositionStyle] = useState<CSSProperties>({})

    const trigger = (show: boolean) => {
        calculatePosition()
        setShow(show)
    }

    if (props.trigger) {
        props.trigger.trigger = trigger
    }

    const calculatePosition = useCallback(() => {
        const triggerRect = triggerRef.current?.getBoundingClientRect()
        const contentRect = contentRef.current?.getBoundingClientRect()
        if (triggerRect && contentRect) {
            const contentHeight = contentRect.height
            const triggerBottomOffset = window.innerHeight - triggerRect.bottom

            setPositionStyle({
                top: triggerBottomOffset < contentHeight ? triggerRect.top - contentHeight : triggerRect.top + triggerRect.height,
                left: triggerRect.left,
                minWidth: triggerRect.width,
                maxWidth: props.fixWidth ? triggerRect.width : undefined,
                marginLeft: props.align === 'right' ?triggerRect.width - contentRect.width : '0'
            })
        }
    }, [props.align, props.fixWidth])

    useEffect(() => {
        if (show) {
            const interval = window.setInterval(calculatePosition, 100)
            return () => clearInterval(interval)
        }
    }, [calculatePosition, show])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShow(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        window.addEventListener('resize', calculatePosition)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            window.removeEventListener('resize', calculatePosition)
        }
    }, [calculatePosition])

    const handleSelect = (option: T) => {
        if (props.multiple) {
            if (props.value?.find(v => v[props.valueKey] === option[props.valueKey])) {
                props.onSelect(props.value.filter(v => v[props.valueKey] !== option[props.valueKey]))
            } else {
                props.onSelect([...(props.value || []), option])
            }
        } else {
            props.onSelect([option])
        }
        setShow(false)
    }

    return <div className="dropwdown relative" ref={dropdownRef}>
        <div className="dropdown-trigger"
            ref={triggerRef}
            onClick={props.trigger ? undefined : () => trigger(!show)}>
            {props.children}
        </div>
        <div
            ref={contentRef}
            style={positionStyle}
            className={`${show ? 'opacity-1 visible' : 'opacity-0 invisible'} dropdown-content max-h-[200px] overflow-auto fixed bg-background shadow rounded-lg p-2 z-[9999] decoration-2`}>
            {props.options.map((option, index) => <div
                className={`${props.optDividers ? 'border-gray-100 border-b-[1px]': 'rounded-lg mb-1'} last:mb-0 py-2 px-3 cursor-pointer hover:bg-[#F1F1F1] ${props.value?.find(v => v[props.valueKey] === option[props.valueKey]) ? 'bg-[#F1F1F1]' : ''}`}
                key={index}
                onClick={() => handleSelect(option)}>
                {props.renderOption(option, index)}</div>)
            }
        </div>
    </div>
}
