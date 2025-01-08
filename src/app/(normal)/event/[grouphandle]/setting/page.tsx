import GroupEventSettingData, {GroupEventSettingDataProps} from "@/app/(normal)/event/[grouphandle]/setting/data"
import {selectLang} from "@/app/actions"
import {buttonVariants} from "@/components/shadcn/Button"

export default async function GroupEventSettingPage(props: GroupEventSettingDataProps) {
    const {group, venues, tracks} = await GroupEventSettingData(props)
    const {lang} = await selectLang()

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width-md min-h-[calc(100svh-48px)] px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Group Event Setting']}</div>
            <div className="flex flex-col max-w-[800px] mx-auto">
                <a href={`/event/${group.handle}/venues`}
                    className={`${buttonVariants({variant: 'secondary'})} w-full mb-3`}>
                    <div className="flex-row-item-center w-full justify-between">
                        <div>{lang['Venues']}</div>
                        <div className="font-normal flex-row-item-center">
                            <div>{venues.length}</div>
                            <i className="uil-arrow-right text-2xl"/>
                        </div>
                    </div>
                </a>

                <a href={`/event/${group.handle}/tracks`}
                    className={`${buttonVariants({variant: 'secondary'})} w-full mb-3`}>
                    <div className="flex-row-item-center w-full justify-between">
                        <div>{lang['Tracks']}</div>
                        <div className="font-normal flex-row-item-center">
                            <div>{tracks.length}</div>
                            <i className="uil-arrow-right text-2xl"/>
                        </div>
                    </div>
                </a>

                <a href={`/event/${group.handle}/tags`}
                    className={`${buttonVariants({variant: 'secondary'})} w-full mb-3`}>
                    <div className="flex-row-item-center w-full justify-between">
                        <div>{lang['Tags']}</div>
                        <div className="font-normal flex-row-item-center">
                            <div>{group.event_tags?.length || 0}</div>
                            <i className="uil-arrow-right text-2xl"/>
                        </div>
                    </div>
                </a>

                <a href={`/event/${group.handle}/timezone`}
                    className={`${buttonVariants({variant: 'secondary'})} w-full mb-3`}>
                    <div className="flex-row-item-center w-full justify-between">
                        <div>{lang['Timezone']}</div>
                        <div className="font-normal flex-row-item-center">
                            <div>{group.timezone || 'UTC'}</div>
                            <i className="uil-arrow-right text-2xl"/>
                        </div>
                    </div>
                </a>

                <a href={`/event/${group.handle}/banner`}
                    className={`${buttonVariants({variant: 'secondary'})} w-full mb-3`}>
                    <div className="flex-row-item-center w-full justify-between">
                        <div>{lang['Banner']}</div>
                        <div className="font-normal flex-row-item-center">
                            <i className="uil-arrow-right text-2xl"/>
                        </div>
                    </div>
                </a>

                <a href={`/event/${group.handle}/permission`}
                    className={`${buttonVariants({variant: 'secondary'})} w-full mb-3`}>
                    <div className="flex-row-item-center w-full justify-between">
                        <div>{lang['Event Permission']}</div>
                        <div className="font-normal flex-row-item-center">
                            <i className="uil-arrow-right text-2xl"/>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    </div>
}