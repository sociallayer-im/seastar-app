import {MemberShipSample} from "@/app/(normal)/group/[handle]/edit/data"
import {Dictionary} from "@/lang"
import {getAvatar} from "@/utils"

export interface ManagerManagementFormProps {
    members: MemberShipSample[],
    group: Solar.Group,
    lang: Dictionary
}



export default function ManagerManagementForm({lang, members}: ManagerManagementFormProps) {
    const managers = members.filter(member => member.role === 'manager')

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width h-[calc(100svh-48px)] px-3 pb-12 pt-0 flex flex-col">
            <div className="py-6 font-semibold text-center text-xl">{lang['Manager Management']}</div>

            <div
                className="flex flex-row w-full max-w-[800px] mx-auto mb-3 rounded-lg bg-amber-50 p-2 text-sm text-amber-400">
                <i className="uil-info-circle mr-2 text-3xl"/>
                <div>
                    <div className="font-semibold">The group manager has the following permissions:</div>
                    <div>1. Send the created badge to others</div>
                    <div>2. Manage the badge of group</div>
                    <div>3. Edit the group profile</div>
                    <div>4. Remove group member</div>
                </div>
            </div>

            <div className="w-full max-w-[800px] mx-auto">
                <div
                    className="mb-3 justify-between cursor-pointer flex-row-item-center shadow rounded-lg px-6 h-[60px] duration-300 hover:bg-secondary">
                    <div className="flex-row-item-center">
                        <i className="uil-plus-circle text-3xl mr-2 text-green-500" />
                        <div className="font-semibold">Add a manager</div>
                    </div>
                </div>
                {managers.map((member, i) => {
                    return <div key={i}
                        className="mb-3 justify-between cursor-pointer flex-row-item-center shadow rounded-lg px-6 h-[60px] duration-300 hover:bg-secondary">
                        <div className="flex-row-item-center">
                            <img
                                className="w-7 h-7 rounded-full mr-2"
                                src={getAvatar(member.profile.id, member.profile.image_url)} alt=""/>
                            <div>{member.profile.nickname || member.profile.handle}</div>
                        </div>
                        <i className="uil-minus-circle text-2xl text-gray-500"></i>
                    </div>
                })
                }
            </div>
        </div>
    </div>
}