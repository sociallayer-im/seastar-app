import BadgeClassPageData, {
    BadgeClassPageDataProps
} from "@/app/(normal)/badge-class/[badgeclassid]/data"
import {displayProfileName, getAvatar} from "@/utils"
import dynamic from "next/dynamic"
import {selectLang} from '@/app/actions'
import {buttonVariants} from '@/components/shadcn/Button'
import Avatar from '@/components/Avatar'
import NoData from '@/components/NoData'
import {cache} from 'react'

const cachedBadgeClassPageData = cache(BadgeClassPageData)

const DynamicShowTime = dynamic(
    () => import('./FormatTime'),
    {ssr: false}
)

export async function generateMetadata({params:{badgeclassid}, searchParams:{to}}: BadgeClassPageDataProps) {
    const {badgeClass, isOwner, isPrivate} = await cachedBadgeClassPageData(badgeclassid, to)
    badgeClass.badge_type
    const title = isPrivate && !isOwner ? 'Private Badge' : badgeClass.title
    return {
        title: `${title} | Social Layer`,
    }
}

export default async function BadgeClassPage({params:{badgeclassid}, searchParams:{to}}: BadgeClassPageDataProps) {
    const data = await cachedBadgeClassPageData(badgeclassid, to)

    return data.isPrivate && !data.isOwner
        ? <PrivateBadgeClassPage {...data} />
        : <PublicBadgeClassPage {...data} />
}


async function PublicBadgeClassPage({badgeClass, badges, isOwner, groupCreator}: Awaited<ReturnType<typeof BadgeClassPageData>>) {
    const {lang} = await selectLang()
    return <div className="page-width min-h-[calc(100vh-48px)] !pt-6 !pb-16">
        <div className="w-full flex flex-col sm:flex-row justify-start items-start">
            <div className="w-full sm:w-[300px] flex-shrink-0 grid grid-cols-1 gap-6">
                <img src={badgeClass.image_url!}
                     alt=""
                     className="w-[224px] h-[224px]  mx-auto object-cover rounded-full"/>

                <div className="font-semibold text-2xl text-center">{badgeClass.title}</div>

                <div className="grid grid-cols-1 gap-3 text-sm">
                    {!!groupCreator
                        ? <a href={`/group/${groupCreator.handle}`}
                             className="w-full whitespace-nowrap flex-row-item-center justify-center mx-auto bg-secondary rounded-full p-2">
                            <div className="font-semibold">{lang['Creator']}</div>
                            <Avatar profile={groupCreator} size={24} className="mx-2"/>
                            <div>{displayProfileName(groupCreator)}</div>
                        </a>
                        : <a href={`/profile/${badgeClass.creator.handle}`}
                             className="w-full whitespace-nowrap flex-row-item-center justify-center mx-auto bg-secondary rounded-full p-2">
                            <div className="font-semibold">{lang['Creator']}</div>
                            <Avatar profile={badgeClass.creator} size={24} className="mx-2"/>
                            <div>{displayProfileName(badgeClass.creator)}</div>
                        </a>
                    }
                </div>

                {isOwner &&
                    <a className={`${buttonVariants({variant: "special"})} w-full`}
                       href={`/badge-class/${badgeClass.id}/send-badge`}>
                        <i className="uil-message text-xl"/>
                        {lang['Send Badge']}
                    </a>
                }
            </div>

            <div className="flex-1 sm:ml-8 w-full">
                <div className="my-3">
                    <span className="sm:text-2xl font-semibold mr-2 text-base">{badgeClass.badges.length}</span>
                    <span className="sm:text-xl text-base">{lang['Receivers']}</span>
                </div>

                {!badges.length && <div className="p-7 bg-secondary rounded-lg mb-3 text-sm">
                    <NoData/>
                </div>}

                {
                    badges.map((badge, i) => {
                        return <div key={i} className="p-3 bg-secondary rounded-lg mb-3 text-sm w-full">
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
                    })
                }
            </div>
        </div>
    </div>
}

async function PrivateBadgeClassPage({badgeClass}: Awaited<ReturnType<typeof BadgeClassPageData>>) {
    const {lang} = await selectLang()

    return <div className="page-width min-h-[calc(100vh-48px)] !pt-6 !pb-16">
        <div className="w-full flex flex-col sm:flex-row justify-start items-start">
            <div className="w-full sm:w-[300px] flex-shrink-0 grid grid-cols-1 gap-6">
                <img src={`/images/badge_private.png`}
                     alt=""
                     className="w-[224px] h-[224px]  mx-auto object-cover rounded-full"/>

                <div className="font-semibold text-2xl text-center">🔒</div>

                <div className="grid grid-cols-1 gap-3 text-sm">
                    <a href={`/profile/${badgeClass.creator.handle}`}
                       className="w-full whitespace-nowrap flex-row-item-center justify-center mx-auto bg-secondary rounded-full p-2">
                        <div className="font-semibold">{lang['Creator']}</div>
                        <Avatar profile={badgeClass.creator} size={24} className="mx-2"/>
                        <div>{displayProfileName(badgeClass.creator)}</div>
                    </a>
                </div>
            </div>

            <div className="flex-1 sm:ml-8">
                <div className="mb-3 text-yellow-500 flex-row-item-center p-2 bg-amber-50 rounded-lg">
                    <i className="uil-info-circle text-2xl mr-2"/>
                    <div><b>{lang["Privacy Badge"]}</b>: {lang['Only the creator and the recipient of the badge can view the details']}</div>
                </div>
                <div className="p-8 bg-secondary rounded-lg mb-3 text-sm">
                    <NoData/>
                </div>
            </div>
        </div>
    </div>
}
