'use client'

import {useEffect, useState} from 'react'
import styles from '@/components/client/Editor/RichTextEditor.module.scss'

/**
 * Client-side counterpart of @/components/RichTextDisplayer, for the schedule
 * popup — a client component, so it cannot render the server one.
 *
 * The markdown parser is imported on demand rather than statically: this popup
 * only opens on a click, and a static import would put markdown-it back into
 * the schedule pages' first load, which is the cost this whole change removes.
 */
export default function RichTextDisplayerClient({markdownStr}: { markdownStr: string }) {
    const [html, setHtml] = useState('')

    useEffect(() => {
        if (!markdownStr) {
            setHtml('')
            return
        }

        let cancelled = false
        import('@/utils/markdown_html')
            .then(({markdownToHtml}) => {
                if (!cancelled) setHtml(markdownToHtml(markdownStr))
            })
            .catch(e => {
                console.error('[markdown] failed to render', e)
            })

        return () => {
            cancelled = true
        }
    }, [markdownStr])

    if (!markdownStr) return <div></div>

    return <div className={`${styles['editor-wrapper']} ${styles['display']}`}>
        <div className="ProseMirror" dangerouslySetInnerHTML={{__html: html}}/>
    </div>
}
