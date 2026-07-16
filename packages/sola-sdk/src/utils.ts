import {requestOrNull} from './request'
import {ProfileDetail} from './profile'
import {CLIENT_MODE} from '@/app/config'

/**
 * Resolve a list of usernames to profiles, throwing if any is unknown.
 * (soon has no batch endpoint — names resolve individually via /users/:name.
 * Emails/addresses can't be looked up publicly and are skipped here; the
 * invite endpoint itself reports per-receiver results for those.)
 */
export const checkAndGetProfileByNames = async (names: string[]) => {
    const profiles = await Promise.all(
        names.map(name => requestOrNull<ProfileDetail>(`/users/${encodeURIComponent(name)}`, {clientMode: CLIENT_MODE}))
    )

    const nameResult: ProfileDetail[] = []
    names.forEach((name, index) => {
        const profile = profiles[index]
        if (!profile) {
            throw new Error(`Profile [${name}] not found`)
        }
        nameResult.push(profile)
    })

    return {nameResult}
}
