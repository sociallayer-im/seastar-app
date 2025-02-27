import GroupEventSettingData, {GroupEventSettingDataProps} from '@/app/(normal)/event/[grouphandle]/setting/data'
import NoData from '@/components/NoData'
import {buttonVariants} from '@/components/shadcn/Button'
import {selectLang} from '@/app/actions'

export default async function GroupPopupCityList(props: GroupEventSettingDataProps) {
    const {popupCities, groupDetail} = await GroupEventSettingData(props)
    const {lang} = await selectLang()

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width-md min-h-[calc(100svh-48px)] px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Pop-up Cities']}</div>
            {!popupCities?.length && <NoData/>}
            <div className="grid grid-cols-1 gap-3">
                {
                    popupCities?.map((popupCity, index) => {
                        return <div key={index} className="flex-row-item-center w-full">
                            <a href={`/event/${groupDetail.handle}/popup-city/edit/${popupCity.id}`}
                               className={`${buttonVariants({variant: 'secondary'})} flex-1 mr-3 justify-between`}>
                                <div className="font-normal">{popupCity.title}</div>
                                <i className="uil-edit-alt"/>
                            </a>
                        </div>
                    })
                }
            </div>

            <a href={`/popup-city/create`} className={`${buttonVariants({variant: 'secondary'})} mt-3`}>
                <i className="uil-plus-circle text-lg"/>
                {lang['Create Popup-City']}
            </a>
        </div>
    </div>
}