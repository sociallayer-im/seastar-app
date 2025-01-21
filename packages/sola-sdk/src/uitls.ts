import {getProfileByHandlesOrAddresses} from './profile'

export const checkAndGetProfileByHandlesOrAddresses = async (handlesOrAddresses: string[]) => {
    const {handleResult, addressResult} = await getProfileByHandlesOrAddresses(handlesOrAddresses)
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