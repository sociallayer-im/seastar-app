import BadgePageData, {BadgePageDataProps} from "@/app/(normal)/badge/[badgeid]/data"
import {displayProfileName, getAvatar} from "@/utils"
import {Button} from "@/components/shadcn/Button"
import dynamic from "next/dynamic"
import Image from 'next/image'
import Avatar from '@/components/Avatar'
import {selectLang} from '@/app/actions'
import NoData from '@/components/NoData'
import SwapBtn from '@/app/(normal)/badge/[badgeid]/SwapBtn'

const DynamicShowTime = dynamic(
    () => import('@/app/(normal)/badge-class/[badgeclassid]/FormatTime'),
    {ssr: false}
)


export default async function BadgePage(props: BadgePageDataProps) {
    const data = await BadgePageData(props)

    return data.isPrivate && !data.isOwner
        ? <PrivateBadge {...data} />
        : <PublicBadge {...data}/>
}


async function PublicBadge({badge, isOwner, groupCreator}: Awaited<ReturnType<typeof BadgePageData>>) {
    const {lang} = await selectLang()
    return <div className="page-width min-h-[calc(100vh-48px)] !pt-6 !pb-16">
        <div className="w-full flex flex-col justify-start items-start">
            <div className="w-full max-w-[500px] mx-auto flex-shrink-0 grid grid-cols-1 gap-6">
                <Image src={badge.badge_class.image_url!}
                       width={160} height={160}
                       alt=""
                       className="w-[160px] h-[160px]  mx-auto object-cover rounded-full"/>

                <div className="font-semibold text-2xl text-center">{badge.badge_class.title}</div>

                <div className="grid grid-cols-1 gap-3 text-sm">
                    {!!groupCreator ?
                        <a href={`/group/${groupCreator.handle}`}
                           className="whitespace-nowrap flex-row-item-center justify-center mx-auto bg-secondary rounded-full py-2 px-3">
                            <div className="font-semibold">{lang['Creator']}</div>
                            <Avatar className="mx-2" profile={groupCreator} size={24}/>
                            <div>{displayProfileName(groupCreator)}</div>
                        </a>
                        : <a href={`/profile/${badge.creator.handle}`}
                             className="whitespace-nowrap flex-row-item-center justify-center mx-auto bg-secondary rounded-full py-2 px-3">
                            <div className="font-semibold">{lang['Creator']}</div>
                            <Avatar className="mx-2" profile={badge.creator} size={24}/>
                            <div>{displayProfileName(badge.creator)}</div>
                        </a>
                    }
                </div>
            </div>

            <div className="w-full max-w-[500px] mx-auto p-3 bg-secondary rounded-lg mb-3 text-sm mt-6">
                <div className="mb-3">
                    <div className={"font-semibold mb-1"}>{lang['Receiver']}</div>
                    <a href={`/profile/${badge.owner.handle}`}
                       className="flex-row-item-center">
                        <img
                            className="w-6 h-6 rounded-full mr-2"
                            src={getAvatar(badge.owner.id, badge.owner.image_url)} alt=""/>
                        {badge.owner.nickname || badge.owner.handle}
                    </a>
                </div>

                {!!badge.content &&
                    <div className="mb-3">
                        <div className={"font-semibold mb-1"}>{lang['Reason']}</div>
                        <div className="flex-row-item-center">
                            {badge.content}
                        </div>
                    </div>
                }

                <div>
                    <div className={"font-semibold mb-1"}>{lang['Create Time']}</div>
                    <div className="flex-row-item-center">
                        <DynamicShowTime time={badge.created_at}/>
                    </div>
                </div>
            </div>

            {isOwner &&
                <div className="w-full max-w-[500px] mx-auto py-3 mb-3 text-sm">
                    <SwapBtn badge={badge}/>
                </div>
            }
        </div>
    </div>
}

async function PrivateBadge({groupCreator, badge}: Awaited<ReturnType<typeof BadgePageData>>) {
    const {lang} = await selectLang()

    return <div className="page-width min-h-[calc(100vh-48px)] !pt-6 !pb-16">
        <div className="w-full flex flex-col justify-start items-start">
            <div className="w-full max-w-[500px] mx-auto flex-shrink-0 grid grid-cols-1 gap-6">
                <Image src={"/images/badge_private.png"}
                       width={160} height={160}
                       alt=""
                       className="w-[160px] h-[160px]  mx-auto object-cover rounded-full"/>

                <div className="font-semibold text-2xl text-center">🔒</div>

                <div className="grid grid-cols-1 gap-3 text-sm">
                    {!!groupCreator ?
                        <a href={`/group/${groupCreator.handle}`}
                           className="whitespace-nowrap flex-row-item-center justify-center mx-auto bg-secondary rounded-full py-2 px-3">
                            <div className="font-semibold">{lang['Creator']}</div>
                            <Avatar className="mx-2" profile={groupCreator} size={24}/>
                            <div>{displayProfileName(groupCreator)}</div>
                        </a>
                        : <a href={`/profile/${badge.creator.handle}`}
                             className="whitespace-nowrap flex-row-item-center justify-center mx-auto bg-secondary rounded-full py-2 px-3">
                            <div className="font-semibold">{lang['Creator']}</div>
                            <Avatar className="mx-2" profile={badge.creator} size={24}/>
                            <div>{displayProfileName(badge.creator)}</div>
                        </a>
                    }
                </div>
            </div>

            <div className="w-full max-w-[500px] mx-auto p-3 bg-secondary rounded-lg mb-3 text-sm mt-6">
                <NoData/>
            </div>

            <div
                className="mb-3 text-yellow-500 flex-row-item-center p-2 mx-auto w-full max-w-[500px] bg-amber-50 rounded-lg">
                <i className="uil-info-circle text-2xl mr-2"/>
                <div>
                    <b>{lang["Privacy Badge"]}</b>: {lang['Only the creator and the recipient of the badge can view the details']}
                </div>
            </div>

        </div>
    </div>
}