import {awaitProps, AsyncProps} from '@/utils'
import EditProfileData, {EditProfileDataProps} from '@/app/(normal)/profile/[handle]/edit/data'
import {selectLang} from '@/app/actions'
import WithdrawalsManager from './WithdrawalsManager'

export const fetchCache = 'force-no-store'

export async function generateMetadata(props: AsyncProps<EditProfileDataProps>) {
    const profile = await EditProfileData(await awaitProps(props))
    return {
        title: `${profile.nickname || profile.name} | Withdrawals | Social Layer`
    }
}

export default async function ProfileWithdrawals(props: AsyncProps<EditProfileDataProps>) {
    // Loaded only to redirect if the handle is bad and to title the page —
    // the actual withdrawal data is always the signed-in caller's own
    // (/withdrawals scopes to current_user regardless of whose profile this
    // route is nested under), same as StripeKeysManager.
    await EditProfileData(await awaitProps(props))
    const {lang} = await selectLang()

    return <WithdrawalsManager lang={lang}/>
}
