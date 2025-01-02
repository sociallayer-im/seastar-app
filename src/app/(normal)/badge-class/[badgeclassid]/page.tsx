import BadgeClassPageData, {
    BadgeClassPageDataProps
} from "@/app/(normal)/badge-class/[badgeclassid]/data"
import {getAvatar} from "@/utils"
import dynamic from "next/dynamic"

const DynamicShowTime = dynamic(
    () => import('./FormatTime'),
    {ssr: false}
)

export default async function BadgeClassPage(props: BadgeClassPageDataProps) {
    const {badgeClass, badges} = await BadgeClassPageData(props)

    return <div className="page-width min-h-[calc(100vh-48px)] !pt-6 !pb-16">
        <div className="w-full flex flex-col sm:flex-row justify-start items-start">
            <div className="w-full sm:w-[300px] flex-shrink-0 grid grid-cols-1 gap-6">
                <img src={badgeClass.image_url!} 
                    alt="" 
                    className="w-[224px] h-[224px]  mx-auto object-cover rounded-full"/>

                <div className="font-semibold text-2xl text-center">{badgeClass.title}</div>

                <div className="grid grid-cols-1 gap-3 text-sm">
                    <a href={`/profile/${badgeClass.creator.handle}`}
                        className="w-full whitespace-nowrap flex-row-item-center justify-center mx-auto bg-secondary rounded-full p-2">
                        <div className="font-semibold">Creator</div>
                        <img
                            className="w-6 h-6 rounded-full mx-2"
                            src={getAvatar(badgeClass.creator_id, badgeClass.creator.image_url)}
                            alt=""/>
                        <div>{badgeClass.creator.nickname || badgeClass.creator.handle}</div>
                    </a>
                </div>
            </div>

            <div className="flex-1 sm:ml-8">
                <div className="text-2xl font-semibold my-3">{badgeClass.counter} Receivers</div>

                {
                    badges.map((badge, i) => {
                        return <div key={i} className="p-3 bg-secondary rounded-lg mb-3 text-sm">
                            <div className="mb-3">
                                <div className={"font-semibold mb-1"}>Receiver</div>
                                <a href={`/profile/${badge.owner.handle}`} 
                                    className="flex-row-item-center">
                                    <img
                                        className="w-6 h-6 rounded-full mr-2"
                                        src={getAvatar(badge.owner.id, badge.owner.image_url)} alt=""/>
                                    {badge.owner.nickname || badge.owner.handle}
                                </a>
                            </div>

                            <div className="mb-3">
                                <div className={"font-semibold mb-1"}>Reason</div>
                                <div className="flex-row-item-center">
                                    {badge.content}
                                </div>
                            </div>

                            <div>
                                <div className={"font-semibold mb-1"}>Create Time</div>
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