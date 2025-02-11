'use client'

import {Dictionary} from '@/lang'
import {CommentItemType, createComment, getCommentsByItemIdAndType, ProfileDetail, Comment} from '@sola/sdk'
import {Textarea} from '@/components/shadcn/Textarea'
import NoData from '@/components/NoData'
import Avatar from '@/components/Avatar'
import {useEffect, useState} from 'react'
import {Button} from '@/components/shadcn/Button'
import {clientToSignIn, displayProfileName, getAuth} from '@/utils'
import {CLIENT_MODE} from '@/app/config'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import DisplayDateTime from '@/components/client/DisplayDateTime'

export interface CommentPanelProps {
    lang: Dictionary
    currProfile: ProfileDetail | null
    itemType: CommentItemType
    itemId: number
}

export default function CommentPanel({lang, currProfile, itemType, itemId}: CommentPanelProps) {
    const [content, setContent] = useState('')
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)

    const {toast} = useToast()


    const handleSendComment = async () => {
        if (!content) {
            return
        }

        setSending(true)
        try {
            const authToken = getAuth()
            await createComment({
                params: {
                    content,
                    itemType,
                    itemId,
                    comment_type: 'comment',
                    authToken: authToken!,
                },
                clientMode: CLIENT_MODE
            })

            setContent('')
            toast({
                title: lang['Comment sent'],
                variant: 'success',
            })
        } catch (e: unknown) {
            console.error(e)
            toast({
                title: e instanceof Error ? e.message : 'Failed to send comment',
                variant: 'destructive',
            })
        } finally {
            setSending(false)
        }
    }

    const getComments = async () => {
        const comments = await getCommentsByItemIdAndType({
            params: {
                itemId,
                itemType,
            },
            clientMode: CLIENT_MODE
        })
        setComments(comments)
        setLoading(false)
    }

    useEffect(() => {
        getComments()

        const interval = window.setInterval(getComments, 5000)

        return () => {
            window.clearInterval(interval)
        }
    }, [])

    return <div>
        <div className="flex flex-row  w-full !items-start">
            {currProfile ? <Avatar profile={currProfile} size={36} className="mr-2"/>
                : <img className="w-9 h-9 rounded-full mr-2"
                       src="/images/default_avatar/avatar_1.png" alt=""/>
            }

            <div className="flex-1 bg-secondary rounded-lg p-2">
                <Textarea
                    className="flex-1 min-h-[60px] outline-none !border-0"
                    placeholder={lang['Input comment']}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                />
                <div className="flex-row-item-center justify-end">
                    {!currProfile
                        ? <Button variant={'normal'} size={'xs'}
                                  className="text-xs mt-2"
                                  onClick={() => {
                                      clientToSignIn()
                                  }}>{lang['Sign in to send a comment']}</Button>
                        : <Button variant={'normal'} size={'xs'}
                                  className="text-xs mt-2"
                                  disabled={sending}
                                  onClick={handleSendComment}>
                            <i className="uil-message"/> {lang['Send a Comment']}
                        </Button>
                    }
                </div>
            </div>
        </div>
        <div className="grid grid-cols-1 gap-8 mt-8 w-full">
            {comments.map((comment, index) => {
                return <div key={index} className='w-full'>
                    <div className="flex-row-item-center  text-sm">
                        <Avatar profile={comment.profile} size={28} className="mr-2"/>
                       <span className="font-semibold">{displayProfileName(comment.profile)}</span>

                        <div className="ml-2 text-xs"><DisplayDateTime
                            dataTimeStr={comment.created_at}/></div>
                    </div>
                    <div className="ml-9 mt-1">{comment.content}</div>
                </div>
            })}

        </div>
        {loading && <div className="my-4">
            <div className="loading-bg w-full h-4 mb-3 rounded-lg"/>
            <div className="loading-bg w-1/2 h-4 mb-3 rounded-lg"/>
            <div className="loading-bg w-full h-4 mb-3 rounded-lg"/>
            <div className="loading-bg w-1/2 h-4 mb-3 rounded-lg"/>
        </div>}

        {!comments.length && !loading &&
            <NoData/>
        }
    </div>
}