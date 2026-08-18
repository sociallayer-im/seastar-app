import styles from '@/components/client/Editor/RichTextEditor.module.scss'
import {markdownToHtml} from '@/utils/markdown_html'

/**
 * Read-only markdown rendering, done on the server.
 *
 * This used to mount a real (non-editable) ProseMirror EditorView in the
 * browser, which pulled markdown-it and prosemirror-view/-state into the first
 * load of every page showing an event description. The markup below is what
 * that editor produced — `.ProseMirror` is a `:global` class in the SCSS
 * module, so the existing styles apply unchanged.
 *
 * The HTML is generated from the schema's own toDOM specs and escapes text and
 * attributes, with a protocol allowlist on href/src (see markdown_html.ts).
 */
export default function RichTextDisplayer({markdownStr}: { markdownStr: string }) {
    if (!markdownStr) return <div></div>

    return <div className={`${styles['editor-wrapper']} ${styles['display']}`}>
        <div className="ProseMirror" dangerouslySetInnerHTML={{__html: markdownToHtml(markdownStr)}}/>
    </div>
}
