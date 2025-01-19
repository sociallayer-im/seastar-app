import {InviteDetail} from '@sola/sdk'
import {Dictionary} from '@/lang'

export default function DialogInviteDetail({inviteDetail, lang}: { inviteDetail: InviteDetail, lang: Dictionary }) {
    return <div className="max-w-[90vw] w-full bg-background rounded-lg shadow p-3">
        <div>{lang['Invite Detail']}</div>
    </div>
}