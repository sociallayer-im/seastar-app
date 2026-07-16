'use client'

import { PopupCity } from '@sola/sdk'
import { Dictionary } from '@/lang'

interface ManagActionsProps {
    popupCity: PopupCity
    lang: Dictionary
}

// Popup-city admin actions (set :top/:featured tags, delete) relied on sails
// admin-only endpoints that soon does not expose. The feature was dropped in
// the backend migration; this stays a null component so imports keep compiling.
const ManagActions = (_props: ManagActionsProps) => {
    return null
}

export default ManagActions
