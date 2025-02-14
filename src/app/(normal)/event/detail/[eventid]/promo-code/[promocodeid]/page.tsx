import {selectLang} from "@/app/actions"
import {Button} from "@/components/shadcn/Button"
import PromoCodeDetailData, {
    PromoCodeDetailPageProps
} from '@/app/(normal)/event/detail/[eventid]/promo-code/[promocodeid]/data'
import React from 'react'
import NoData from '@/components/NoData'
import CopyText from '@/components/client/CopyText'
import Avatar from '@/components/Avatar'
import {displayProfileName} from '@/utils'
import dynamic from 'next/dynamic'

const DisplayDateTime = dynamic(() => import('@/components/client/DisplayDateTime'))

export default async function PromoCodeDetail(props: PromoCodeDetailPageProps) {
    const {lang} = await selectLang()
    const {couponDetail, currProfile, code, records} = await PromoCodeDetailData(props)

    const label = couponDetail.discount_type === 'amount' ? lang['Amount Off'] : lang['Percentage Off']
    const value = couponDetail.discount_type === 'amount' ? `${couponDetail.discount / 100} USD` : `${100 - couponDetail.discount / 100}%`

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width-sm min-h-[calc(100svh-48px) px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl mb-4">{lang['Promo Code Detail']}</div>

            <div className="mb-4 flex-row-item-center justify-center">
                <div className="mr-3">{lang['Code']}</div>
                <div className="text-2xl flex-1 font-semibold w-[200px] shadow rounded-lg text-center py-3">
                    {code}
                </div>
                <CopyText value={code}>
                    <Button variant="secondary" className='ml-3'>
                        <i className="uil-copy text-2xl text-green-500"/>
                    </Button>
                </CopyText>
            </div>

            <div className="flex-row-item-center justify-between bg-secondary rounded-lg px-3 py-2 mb-0.5">
                <div>{label}</div>
                <div className="font-semibold">{value}</div>
            </div>
            <div className="flex-row-item-center justify-between bg-secondary rounded-lg px-3 py-2 mb-0.5">
                <div>{lang['Valid Date']}</div>
                <div className="font-semibold">
                    {couponDetail?.expires_at ? <DisplayDateTime dataTimeStr={couponDetail?.expires_at}/> : 'Unlimited'}
                </div>
            </div>
            <div className="flex-row-item-center justify-between bg-secondary rounded-lg px-3 py-2 mb-0.5">
                <div>{lang['Remaining uses']}</div>
                <div className="font-semibold">
                    {
                        couponDetail.max_allowed_usages
                            ? couponDetail.max_allowed_usages - couponDetail.order_usage_count
                            : 'Unlimited'
                    }
                </div>
            </div>

            <div className="font-semibold mt-8 mb-2">{lang['Usage Record']}</div>
            {!records.length && <NoData/>}
            {
                records.map((record, i) => {
                    return <div className="flex-row-item-center border-b-[1px] py-3 justify-between">
                        <div className="flex-row-item-center mr-2">
                            <Avatar profile={record.profile} size={24} className="mr-2"/>
                            {displayProfileName(record.profile)}
                        </div>
                        <DisplayDateTime dataTimeStr={record.created_at!}/>
                    </div>
                })
            }
        </div>
    </div>
}