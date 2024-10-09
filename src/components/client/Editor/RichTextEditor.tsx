import {Command, EditorState, Plugin} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {defaultMarkdownParser, defaultMarkdownSerializer, schema as markdownSchema} from "./markdown"
import {lift, setBlockType, toggleMark, wrapIn} from "prosemirror-commands"
import {wrapInList} from "./schema-list"
import {redo, undo} from "prosemirror-history"
import {editorSetup} from "./setup"
import {useEffect, useRef, useState} from 'react'

export interface MenuItemForm {
    name: string
    title: string
    command: Command
    icon?: string
    hide?: boolean
}

function MenuButton({
    menuItemForm,
    editorState,
    editorView
}: { menuItemForm: MenuItemForm, editorState?: EditorState, editorView?: EditorView }) {
    const [enable, setEnable] = useState<boolean>(false)

    useEffect(() => {
        if (editorState) {
            const isAvailable = menuItemForm.command(editorState, undefined, editorView)
            setEnable(isAvailable)
        } else {
            setEnable(false)
        }
    }, [editorState])

    return <div className={enable ? 'menu-item' : 'menu-item disable'} title={menuItemForm.title} onClick={() => {
        if (editorState && editorView) {
            editorView?.focus()
            menuItemForm.command(editorState, editorView.dispatch, editorView)
        }
    }}>
        {
            menuItemForm.icon ? <i className={menuItemForm.icon}></i> : menuItemForm.name
        }
    </div>
}

export default function RichTextEditor({initText, onChange}: {
    initText?: string,
    onChange?: (text: string) => any
}) {
    const editorRef = useRef<any>(null)
    const editorViewRef = useRef<any>(null)
    const [editorState, setEditorState] = useState<any>(null)
    const [editorMenuCommand, setEditorMenuCommand] = useState<{
        markerMenu: MenuItemForm[],
        listMenu: MenuItemForm[],
        insertMenu: MenuItemForm[],
        historyMenu: MenuItemForm[],
        otherMenu: MenuItemForm[]
    }>({
        markerMenu: [],
        listMenu: [],
        insertMenu: [],
        otherMenu: [],
        historyMenu: []
    })
    const editorId = Math.random().toString(36).substring(7)

    const [text, setText] = useState<string>('')

    useEffect(() => {
        !!onChange && onChange(text)
    }, [text])

    useEffect(() => {
        if (editorRef.current && typeof window !== 'undefined') {
            const UpdateEditorView = new Plugin({
                view(editorView) {
                    return {
                        update(view, prevState) {
                            setEditorState(view.state)
                            setText(defaultMarkdownSerializer.serialize(view.state.doc))
                            // const res = defaultMarkdownSerializer.serialize(view.state.doc)
                            // onChange && onChange(res)
                        }
                    }
                }
            })

            const markerMenu: MenuItemForm[] = [
                {name: 'B', title: 'Bold', command: toggleMark(markdownSchema.marks.strong), icon: 'editor-icon-bold'},
                {name: 'I', title: 'Italic', command: toggleMark(markdownSchema.marks.em), icon: 'editor-icon-italic'},
                {
                    name: 'Quote',
                    title: 'Quote',
                    command: wrapIn(markdownSchema.nodes.blockquote),
                    icon: 'editor-icon-quote'
                },
            ]

            const listMenu: MenuItemForm[] = [
                {
                    name: 'Ordered List',
                    title: 'Ordered List',
                    command: wrapInList(markdownSchema.nodes.ordered_list),
                    icon: 'editor-icon-ordered-list'
                },
                {
                    name: 'Bullet List',
                    title: 'BulletList',
                    command: wrapInList(markdownSchema.nodes.bullet_list),
                    icon: 'editor-icon-unordered-list'
                }
            ]

            const insertMenu: MenuItemForm[] = [
                {
                    name: 'Link',
                    title: 'Link',
                    icon: 'editor-icon-link',
                    command: (editorState, dispatch, editorView) => {
                        const {from, $from, to, empty} = editorState.selection
                        let isInLink: undefined | boolean = false
                        if (empty) {
                            const node = editorState.doc.nodeAt(from)
                            isInLink = node?.marks.some(mark => mark.type === markdownSchema.marks.link)
                        }
                        const enable = !isInLink && !editorState.doc.rangeHasMark(from, to, markdownSchema.marks.link)
                        if (enable && dispatch) {
                            // openDialog({
                            //     size: [340, 'auto'],
                            //     position: 'bottom',
                            //     content: (close: () => any) => {
                            //         return <DialogInsertLink close={close} onConfig={(href, title) => {
                            //             if (!empty) {
                            //                 toggleMark(markdownSchema.marks.link, {
                            //                     href,
                            //                     title
                            //                 })(editorState, dispatch, editorView)
                            //             } else {
                            //                 const schema = editorState.schema
                            //                 const node = schema.text(title, [markdownSchema.marks.link.create({
                            //                     title,
                            //                     href
                            //                 })])
                            //                 dispatch && dispatch(editorState.tr.replaceSelectionWith(node, false))
                            //             }
                            //             close()
                            //             editorView?.focus()
                            //         }}/>
                            //     }
                            // })
                            return true
                        } else return enable && !dispatch
                    }
                },
                {
                    name: 'Upload Image',
                    title: 'Url Image',
                    hide: true,
                    command: (state, dispatch, view) => {
                        const canInsert = () => {
                            const $from = state.selection.$from
                            for (let d = $from.depth; d >= 0; d--) {
                                const index = $from.index(d)
                                if ($from.node(d).canReplaceWith(index, index, markdownSchema.nodes.image)) return true
                            }
                            return false
                        }

                        const available = canInsert()

                        if (view && dispatch && available) {
                            // selectFile(imgUrl => {
                            //     if (imgUrl) {
                            //         const attr = {
                            //             src: imgUrl,
                            //             title: '',
                            //         }
                            //         dispatch && dispatch(state.tr.replaceSelectionWith(markdownSchema.nodes.image.createAndFill(attr)!))
                            //         view && view.focus()
                            //     }
                            // })
                            return true
                        } else {
                            return available
                        }
                    }
                },
                {
                    name: 'Url Image',
                    title: 'Url Image',
                    command: (state, dispatch, view) => {
                        const canInsert = () => {
                            const $from = state.selection.$from
                            for (let d = $from.depth; d >= 0; d--) {
                                const index = $from.index(d)
                                if ($from.node(d).canReplaceWith(index, index, markdownSchema.nodes.image)) return true
                            }
                            return false
                        }

                        const available = canInsert()

                        if (view && dispatch && available) {
                            // openDialog({
                            //     size: [340, 'auto'],
                            //     position: 'bottom',
                            //     content: (close: () => any) => <DialogInsertImage
                            //         close={close}
                            //         onConfig={(src, title) => {
                            //             const attr = {
                            //                 src,
                            //                 title,
                            //             }
                            //             dispatch && dispatch(state.tr.replaceSelectionWith(markdownSchema.nodes.image.createAndFill(attr)!))
                            //             view && view.focus()
                            //             close()
                            //         }}
                            //     />
                            // })
                            return true
                        } else {
                            return available
                        }
                    },
                    hide: true
                }
            ]

            const historyMenu: MenuItemForm[] = [
                {
                    name: 'Undo',
                    title: 'Undo',
                    icon: 'editor-icon-undo',
                    command: (state, dispatch) => {
                        return undo(state, dispatch)
                    }
                },
                {
                    name: 'Redo',
                    title: 'Redo',
                    icon: 'editor-icon-redo',
                    command: (state, dispatch) => {
                        return redo(state, dispatch)
                    }
                }
            ]

            const otherMenu: MenuItemForm[] = [
                {hide: true, name: 'Code', title: 'Code', command: toggleMark(markdownSchema.marks.code)},
                {
                    hide: true,
                    name: 'Code Block',
                    title: 'CodeBlock',
                    command: setBlockType(markdownSchema.nodes.code_block)
                },
                {
                    hide: true,
                    name: 'Plant Text',
                    title: 'PlantText',
                    command: setBlockType(markdownSchema.nodes.paragraph)
                },
                {hide: true, name: 'Lift out', title: 'Lift out of enclosing block', command: lift},
                {
                    hide: true,
                    name: 'Video', title: 'Video', command: (state, dispatch, view) => {
                        const canInsert = () => {
                            const $from = state.selection.$from
                            for (let d = $from.depth; d >= 0; d--) {
                                const index = $from.index(d)
                                if ($from.node(d).canReplaceWith(index, index, markdownSchema.nodes.image)) return true
                            }
                            return false
                        }

                        const available = canInsert()

                        if (view && dispatch && available) {
                            const attr = {
                                src: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Schlossbergbahn.webm',
                            }
                            dispatch && dispatch(state.tr.replaceSelectionWith(markdownSchema.nodes.video.createAndFill(attr)!))
                            view && view.focus()
                            return true
                        } else {
                            return available
                        }
                    }
                }
            ]

            editorViewRef.current = new EditorView(document.querySelector(`#${CSS.escape(editorId)}`), {
                state: EditorState.create({
                    doc: defaultMarkdownParser.parse(initText || '')!,
                    plugins: [UpdateEditorView, ...editorSetup({schema: markdownSchema})],
                })
            })
            setEditorState(editorViewRef.current.state)
            setEditorMenuCommand({
                markerMenu,
                listMenu,
                insertMenu,
                historyMenu,
                otherMenu
            })
        }

        return () => {
            editorViewRef.current?.destroy()
        }
    }, [])

    return <div className={'editor-wrapper'}>
        <div className={'menubar'}>
            {editorMenuCommand.markerMenu.length > 0 &&
                editorMenuCommand.markerMenu.filter(item => !item.hide).map((item, index) => {
                    return <MenuButton menuItemForm={item} key={index}
                        editorView={editorViewRef.current || undefined}
                        editorState={editorState || undefined}/>
                })
            }
            <span className={'split'}/>
            {editorMenuCommand.listMenu.length > 0 &&
                editorMenuCommand.listMenu.filter(item => !item.hide).map((item, index) => {
                    return <MenuButton menuItemForm={item} key={index}
                        editorView={editorViewRef.current || undefined}
                        editorState={editorState || undefined}/>
                })
            }

            <span className={'split'}/>
            {editorMenuCommand.insertMenu.length > 0 &&
                editorMenuCommand.insertMenu.filter(item => !item.hide).map((item, index) => {
                    return <MenuButton menuItemForm={item} key={index}
                        editorView={editorViewRef.current || undefined}
                        editorState={editorState || undefined}/>
                })
            }
            <div className={'menu-item'}><i className={'editor-icon-photo'}/></div>
            <span className={'split'}/>
            {editorMenuCommand.historyMenu.length > 0 &&
                editorMenuCommand.historyMenu.filter(item => !item.hide).map((item, index) => {
                    return <MenuButton menuItemForm={item} key={index}
                        editorView={editorViewRef.current || undefined}
                        editorState={editorState || undefined}/>
                })
            }
        </div>
        <div ref={editorRef} id={editorId}
            className={'editor'}
            style={{minHeight: `${160}px`, maxHeight: `${320}px`}}/>
    </div>
}
