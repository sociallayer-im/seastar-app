import EventDetailPage, {EventDetailDataProps} from '@/app/(normal)/event/detail/[eventid]/data'
import {selectLang} from '@/app/actions'
import DisplayDateTime from '@/components/client/DisplayDateTime'
import QrCode from '@/components/client/QRcode'
import {headers} from 'next/headers'
import {eventCoverTimeStr, getGmtOffset, pickSearchParam} from '@/utils'
import dynamic from 'next/dynamic'
import {cache} from 'react'

const DynamicShareActionsBtn = dynamic(() => import('@/app/(normal)/event/share/[eventid]/ShareActionsBtn'), {ssr: false})

const cachedEventDetailPage = cache(EventDetailPage)

export async function generateMetadata({params:{eventid},searchParams:{tab}}: EventDetailDataProps) {
    const {eventDetail} = await cachedEventDetailPage(eventid, pickSearchParam(tab))
    const {lang} = await selectLang()

    return {
        title: `${lang['Share Event']}-${eventDetail.title} | ${process.env.NEXT_PUBLIC_APP_TITLE || "Social Layer"}`,
    }
}

export default async function ShareEventPage({params:{eventid},searchParams:{tab}}: EventDetailDataProps) {
    const {eventDetail, groupDetail} = await cachedEventDetailPage(eventid, pickSearchParam(tab))
    const {lang} = await selectLang()
    const shareUrl = `${new URL(headers().get('x-current-path')!).origin}/event/detail/${eventDetail.id}`

    return <div className="min-h-[100svh] w-full">
        <div className="page-width min-h-[100svh] px-3 pt-0 !pb-16">
            <div
                className="py-6 font-semibold text-center text-xl">{lang['Share Event']}</div>

            <div className="flex flex-col items-center justify-center">
                <div
                    className="share-card shadow w-[335px] h-auto flex-shrink-0 bg-[#F1FCF8] p-5 pt-6 box-border overflow-hidden rounded-lg">
                    {!!eventDetail.cover_url
                        ? <img src={eventDetail.cover_url}
                               className="block max-h-[200px] max-w-[295px] mx-auto rounded-lg"/>
                        : <div className="mb-4 flex-shrink-0 w-[200px] h-[200px] overflow-hidden mx-auto">
                            <div className="default-cover w-[452px] h-[452px]" style={{transform: 'scale(0.44)'}}>
                                <div
                                    className="webkit-box-clamp-2 font-semibold text-[27px] max-h-[80px] w-[312px] absolute left-[76px] top-[78px]">
                                    {eventDetail.title || lang['Event Name']}
                                </div>
                                <div
                                    className="text-lg absolute font-semibold left-[76px] top-[178px]">{eventCoverTimeStr(eventDetail.start_time!, eventDetail.timezone!).date}
                                    <br/>
                                    {eventCoverTimeStr(eventDetail.start_time!, eventDetail.timezone!).time}
                                </div>
                                <div
                                    className="text-lg absolute font-semibold left-[76px] top-[240px]">{eventDetail.location}</div>
                            </div>
                        </div>
                    }
                    <div className="text-[20px] font-semibold leading-[28px] mt-[33px] mb-[22px]">
                        {eventDetail.title}
                    </div>
                    {!!eventDetail.start_time &&
                        <div className="flex flex-row text-xs font-normal">
                            <i className="uil-calendar-alt mr-1"/>
                            <div className={'start-time'}>
                                <DisplayDateTime
                                    dataTimeStr={eventDetail.start_time}
                                    tz={eventDetail.timezone}/>
                            </div>
                            {
                                eventDetail.end_time &&
                                <>
                                    <span>—</span>
                                    <div className={'end-time'}>
                                        <DisplayDateTime
                                            dataTimeStr={eventDetail.end_time}
                                            tz={eventDetail.timezone}/>
                                    </div>
                                </>
                            }
                        </div>
                    }
                    {!!eventDetail.timezone &&
                        <div className="flex flex-row text-xs font-normal">
                            <div className="pl-4">{eventDetail.timezone}  {getGmtOffset(eventDetail.timezone)}</div>
                        </div>
                    }
                    {
                        !!eventDetail.location && <div className="text-xs flex flex-row items-start  mt-2">
                            <i className="uil-location-point mr-1"/>
                            <div>{eventDetail.location}
                                <br/> {eventDetail.formatted_address ? `${eventDetail.formatted_address}` : ''}</div>
                        </div>
                    }
                    {
                        !!eventDetail.meeting_url && <div className="text-xs flex flex-row items-start  mt-2">
                            <i className="uil-link mr-1"/>
                            <div>{eventDetail.meeting_url}</div>
                        </div>
                    }

                    <div
                        className="bg-[rgba(149,170,163,0.15)] p-5 m-[20px_-20px_-20px] flex flex-row justify-between items-center">
                        <div className="text-[#272928] text-[14px] font-semibold leading-[19px]">
                            <div>{lang['Scan the code']} <br/>{lang['and attend the event']}</div>
                            <img src="/images/logo_horizontal.svg" alt=""/>
                        </div>
                        <QrCode size={[63, 63]}
                                text={shareUrl}/>
                    </div>
                </div>

                <div className="my-3 w-[335px] mx-auto">
                    <DynamicShareActionsBtn lang={lang} eventDetail={eventDetail} groupHandle={groupDetail.handle}/>
                </div>
            </div>
        </div>

    </div>
}