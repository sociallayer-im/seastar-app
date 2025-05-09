import GroupEventSettingData, {GroupEventSettingDataProps} from "@/app/(normal)/event/[grouphandle]/setting/data"
import {selectLang} from "@/app/actions"
import {buttonVariants} from "@/components/shadcn/Button"

export default async function GroupEventSettingPage(props: GroupEventSettingDataProps) {
    const {groupDetail, venues, tracks, popupCities} = await GroupEventSettingData(props)
    const {lang} = await selectLang()

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width-md min-h-[calc(100svh-48px)] px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Group Event Setting']}</div>
            <div className="flex flex-col max-w-[800px] mx-auto">
                <a href={`/event/${groupDetail.handle}/venues`}
                    className={`${buttonVariants({variant: 'secondary'})} w-full mb-3`}>
                    <div className="flex-row-item-center w-full justify-between">
                        <div>{lang['Venues']}</div>
                        <div className="font-normal flex-row-item-center">
                            <div>{venues.length}</div>
                            <i className="uil-arrow-right text-2xl"/>
                        </div>
                    </div>
                </a>

                <a href={`/event/${groupDetail.handle}/tracks`}
                    className={`${buttonVariants({variant: 'secondary'})} w-full mb-3`}>
                    <div className="flex-row-item-center w-full justify-between">
                        <div>{lang['Event Programs']}</div>
                        <div className="font-normal flex-row-item-center">
                            <div>{tracks.length}</div>
                            <i className="uil-arrow-right text-2xl"/>
                        </div>
                    </div>
                </a>

                <a href={`/event/${groupDetail.handle}/popup-city`}
                   className={`${buttonVariants({variant: 'secondary'})} w-full mb-3`}>
                    <div className="flex-row-item-center w-full justify-between">
                        <div>{lang['Pop-up Cities']}</div>
                        <div className="font-normal flex-row-item-center">
                            <div>{popupCities.length}</div>
                            <i className="uil-arrow-right text-2xl"/>
                        </div>
                    </div>
                </a>

                <a href={`/event/${groupDetail.handle}/tags`}
                    className={`${buttonVariants({variant: 'secondary'})} w-full mb-3`}>
                    <div className="flex-row-item-center w-full justify-between">
                        <div>{lang['Tags']}</div>
                        <div className="font-normal flex-row-item-center">
                            <div>{groupDetail.event_tags?.length || 0}</div>
                            <i className="uil-arrow-right text-2xl"/>
                        </div>
                    </div>
                </a>

                <a href={`/event/${groupDetail.handle}/timezone`}
                    className={`${buttonVariants({variant: 'secondary'})} w-full mb-3`}>
                    <div className="flex-row-item-center w-full justify-between">
                        <div>{lang['Timezone']}</div>
                        <div className="font-normal flex-row-item-center">
                            <div>{groupDetail.timezone || 'UTC'}</div>
                            <i className="uil-arrow-right text-2xl"/>
                        </div>
                    </div>
                </a>

                <a href={`/event/${groupDetail.handle}/banner`}
                    className={`${buttonVariants({variant: 'secondary'})} w-full mb-3`}>
                    <div className="flex-row-item-center w-full justify-between">
                        <div>{lang['Banner']}</div>
                        <div className="font-normal flex-row-item-center">
                            <i className="uil-arrow-right text-2xl"/>
                        </div>
                    </div>
                </a>

                <a href={`/event/${groupDetail.handle}/permission`}
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