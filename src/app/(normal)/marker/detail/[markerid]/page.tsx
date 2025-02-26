import MarkerDetailData, {MarkerDetailPageDataProps} from '@/app/(normal)/marker/detail/[markerid]/data'
import {Badge} from '@/components/shadcn/Badge'
import Avatar from '@/components/Avatar'
import {displayProfileName} from '@/utils'
import {selectLang} from '@/app/actions'
import NoData from '@/components/NoData'
import RichTextDisplayer from '@/components/client/Editor/Displayer'

export default async function MarkerDetailPage(props: MarkerDetailPageDataProps) {
    const {markerDetail, currProfile, currProfileIsCreator} = await MarkerDetailData(props)
    const {lang} = await selectLang()

    return <div className="page-width !pt-4 !pb-12">
        <div className="flex flex-row items-center justify-between sm:mb-8 mb-4">
            <a href={`/map/${markerDetail.group.handle}/marker`} className="flex-row-item-center">
                <Avatar size={24} profile={markerDetail.group!} className="mr-1"/>
                <span
                    className="font-semibold font-sm overflow-hidden overflow-ellipsis whitespace-nowrap max-w-[120px] sm:max-w-max">
                    {displayProfileName(markerDetail.group!)}
                </span>
            </a>
            <div className="flex-row-item-center">
                {currProfileIsCreator &&
                    <a href={`/marker/edit/${markerDetail.id}`}
                       className="cursor-pointer hover:bg-gray-300 flex-row-item-center ml-4 h-8 font-semibold text-base bg-gray-200 rounded-lg px-2">
                        <i className="uil-edit-alt mr-1"></i>
                        <span>{lang['Edit']}</span>
                    </a>}
            </div>
        </div>


        <div className="flex flex-col sm:flex-row">
            <div className="min-w-[324px] sm:max-w-[324px] mb-8 order-1 sm:order-2 sm:mb-0">
                {!!markerDetail.cover_image_url ?
                    <img className="max-w-[450px] w-full mx-auto"
                         src={markerDetail.cover_image_url} alt=""/>

                    : <div className="w-[350px] h-[350px] mx-auto bg-secondary flex-row-item-center justify-center">
                        <i className="uil-location-pin-alt text-gray-300 text-[200px]"/>
                    </div>
                }
            </div>


            <div className="flex-1 sm:mr-9 order-2 sm:order-1">
                <div className="text-4xl font-semibold w-full">
                    {markerDetail.title}
                </div>

                <div className="flex-row-item-center my-3">
                    <Badge variant='upcoming' className="mr-1">{lang['Marker']}</Badge>
                    {!!markerDetail.category && <Badge variant='secondary' className="mr-1">{markerDetail.category}</Badge> }
                </div>

                <div className="my-4 border-t-[1px] border-b-[1px] border-gray-300">
                    <div className="hide-scroll whitespace-nowrap overflow-auto">
                        <a
                            className="my-3 shrink-0 grow-0 inline-flex flex-row items-center mr-6 overflow-auto"
                            href={`/profile/${markerDetail.owner!.handle}`}>
                            <Avatar profile={markerDetail.owner!} size={44} className="mr-2"/>
                            <div>
                                <div className="font-semibold text-sm text-nowrap">
                                    {displayProfileName(markerDetail.owner)}
                                </div>
                                <div className="text-xs text-gray-400">{lang['Creator']}</div>
                            </div>
                        </a>
                    </div>
                </div>

                <div>
                    {!!markerDetail.location &&
                        <div className="flex-row-item-center py-4">
                            <div
                                className="mr-2 flex-shrink-0 w-9 h-9 flex flex-row items-center justify-center border border-gray-300 rounded-lg">
                                <i className="uil-location-point text-base"></i>
                            </div>
                            <div>
                                <div className="font-semibold text-base">{markerDetail.location}</div>
                                <div className="text-gray-400 text-base">
                                    {markerDetail.formatted_address}
                                    <i className="cursor-pointer uil-copy ml-1 text-lg text-foreground"/>
                                </div>
                            </div>
                        </div>
                    }
                </div>

                {!!markerDetail.link &&
                    <div className="flex-row-item-center py-4">
                        <div
                            className="mr-2 w-9 h-9 flex flex-row items-center justify-center border border-gray-300 rounded-lg">
                            <i className="uil-link text-base"></i>
                        </div>
                        <div>
                            <div className="font-semibold text-base">Link</div>
                            <a className="text-gray-400 text-base hover:text-blue-500 hover:underline" target={'_blank' }
                               href={markerDetail.link}>
                                {markerDetail.link}
                                <i className="uil-arrow-up-right" />
                            </a>
                        </div>
                    </div>
                }

                <div className="flex-row-item-center font-semibold mt-6">
                    <div
                       className="text-center text-sm sm:text-base py-1 px-2 sm:mr-3 relative">
                        <span className="z-10">Content</span>
                        <img width={90} height={12}
                             className="w-[80px]  absolute left-2/4 bottom-0 ml-[-40px]"
                             src="/images/tab_bg.png" alt=""/>
                    </div>
                </div>

                <div>
                    {!markerDetail.about && <NoData/>}
                    <div className="editor-wrapper display py-3">
                        <RichTextDisplayer markdownStr={markerDetail.about || ''}/>
                    </div>
                </div>
            </div>


        </div>
    </div>
}