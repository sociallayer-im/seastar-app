import GroupEventSettingData, { GroupEventSettingDataProps } from "@/app/(normal)/event/[grouphandle]/setting/data"
import { selectLang } from "@/app/actions"
import ExportEventParticipantBtn from "@/components/client/ExportEventParticipantBtn"
import ExportGroupEventBtn from "@/components/client/ExportGroupEventBtn"
import AdminNotificationToggle from "@/components/client/AdminNotificationToggle"
import { buttonVariants } from "@/components/shadcn/Button"

export default async function GroupEventSettingPage(props: GroupEventSettingDataProps) {
    const { groupDetail, currProfile, venues, tracks } = await GroupEventSettingData(props)
    const { lang } = await selectLang()

    const currMembership = currProfile
        ? groupDetail.memberships.find(m => m.user.id === currProfile.id)
        : undefined
    const isManagerOrOwner = currMembership?.role === 'manager' || currMembership?.role === 'owner'

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width-md min-h-[calc(100svh-48px)] px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Group Event Setting']}</div>
            <div className="flex flex-col max-w-[800px] mx-auto">
                <a href={`/event/${groupDetail.name}/venues`}
                    className={`${buttonVariants({ variant: 'secondary' })} w-full mb-3`}>
                    <div className="flex-row-item-center w-full justify-between">
                        <div>{lang['Venues']}</div>
                        <div className="font-normal flex-row-item-center">
                            <div>{venues.length}</div>
                            <i className="uil-arrow-right text-2xl" />
                        </div>
                    </div>
                </a>

                <a href={`/event/${groupDetail.name}/tracks`}
                    className={`${buttonVariants({ variant: 'secondary' })} w-full mb-3`}>
                    <div className="flex-row-item-center w-full justify-between">
                        <div>{lang['Event Programs']}</div>
                        <div className="font-normal flex-row-item-center">
                            <div>{tracks.length}</div>
                            <i className="uil-arrow-right text-2xl" />
                        </div>
                    </div>
                </a>

                <a href={`/event/${groupDetail.name}/popup-city`}
                    className={`${buttonVariants({ variant: 'secondary' })} w-full mb-3`}>
                    <div className="flex-row-item-center w-full justify-between">
                        <div>{lang['Pop-up Cities']}</div>
                        <div className="font-normal flex-row-item-center">
                            <div>{groupDetail.start_date ? lang['Enabled'] : lang['Not set']}</div>
                            <i className="uil-arrow-right text-2xl" />
                        </div>
                    </div>
                </a>

                <a href={`/event/${groupDetail.name}/tags`}
                    className={`${buttonVariants({ variant: 'secondary' })} w-full mb-3`}>
                    <div className="flex-row-item-center w-full justify-between">
                        <div>{lang['Tags']}</div>
                        <div className="font-normal flex-row-item-center">
                            <div>{groupDetail.event_tag_list?.length || 0}</div>
                            <i className="uil-arrow-right text-2xl" />
                        </div>
                    </div>
                </a>

                <a href={`/event/${groupDetail.name}/timezone`}
                    className={`${buttonVariants({ variant: 'secondary' })} w-full mb-3`}>
                    <div className="flex-row-item-center w-full justify-between">
                        <div>{lang['Timezone']}</div>
                        <div className="font-normal flex-row-item-center">
                            <div>{groupDetail.timezone || 'UTC'}</div>
                            <i className="uil-arrow-right text-2xl" />
                        </div>
                    </div>
                </a>

                <a href={`/event/${groupDetail.name}/banner`}
                    className={`${buttonVariants({ variant: 'secondary' })} w-full mb-3`}>
                    <div className="flex-row-item-center w-full justify-between">
                        <div>{lang['Banner']}</div>
                        <div className="font-normal flex-row-item-center">
                            <i className="uil-arrow-right text-2xl" />
                        </div>
                    </div>
                </a>

                <a href={`/event/${groupDetail.name}/permission`}
                    className={`${buttonVariants({ variant: 'secondary' })} w-full mb-3`}>
                    <div className="flex-row-item-center w-full justify-between">
                        <div>{lang['Event Permission']}</div>
                        <div className="font-normal flex-row-item-center">
                            <i className="uil-arrow-right text-2xl" />
                        </div>
                    </div>
                </a>

                {isManagerOrOwner && <a href={`/event/${groupDetail.name}/setting/email-members`}
                    className={`${buttonVariants({ variant: 'secondary' })} w-full mb-3`}>
                    <div className="flex-row-item-center w-full justify-between">
                        <div>Email Members</div>
                        <div className="font-normal flex-row-item-center">
                            <div>{groupDetail.memberships?.length ?? 0} members</div>
                            <i className="uil-arrow-right text-2xl" />
                        </div>
                    </div>
                </a>}

                <div className="flex sm:flex-row flex-col items-center justify-end gap-3">
                    <ExportGroupEventBtn lang={lang} groupId={groupDetail.id} />
                    <ExportEventParticipantBtn lang={lang} groupId={groupDetail.id} />
                    <a href={`https://dashboard.sola.day/event/${groupDetail.name}`}
                        className={`${buttonVariants({ variant: 'secondary' })} w-full`}>
                        <div className="flex-row-item-center w-full justify-between">
                            <div>Dashboard</div>
                            <div className="font-normal flex-row-item-center">
                                <i className="uil-arrow-right text-2xl" />
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </div>
}