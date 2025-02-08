import {getProfileByHandlesOrAddresses} from './profile'
import {CLIENT_MODE} from '@/app/config'
import {VenueTimeslot, Weekday} from './group'

export const checkAndGetProfileByHandlesOrAddresses = async (handlesOrAddresses: string[]) => {
    const {handleResult, addressResult} = await getProfileByHandlesOrAddresses({
        params: {handlesOrAddresses},
        clientMode: CLIENT_MODE
    })
    handlesOrAddresses.forEach((item, index) => {
        const hasHandleProfile = handleResult.some(h => h.handle === item)
        if (!hasHandleProfile) {
            const hasAddressProfile = addressResult.some(a => a.address === item)
            if (!hasAddressProfile) {
                throw new Error(`Profile [${item}] not found`)
            }
        }
    })

    return {handleResult, addressResult}
}

const NeedToFixFields = ['created_at', 'start_time', 'end_time', 'start_at', ''] as const
type FieldsToFix = typeof NeedToFixFields[number]
export type NeedToFixObject = Partial<Record<FieldsToFix, string>>


export function fixDate(target: NeedToFixObject):NeedToFixObject{
    NeedToFixFields.forEach((field) => {
        if (field in target && typeof target[field] === 'string' && !target[field].endsWith('Z')) {
            target[field] = target[field] + 'Z'
        }
    })

    return target
}
