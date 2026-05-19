type SubscriptionDisplayHistory = {
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

export const addDisplayedInvite = (inviteId: number) => {
    const history = sessionStorage.getItem('subscription_display_history')
    let displayHistory: SubscriptionDisplayHistory = {
        invites: []
    }
    if (history) {
        displayHistory = JSON.parse(history)
    }
    displayHistory.invites.push(inviteId)
    sessionStorage.setItem('subscription_display_history', JSON.stringify(displayHistory))
}

export const scrollToErrMsg = () => {
    setTimeout(() => {
        const errMsg = document.querySelector('.err-msg')
        if (errMsg) {
            errMsg.scrollIntoView({behavior: 'smooth', block: 'center'})
        }
    }, 300)
}