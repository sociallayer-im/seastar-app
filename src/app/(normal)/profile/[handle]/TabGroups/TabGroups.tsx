import CardGroup from "@/components/CardGroup"
import {UserGroupListData} from "@/app/(normal)/profile/[handle]/TabGroups/data"
import {selectLang} from "@/app/actions"
import {Profile} from '@sola/sdk'

export default async function TabGroups(props: { profile: Profile}) {
    const groups = await UserGroupListData(props.profile.handle)
    const lang = (await selectLang()).lang

    return <div className="py-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <a href="/group/create"
            className="h-[210px] bg-white rounded-2xl shadow p-4 cursor-pointer flex flex-col items-center justify-center duration-200 hover:translate-y-[-6px]">
            <div
                className="mb-2 flex flex-row justify-center items-center w-[64px] h-[64px] bg-gray-100 rounded-full">
                <i className="uil-plus text-3xl" />
            </div>
            <div className="font-semibold text-center">{lang['Create a Group']}</div>
        </a>


        {groups.map((group, i) => {
            return <CardGroup key={i} group={group} currProfileHandle={props.profile.handle}/>
        })}
    </div>
}
