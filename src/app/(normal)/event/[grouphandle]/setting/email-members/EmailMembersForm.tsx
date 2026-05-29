'use client'

import {useState} from 'react'
import {sendEmailToGroupMembers} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {getAuth} from '@/utils'
import {Dictionary} from '@/lang'
import {Input} from '@/components/shadcn/Input'
import {Button} from '@/components/shadcn/Button'
import {useToast} from '@/components/shadcn/Toast/use-toast'

interface Props {
    groupId: number
    groupHandle: string
    memberCount: number
    lang: Dictionary
}

export default function EmailMembersForm({groupId, groupHandle, memberCount, lang}: Props) {
    const {toast} = useToast()
    const [subject, setSubject] = useState('')
    const [content, setContent] = useState('')
    const [testRecipient, setTestRecipient] = useState('')
    const [sending, setSending] = useState(false)

    const handleSend = async (isTestSend: boolean) => {
        if (!subject.trim()) {
            toast({description: 'Subject is required', variant: 'destructive'})
            return
        }
        if (!content.trim()) {
            toast({description: 'Content is required', variant: 'destructive'})
            return
        }
        if (isTestSend && !testRecipient.trim()) {
            toast({description: 'Test recipient email is required', variant: 'destructive'})
            return
        }

        setSending(true)
        try {
            const authToken = getAuth()
            const {sentCount, isTest} = await sendEmailToGroupMembers({
                params: {
                    groupId,
                    subject,
                    content,
                    authToken: authToken!,
                    testRecipient: isTestSend ? testRecipient.trim() : undefined
                },
                clientMode: CLIENT_MODE
            })
            if (isTest) {
                toast({description: `Test email sent to ${testRecipient}`, variant: 'success'})
            } else {
                toast({description: `Email sent to ${sentCount} members`, variant: 'success'})
                setSubject('')
                setContent('')
            }
        } catch (e: unknown) {
            toast({
                description: e instanceof Error ? e.message : 'Failed to send emails',
                variant: 'destructive'
            })
        } finally {
            setSending(false)
        }
    }

    return <div className="flex flex-col gap-4">
        <div className="text-sm text-gray-500">
            This email will be sent to all <span className="font-semibold text-gray-800">{memberCount}</span> members of this group who have an email address.
        </div>

        <div>
            <div className="text-sm font-semibold mb-1">Subject</div>
            <Input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Email subject"
                inputSize="md"
            />
        </div>

        <div>
            <div className="text-sm font-semibold mb-1">Content</div>
            <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write your message here… HTML is supported."
                rows={16}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <div className="text-xs text-gray-400 mt-1">HTML is supported. The content is rendered inside the email body.</div>
        </div>

        {content.trim() && (
            <div>
                <div className="text-sm font-semibold mb-1">Preview</div>
                <div
                    className="border border-gray-200 rounded-lg p-4 text-sm bg-white min-h-[120px]"
                    dangerouslySetInnerHTML={{__html: content}}
                />
            </div>
        )}

        <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col gap-3">
            <div className="text-sm font-semibold">Send test email</div>
            <div className="flex gap-2">
                <Input
                    value={testRecipient}
                    onChange={e => setTestRecipient(e.target.value)}
                    placeholder="test@example.com"
                    inputSize="md"
                    type="email"
                    className="flex-1"
                />
                <Button
                    variant="secondary"
                    disabled={sending || !subject.trim() || !content.trim() || !testRecipient.trim()}
                    onClick={() => handleSend(true)}>
                    {sending ? 'Sending…' : 'Send test'}
                </Button>
            </div>
        </div>

        <div className="flex gap-3 justify-end">
            <a href={`/event/${groupHandle}/setting`}
               className="h-10 px-4 rounded-lg border border-gray-200 text-sm flex items-center hover:bg-gray-50">
                Cancel
            </a>
            <Button
                variant="special"
                disabled={sending || !subject.trim() || !content.trim()}
                onClick={() => handleSend(false)}>
                {sending ? 'Sending…' : `Send to ${memberCount} members`}
            </Button>
        </div>
    </div>
}
