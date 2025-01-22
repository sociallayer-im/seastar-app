import BadgePageData, {BadgePageDataProps} from "@/app/(normal)/badge/[badgeid]/data"
import {displayProfileName, getAvatar} from "@/utils"
import {Button} from "@/components/shadcn/Button"
import dynamic from "next/dynamic"
import Image from 'next/image'
import Avatar from '@/components/Avatar'
import {selectLang} from '@/app/actions'
import NoData from '@/components/NoData'

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


export async function PublicBadge ({badge, isOwner, groupCreator}: Awaited<ReturnType<typeof BadgePageData>>) {
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
                    <Button variant="secondary" className='w-full text-lg'>
                        <svg xmlns="http://www.w3.org/2000/svg"
                             className="!w-6 !h-6"
                             width="100" height="100"
                             viewBox="0 0 25 24"
                             fill="none">
                            <path
                                d="M15 2.96875H18C19.1046 2.96875 20 3.86418 20 4.96875V7.96875M20 7.96875L18 6.4375M20 7.96875L22 6.4375"
                                stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path
                                d="M10 20.9688H7C5.89543 20.9688 5 20.0733 5 18.9688V15.9688M5 15.9688L7 17.4375M5 15.9688L3 17.4375"
                                stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                            <rect x="4" y="1.96875" width="6" height="9" rx="2" stroke="#333333" strokeWidth="2"
                                  strokeLinecap="round" strokeLinejoin="round"></rect>
                            <rect x="14" y="12.9688" width="6" height="9" rx="2" stroke="#333333" strokeWidth="2"
                                  strokeLinecap="round" strokeLinejoin="round"></rect>
                        </svg>
                        Swap
                    </Button>
                </div>
            }
        </div>
    </div>
}

export async function PrivateBadge({groupCreator, badge}: Awaited<ReturnType<typeof BadgePageData>>) {
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

            <div className="mb-3 text-yellow-500 flex-row-item-center p-2 mx-auto w-full max-w-[500px] bg-amber-50 rounded-lg">
                <i className="uil-info-circle text-2xl mr-2"/>
                <div><b>{lang["Privacy Badge"]}</b>: {lang['Only the creator and the recipient of the badge can view the details']}</div>
            </div>

        </div>
    </div>
}