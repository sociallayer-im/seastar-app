import {selectLang} from '@/app/actions'
import {getPopupCities} from '@sola/sdk'
import Image from 'next/image'
import Avatar from '@/components/Avatar'
import {displayProfileName} from '@/utils'
import DisplayDateTime from '@/components/client/DisplayDateTime'
import {CLIENT_MODE} from '@/app/config'

export default async function PopupCityListPage() {
    const {lang} = await selectLang()
    const popupCities = await getPopupCities({clientMode: CLIENT_MODE})

    return <div className="page-width min-h-[100svh] pt-0 sm:pt-6 !pb-16">
        <h2 className="text-2xl font-semibold mb-3 md:flex-row flex items-center justify-between flex-col">
            {lang['Pop-up Cities']}
        </h2>

        <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-2">
            {popupCities.map((popupCity, index) => {
                return <a key={index} href={`/event/${popupCity.group.handle}`}
                          className="h-[292px] rounded shadow p-3 duration-200 hover:translate-y-[-6px]">
                    <div className="rounded h-[148px] mb-3">
                        <Image className="object-cover w-full h-full rounded"
                               width={227} height={148}
                               src={popupCity.image_url!} alt=""/>
                    </div>
                    <div className="webkit-box-clamp-1 text-xs">
                        <DisplayDateTime format={'MMM DD'}
                                         dataTimeStr={popupCity.start_date!} />
                        <span className="mx-1">-</span>
                        <DisplayDateTime format={'MMM DD'} dataTimeStr={popupCity.end_date!} />
                    </div>
                    <div className="webkit-box-clamp-2 text-lg font-semibold leading-5 h-10 mb-4">
                        {popupCity.title}
                    </div>

                    <div className="flex items-end flex-row justify-between">
                        <div className="flex-1">
                            <div className="flex-row-item-center text-xs">
                                <i className={'uil-location-point mr-0.5'}></i>
                                <div className="webkit-box-clamp-1">{popupCity.location}</div>
                            </div>
                            <div className="flex-row-item-center text-xs">
                                <Avatar profile={popupCity.group} size={14} className="mr-0.5"/>
                                <div className="webkit-box-clamp-1">by {displayProfileName(popupCity.group)}</div>
                            </div>
                        </div>
                        <div
                            className="hidden sm:block whitespace-nowrap text-xs bg-primary py-1.5 px-2 rounded font-semibold ml-1">
                            {lang['View events']}
                        </div>
                    </div>
                </a>
            })
            }
        </div>
    </div>
}
