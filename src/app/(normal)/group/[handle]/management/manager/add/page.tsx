import GroupPageData, {GroupDataProps} from '@/app/(normal)/group/[handle]/data'
import {selectLang} from '@/app/actions'
import AddManagerForm from '@/app/(normal)/group/[handle]/management/manager/add/AddManagerForm'

export default async function AddManagerPage({params:{handle}}: GroupDataProps) {
    const {members, group} = await GroupPageData(handle)
    const {lang} = await selectLang()

    const memberList = members.filter(m => m.role === 'member')
    return <AddManagerForm lang={lang} members={memberList} group={group} />
}