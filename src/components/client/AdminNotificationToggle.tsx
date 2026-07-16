'use client'

// soon has no admin-notification preference on groups — the feature was
// removed with the backend migration. Kept as a null component so existing
// imports keep compiling; delete alongside its call sites when convenient.
export interface AdminNotificationToggleProps {
    groupId: string,
    currentValue: boolean,
}

export default function AdminNotificationToggle(_props: AdminNotificationToggleProps) {
    return null
}
