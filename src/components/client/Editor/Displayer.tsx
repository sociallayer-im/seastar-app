import {useEffect, useRef} from 'react'
import styles from './RichTextEditor.module.scss'
import {EditorView,} from "prosemirror-view"
import {EditorState} from "prosemirror-state"
import {defaultMarkdownParser} from "./markdown/index"


function RichTextDisplayer({markdownStr}: { markdownStr: string }) {
    const displayer = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!displayer.current || typeof window === 'undefined') return

        const view = new EditorView(displayer.current, {
            state: EditorState.create({
                doc: defaultMarkdownParser.parse(markdownStr)!,
            }),
            editable: () => false
        })

        return () => {
            view.destroy()
        }
    }, [displayer])

    return (!!markdownStr ? <div ref={displayer!} className={`${styles['editor-wrapper']} ${styles['display']}`}></div>
        : <div></div>
    )
}

export default RichTextDisplayer
