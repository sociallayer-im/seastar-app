import {getLabelColor} from "@/utils/label_color"

export interface SelectTagProps {
    tags: string[]
    value: string[]
    onSelect?: (tag: string[]) => void
}
export default function SelectTag(props: SelectTagProps) {
    const handleSelect = (tag: string) => {
        if (props.value.includes(tag)) {
            props.onSelect?.(props.value.filter(t => t !== tag))
        } else {
            props.onSelect?.([...props.value, tag])
        }
    }

    const getStyle = (tag: string) => {
        const color = getLabelColor(tag)
        return props.value.includes(tag) ? {borderColor: color, color: color} : {borderColor: '#fff'}
    }

    return (
        <div className="flex flex-wrap">
            {props.tags.map(tag => {
                return <div key={tag}
                    onClick={() => handleSelect(tag)}
                    style={getStyle(tag)}
                    className="text-sm font-semibold select-none px-2 py-1 m-1 border border-secondary rounded-full cursor-pointer flex-row-item-center !inline-flex mr-2">
                    <i className='mr-1 w-2 h-2 shrink-0 rounded-full'
                        style={{background: getLabelColor(tag)}}></i>
                    {tag}
                </div>
            }
            )}
        </div>
    )
}
