'use client'

export default function OuterLink(props: {text: string, href: string}) {
    return <a href={props.href}
        onClick={e => e.stopPropagation()}
        className="flex-row-item-center"
        target="_blank">
        <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">{props.text}</span>
        <i className="uil-arrow-up-right"/>
    </a>
}
