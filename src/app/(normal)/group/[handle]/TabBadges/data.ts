import {getBadgeClassAndInviteByHandle, setSdkConfig, ClientMode} from '@sola/sdk'
import * as process from 'node:process'

export type SampleInvite = Pick<Solar.Invite, 'id' | 'role' | 'group' >

setSdkConfig({clientMode: process.env.NEXT_PUBLIC_CLIENT_MODE! as ClientMode})

export default async function GroupBadgeData(handle: string) {
    return await getBadgeClassAndInviteByHandle(handle)
}
