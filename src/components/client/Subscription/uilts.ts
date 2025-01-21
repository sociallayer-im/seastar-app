type SubscriptionDisplayHistory = {
    vouchers: number[]
    invites: number[]
}


export const newInviteDisplayed = (inviteId: number) => {
    const history = sessionStorage.getItem('subscription_display_history')
    if (!history) {
        return false
    }

    const displayHistory: SubscriptionDisplayHistory = JSON.parse(history)
    return displayHistory.invites.includes(inviteId)
}

export const newVoucherDisplayed = (voucherId: number) => {
    const history = sessionStorage.getItem('subscription_display_history')
    if (!history) {
        return false
    }

    const displayHistory: SubscriptionDisplayHistory = JSON.parse(history)
    return displayHistory.vouchers.includes(voucherId)
}

export const addDisplayedInvite = (inviteId: number) => {
    let history = sessionStorage.getItem('subscription_display_history')
    let displayHistory: SubscriptionDisplayHistory = {
        vouchers: [],
        invites: []
    }
    if (history) {
        displayHistory = JSON.parse(history)
    }
    displayHistory.invites.push(inviteId)
    sessionStorage.setItem('subscription_display_history', JSON.stringify(displayHistory))
}

export const addDisplayedVoucher = (voucherId: number) => {
    let history = sessionStorage.getItem('subscription_display_history')
    let displayHistory: SubscriptionDisplayHistory = {
        vouchers: [],
        invites: []
    }
    if (history) {
        displayHistory = JSON.parse(history)
    }
    displayHistory.vouchers.push(voucherId)
    sessionStorage.setItem('subscription_display_history', JSON.stringify(displayHistory))
}