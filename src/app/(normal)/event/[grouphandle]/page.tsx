import GroupEventHome from '@/app/(normal)/event/[grouphandle]/GroupEventHome'
import {GroupEventHomeDataProps} from '@/app/(normal)/event/[grouphandle]/data'

export default async function EventHome(props: GroupEventHomeDataProps) {
    return <GroupEventHome {...props} />
}
