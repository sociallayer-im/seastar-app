import {
    ProfileData,
    ProfileDataProps,
} from "@/app/(normal)/profile/[handle]/data"
import {redirect} from "next/navigation"
import BtnShowAddress from "@/app/(normal)/profile/[handle]/BtnShowAddress"
import {selectLang} from "@/app/actions"
import BtnProfileQrcode from "@/app/(normal)/profile/[handle]/BtnProfileQrcode"
import {buttonVariants} from "@/components/shadcn/Button"
import TabGroups from "@/app/(normal)/profile/[handle]/TabGroups/TabGroups"
import TabEvents from "@/app/(normal)/profile/[handle]/TabEvents/TabEvents"
import TabBadges from "@/app/(normal)/profile/[handle]/TabBadges/TabBadges"
import TabVouchers from "@/app/(normal)/profile/[handle]/TabVouchers/TabVouchers"
import {Media_Meta} from "@/utils/social_media_meta"
import CopyText from "@/components/client/CopyText"
import {SocialMedia} from '@sola/sdk'
import Avatar from '@/components/Avatar'
import SelectedBadgeWannaSend from '@/components/client/SelectedBadgeWannaSend'
import {displayProfileName, getAvatar, pickSearchParam} from '@/utils'
import ClickToCopy from '@/components/client/ClickToCopy'
import {cache} from 'react'

export const dynamic = 'force-dynamic'

const cachedProfileData = cache(ProfileData)

export async function generateMetadata({params: {handle}, searchParams: {tab}}: ProfileDataProps) {
    const data = await cachedProfileData(handle, pickSearchParam(tab))
    if (!data.profile) {
        redirect('/error')
    } else {
        return {
            title: `${displayProfileName(data.profile)} | Social Layer`,
            openGraph: {
                title: `${displayProfileName(data.profile)} | Social Layer`,
                description: data.profile.about || undefined,
                type: 'website',
                url: `https://app.sola.day/profile/${data.profile.handle}`,
                images: getAvatar(data.profile.id, data.profile.image_url),
            }
        }
    }
}

export default async function Profile({params: {handle}, searchParams: {tab: _tab}}: ProfileDataProps) {
    const {profile, currProfile, isSelf, tab} = await cachedProfileData(handle, pickSearchParam(_tab))
    const lang = (await selectLang()).lang

    return <div className="bg-[#f8f8f8] min-h-[100svh] w-full">
        <div className="page-width bg-[#f8f8f8] min-h-[100svh] !pl-0 !pr-0 pt-0 sm:pt-6 !pb-16">
            <div className="flex flex-col items-start sm:flex-row">
                <div className="bg-white w-full sm:w-[375px] mb-3 relative">
                    <img src="/images/profile_bg.png" className="w-full h-[140px]"/>
                    <div className="absolute right-3 top-3">
                        {isSelf
                            ? <a className="flex-row-item-center hover:text-blue-500 cursor-pointer"
                                 href={`/profile/${profile.handle}/edit`}>
                                <div className='text-xs'>{profile.handle}</div>
                                <i className="cursor-pointer uil-cog text-lg ml-1"/>
                            </a>
                            : <ClickToCopy text={profile.handle}>
                                <div className="flex-row-item-center hover:text-blue-500 cursor-pointer">
                                    <div className='text-xs'>{profile.handle}</div>
                                    <i className="uil-copy-alt ml-1"/>
                                </div>
                            </ClickToCopy>
                        }
                    </div>

                    <div className="px-3 mt-[-40px]">
                        <Avatar profile={profile} size={60}/>
                        <div className="flex-row-item-center my-2">
                            <div className="font-semibold text-5">{profile.nickname || profile.handle}</div>
                            {isSelf &&
                                <>
                                    {!!currProfile!.address &&
                                        <BtnShowAddress address={currProfile!.address} label={{
                                            title: lang['Wallet Address'],
                                            close: lang['Close'],
                                            copy: lang['Copy']
                                        }}>
                                            <i className="uil-wallet h-5 px-2 bg-gray-100 rounded-lg flex-row-item-center ml-2 cursor-pointer hover:bg-gray-200"/>
                                        </BtnShowAddress>}
                                    {!!currProfile!.email &&
                                        <BtnShowAddress address={currProfile!.email} label={{
                                            title: lang['Email Address'],
                                            close: lang['Close'],
                                            copy: lang['Copy']
                                        }}>
                                            <i className="uil-envelope h-5 px-2 bg-gray-100 rounded-lg flex-row-item-center ml-2 cursor-pointer hover:bg-gray-200"/>
                                        </BtnShowAddress>
                                    }
                                </>
                            }
                            <BtnProfileQrcode profile={profile}>
                                <i className="uil-qrcode-scan h-5 px-2 bg-gray-100 rounded-lg flex-row-item-center ml-2 cursor-pointer hover:bg-gray-200"/>
                            </BtnProfileQrcode>
                        </div>
                        <a className="flex-row-item-center my-2 text-sm hover:text-primary"
                           href={`/profile/${profile.handle}/follower`}>
                            <div className="mr-4"><strong>{profile.follower_count}</strong> {lang['Followers']}
                            </div>
                            <div className="mr-4"><strong>{profile.following_count}</strong> {lang['Following']}
                            </div>
                        </a>
                        {!!profile.social_links &&
                            <div tabIndex={0}
                                 className="inline-block max-h-7 hover:max-h-[200px] transition-all duration-300 overflow-hidden mb-3 cursor-pointer group">
                                <div className="flex flex-row justify-start text-xs group-hover:flex-col">
                                    {(Object.keys(profile.social_links) as Array<keyof SocialMedia>).map((key) => {
                                        return <div key={key}
                                                    className="flex-row-item-center grow-0 shrink-0">
                                            <div className="w-8 text-center">
                                                <i className={`${Media_Meta[key].icon} text-lg mr-1`}/>
                                            </div>
                                            {Media_Meta[key].valueType === 'url' ?
                                                <a href={profile.social_links[key]!}
                                                   className="group-hover:inline hidden hover:underline"
                                                   target="_blank">{profile.social_links[key]}</a>
                                                : <a className="group-hover:inline hidden hover:underline">
                                                    <CopyText
                                                        value={profile.social_links[key]}>
                                                        {profile.social_links[key]}
                                                    </CopyText>
                                                </a>
                                            }
                                        </div>
                                    })
                                    }
                                </div>
                            </div>
                        }

                        {!!profile.location &&
                            <div className="text-xs mb-3 flex-row-item-center">
                                <i className="uil-location-point text-base mr-1"/>
                                <span>{profile.location}</span>
                            </div>
                        }

                        {!!profile.about &&
                            <div className="text-xs mb-3">
                                {profile.about}
                            </div>
                        }

                        {!!currProfile && <SelectedBadgeWannaSend
                            lang={lang}
                            toProfileHandle={profile.handle !== currProfile.handle ? profile.handle : undefined}
                            profileDetail={currProfile}>
                            <div
                                className={`${buttonVariants({variant: 'special'})} w-full my-4 cursor-pointer`}>
                                <i className="uil-message mr-1 text-xl"/>
                                <span>
                                        {currProfile.handle === profile.handle
                                            ? lang['Send a badge']
                                            : lang['Send a badge to [1]'].replace('[1]', displayProfileName(profile))
                                        }
                                    </span>
                            </div>
                        </SelectedBadgeWannaSend>
                        }
                    </div>
                </div>

                <div className="flex-1 sm:ml-6 px-3 w-full">
                    <div className="tab-titles flex-row-item-center overflow-auto">
                        <a className={`${buttonVariants({variant: tab === 'groups' ? 'normal' : 'ghost'})} mr-3`}
                           href={`/profile/${profile.handle}?tab=groups`}>
                            <span className="font-normal">{lang['Groups']}</span>
                        </a>
                        <a className={`${buttonVariants({variant: tab === 'events' ? 'normal' : 'ghost'})} mr-3`}
                           href={`/profile/${profile.handle}?tab=events`}>
                            <span className="font-normal"> {lang['Events']}</span>
                        </a>
                        <a className={`${buttonVariants({variant: tab === 'badges' ? 'normal' : 'ghost'})} mr-3`}
                           href={`/profile/${profile.handle}?tab=badges`}>
                            <span className="font-normal">{lang['Badges']}</span>
                        </a>
                        {isSelf &&
                            <a className={`${buttonVariants({variant: tab === 'sending' ? 'normal' : 'ghost'})}`}
                               href={`/profile/${profile.handle}?tab=sending`}>
                                <span className="font-normal"> {lang['Sending']}</span>
                            </a>
                        }
                    </div>

                    <div className="tab-contents">
                        {tab === 'groups' && <TabGroups profile={profile}/>}

                        {tab === 'events' && <TabEvents handle={profile.handle} currProfile={currProfile}/>}

                        {tab === 'badges' && <TabBadges handle={profile.handle}
                                                        isSelf={isSelf}/>
                        }

                        {tab === 'sending' && <TabVouchers handle={profile.handle}/>}
                    </div>
                </div>
            </div>
        </div>
    </div>
}
