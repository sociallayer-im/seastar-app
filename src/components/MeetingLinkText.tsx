import {parseMeetingLink} from '@/utils'
import {Dictionary} from '@/lang'

/**
 * Renders event.meeting_url as a clickable link, wherever it's shown.
 *
 * meeting_url is free text — some organizers paste the entire "邀请您参加
 * 腾讯会议..." invite block rather than just the join URL. Rendering that
 * raw, as every call site used to, produced unclickable multi-line text;
 * parseMeetingLink pulls the actual URL (and, for Tencent Meeting, the
 * dial-in code) out of whatever was pasted.
 */
export default function MeetingLinkText({meetingUrl, lang, className}: {
    meetingUrl: string | null | undefined
    lang: Dictionary
    className?: string
}) {
    const parsed = parseMeetingLink(meetingUrl)
    if (!parsed) return null

    const label = parsed.isTencentMeeting
        ? (parsed.meetingCode ? `${lang['Tencent Meeting']} ${parsed.meetingCode}` : lang['Tencent Meeting'])
        : parsed.displayText

    return <a href={parsed.href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
    </a>
}
