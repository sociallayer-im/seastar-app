import GroupPageData, {GroupDataProps} from "@/app/(normal)/group/[handle]/data"
import {displayProfileName, getAvatar} from "@/utils"
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
import {SocialMedia} from '@sola/sdk'
import Avatar from '@/components/Avatar'
import ClickToCopy from '@/components/client/ClickToCopy'
import CommentPanel from '@/components/client/CommentPanel'

export const dynamic = 'force-dynamic'

export async function generateMetadata(props: GroupDataProps) {
    const {group} = await GroupPageData(props)
    const lang = (await selectLang()).lang

    return {
        title: `${displayProfileName(group)} - ${lang['Group']} | Social Layer`,
        openGraph: {
            title: `${displayProfileName(group)} - ${lang['Group']} | Social Layer`,
            description: group.about || undefined,
            type: 'website',
            url: `https://app.sola.day/group/${group.handle}`,
            images: getAvatar(group.id, group.image_url),
        }
    }
}

export default async function GroupPage(props: GroupDataProps) {
    const {
        group,
        tab,
        currProfile,
        currUserIsManager,
        currUserIsIssuer,
        currUserIsMember,
        currUserIsOwner,
        members,
        canPublishEvent
    } = await GroupPageData(props)
    const lang = (await selectLang()).lang

    return <div className="bg-white min-h-[100svh] w-full !pb-16">
        <div className="w-full mb-3 relative bg-[#f8f8f8]">
            <div className="h-[150px]" style={{background: 'url("/images/profile_bg.png")'}}>
                <div className="page-width relative">
                    <div className="absolute right-3 top-3">
                        {currUserIsOwner
                            ? <a className="flex-row-item-center hover:text-blue-500 cursor-pointer" href={`/group/${group.handle}/edit`}>
                                <div className='text-xs'>{group.handle}</div>
                                <i className="cursor-pointer uil-cog text-lg ml-1"/>
                            </a>
                            : <ClickToCopy text={group.handle}>
                                <div className="flex-row-item-center hover:text-blue-500 cursor-pointer">
                                    <div className='text-xs'>{group.handle}</div>
                                    <i className="uil-copy-alt ml-1"/>
                                </div>
                            </ClickToCopy>
                        }
                    </div>
                </div>
            </div>
            <div className="page-width !pb-4">
                <div>
                    <Avatar size={60} profile={group} className="mt-[-30px]"/>
                    <div className="flex-row-item-center my-2">
                        <div className="font-semibold text-5">{group.nickname || group.handle}</div>
                        <Badge variant="outline" className="ml-1 text-xs italic">Group</Badge>
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
                                {(Object.keys(group.social_links) as Array<keyof SocialMedia>)
                                    .map((key) => {
                                        return <div key={key}
                                                    className="flex-row-item-center grow-0 shrink-0">
                                            <div className="w-8 text-center">
                                                <i className={`${Media_Meta[key].icon} text-lg mr-1`}/>
                                            </div>
                                            {Media_Meta[key].valueType === 'url' ?
                                                <a href={group.social_links[key]!}
                                                   className="group-hover:inline hidden hover:underline"
                                                   target="_blank">{group.social_links[key]}</a>
                                                : <a className="group-hover:inline hidden hover:underline">
                                                    <CopyText
                                                        value={group.social_links[key]}>
                                                        {group.social_links[key]}
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
                    {(currUserIsManager || currUserIsIssuer) &&
                        <a className={`${buttonVariants({variant: tab === 'sending' ? 'normal' : 'ghost'})} flex-1`}
                           href={`/group/${group.handle}?tab=sending`}>
                            <span className="font-normal">{lang['Sending']}</span>
                        </a>
                    }
                    <a className={`${buttonVariants({variant: tab === 'commend' ? 'normal' : 'ghost'})} flex-1`}
                       href={`/group/${group.handle}?tab=commend`}>
                        <span className="font-normal">{lang['Comments']}</span>
                    </a>
                    <a className={`${buttonVariants({variant: tab === 'members' ? 'normal' : 'ghost'})} flex-1`}
                       href={`/group/${group.handle}?tab=members`}>
                        <span className="font-normal">{lang['Members']}</span>
                    </a>
                </div>


                {
                    tab === 'events' && <div className="grid grid-cols-1 gap-3 w-full">
                        <TabEvents handle={group.handle}
                                   canPublishEvent={canPublishEvent}
                                   currProfile={currProfile}/>
                    </div>
                }

                {
                    tab === 'badges' && <div className="grid grid-cols-1 gap-3 w-full">
                        <TabBadges
                            handle={group.handle}
                            isMember={currUserIsMember}
                            isIssuer={currUserIsIssuer}
                            isManager={currUserIsManager}/>
                    </div>
                }

                {tab === 'members' && <div className="grid grid-cols-1 gap-3 w-full">
                    <TabMembers
                        group={group}
                        currProfile={currProfile}
                        lang={lang}
                        members={members}
                        isOwner={currUserIsOwner}
                        isMember={currUserIsMember}
                        isManager={currUserIsManager}/>
                </div>
                }

                {
                    tab === 'sending' && <div className="grid grid-cols-1 gap-3 w-full">
                        <TabVouchers handle={group.handle}/>
                    </div>
                }

                {
                    tab === 'commend' && <div className="py-4 w-full">
                        <CommentPanel
                            lang={lang}
                            currProfile={currProfile}
                            itemType="Group"
                            itemId={group.id}
                        />
                    </div>
                }
            </div>
        </div>
    </div>
}
