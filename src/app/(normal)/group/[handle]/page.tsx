import GroupPageData, {GroupDataProps} from "@/app/(normal)/group/[handle]/data"
import {getAvatar} from "@/utils"
import {Badge} from "@/components/shadcn/Badge"
import BtnGroupQrcode from "@/app/(normal)/group/[handle]/BtnGroupQrcode"
import {Media_Meta} from "@/utils/social_media_meta"
import CopyText from "@/components/client/CopyText"
import {buttonVariants} from "@/components/shadcn/Button"
import {selectLang} from "@/app/actions"
import TabEvents from './TabEvents/TabEvents'
import TabBadges from "@/app/(normal)/group/[handle]/TabBadges/TabBadges"
import TabMembers from "@/app/(normal)/group/[handle]/TabMembers/TabMembers"
import TabVouchers from "@/app/(normal)/group/[handle]/TabVouchers/TabVouchers"
import {Textarea} from "@/components/shadcn/Textarea"
import NoData from "@/components/NoData"

export const dynamic = 'force-dynamic'

export default async function GroupPage(props: GroupDataProps) {
    const {group, tab, currProfile, currUserIsManager, currUserIsIssuer, currUserIsMember, members} = await GroupPageData(props)
    const lang = (await selectLang()).lang

    return <div className="bg-white min-h-[100svh] w-full !pb-16">
        <div className="w-full mb-3 relative bg-[#f8f8f8]">
            <div className="h-[150px]" style={{background: 'url("/images/profile_bg.png")'}}>
                <div className="page-width relative">
                    <div className="absolute right-3 top-3">
                        <a href={`/group/${group.handle}/edit`} className="flex-row-item-center">
                            <div className="text-xs">{group.nickname || group.handle}</div>
                            <i className="uil-cog text-lg ml-1"/>
                        </a>
                    </div>
                </div>
            </div>
            <div className="page-width">
                <div>
                    <img src={getAvatar(group.id, group.image_url)}
                        className="mt-[-30px] w-[60px] h-[60px] rounded-full" alt=""/>
                    <div className="flex-row-item-center my-2">
                        <div className="font-semibold text-5">{group.nickname || group.handle}</div>
                        <Badge variant="outline" className="ml-1 text-xs italic">Group</Badge>
                        <BtnGroupQrcode group={group}>
                            <i className="uil-qrcode-scan h-5 px-2 bg-gray-100 rounded-lg flex-row-item-center ml-2 cursor-pointer hover:bg-gray-200"/>
                        </BtnGroupQrcode>
                    </div>
                    {!!group.location &&
                        <div className="flex-row-item-center my-2 text-sm">
                            <div className="mr-4"><i className="uil-location-point"></i>{group.location}</div>
                        </div>
                    }
                    <div className="text-xs my-3">
                        {group.about}
                    </div>
                    {!!group.social_links &&
                        <div tabIndex={0}
                            className="inline-block max-h-7 hover:max-h-[200px] transition-all duration-1000 overflow-hidden mb-3 cursor-pointer group">
                            <div className="flex flex-row justify-start text-xs group-hover:flex-col">
                                {Object.keys(group.social_links).map(key => {
                                    return <div key={key}
                                        className="flex-row-item-center grow-0 shrink-0">
                                        <i className={`${Media_Meta[key as keyof Solar.SocialMedia].icon} text-lg mr-1`}/>
                                        {Media_Meta[key as keyof Solar.SocialMedia].valueType === 'url' ?
                                            <a href={group.social_links[key as keyof Solar.SocialMedia]!}
                                                className="group-hover:inline hidden hover:underline"
                                                target="_blank">{group.social_links[key as keyof Solar.SocialMedia]}</a>
                                            : <a className="group-hover:inline hidden hover:underline">
                                                <CopyText
                                                    value={group.social_links[key as keyof Solar.SocialMedia]}>
                                                    {group.social_links[key as keyof Solar.SocialMedia]}
                                                </CopyText>
                                            </a>
                                        }
                                    </div>
                                })
                                }
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>

        <div className="page-width pl-0 pr-0 pb-12 pt-0">
            <div className="flex flex-col items-start max-w-[640px]">
                <div className="tab-titles w-full flex-row-item-center overflow-auto">
                    <a className={`${buttonVariants({variant: tab === 'events' ? 'normal' : 'ghost'})} flex-1`}
                        href={`/group/${group.handle}?tab=events`}>
                        <span className="font-normal">{lang['Events']}</span>
                    </a>
                    <a className={`${buttonVariants({variant: tab === 'badges' ? 'normal' : 'ghost'})} flex-1`}
                        href={`/group/${group.handle}?tab=badges`}>
                        <span className="font-normal"> {lang['Badges']}</span>
                    </a>
                    {currUserIsManager &&
                        <a className={`${buttonVariants({variant: tab === 'sending' ? 'normal' : 'ghost'})} flex-1`}
                            href={`/group/${group.handle}?tab=sending`}>
                            <span className="font-normal">{lang['Sending']}</span>
                        </a>
                    }
                    <a className={`${buttonVariants({variant: tab === 'chat' ? 'normal' : 'ghost'})} flex-1`}
                        href={`/group/${group.handle}?tab=chat`}>
                        <span className="font-normal">{lang['Chat']}</span>
                    </a>
                    <a className={`${buttonVariants({variant: tab === 'votes' ? 'normal' : 'ghost'})} flex-1`}
                        href={`/group/${group.handle}?tab=votes`}>
                        <span className="font-normal">{lang['Votes']}</span>
                    </a>
                    <a className={`${buttonVariants({variant: tab === 'members' ? 'normal' : 'ghost'})} flex-1`}
                        href={`/group/${group.handle}?tab=members`}>
                        <span className="font-normal">{lang['Members']}</span>
                    </a>
                </div>


                {
                    tab === 'events' && <div className="grid grid-cols-1 gap-3 w-full">
                        <TabEvents handle={group.handle}
                            currUserHandle={currProfile?.handle}/>
                    </div>
                }

                {
                    tab === 'badges' && <div className="grid grid-cols-1 gap-3 w-full">
                        <TabBadges
                            handle={group.handle}
                            isMember={currUserIsMember}
                            isIssuer={currUserIsIssuer}
                            isManager={currUserIsManager} />
                    </div>
                }

                { tab === 'members' && <div className="grid grid-cols-1 gap-3 w-full">
                    <TabMembers
                        handle={group.handle}
                        currUserHandle={currProfile?.handle}
                        lang={lang}
                        members={members}
                        isMember={currUserIsMember}
                        isManager={currUserIsManager} />
                </div>
                }

                {
                    tab === 'sending' && <div className="grid grid-cols-1 gap-3 w-full">
                        <TabVouchers  handle={group.handle} />
                    </div>
                }

                {
                    tab === 'chat' && <div className="py-4 w-full">
                        <div className="flex flex-row  w-full !items-start">
                            <img className="w-9 h-9 rounded-full mr-2"
                                src='/images/default_avatar/avatar_1.png' alt=""/>
                            <Textarea className="flex-1" placeholder={'Input comment'}/>
                        </div>
                        <NoData />
                    </div>
                }
            </div>
        </div>
    </div>
}
