import {ReactElement, useEffect, useRef} from 'react'

export default function ModalWrapper({clickOutsideToClose = true, ...props}: {
    close: () => void,
    content: (close: () => void) => ReactElement,
    clickOutsideToClose?: boolean
}) {
    const contentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!!contentRef.current) {
            setTimeout(() => {
                contentRef.current?.classList.add('!opacity-100')
                contentRef.current?.classList.add('!scale-100')
            }, 100)
        }
    }, [])

    const handleClickOutside = () => {
        if (clickOutsideToClose) {
            props.close()
        }
    }

    return <div data-testid="modal-wrapper"
        className="fixed left-0 top-0 z-[9999] w-[100vw] h-[100svh] flex flex-col items-center justify-center">

        <div data-testid="modal-shell"
            onClick={handleClickOutside}
            className="absolute z-0 left-0 top-0 w-[100vw] h-[100svh] bg-white opacity-60 blur-2xl" />

        <div ref={contentRef} className="relative z-10 opacity-0 scale-95 transition-all duration-300">
            {props.content(props.close)}
        </div>
    </div>
}
