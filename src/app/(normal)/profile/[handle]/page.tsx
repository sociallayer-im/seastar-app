import {ProfileData, ProfilePageParams, ProfilePageSearchParams} from "@/app/(normal)/profile/[handle]/data"
import {cookies} from 'next/headers'
import {redirect} from "next/navigation"
import {getAvatar} from "@/utils"
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

export async function generateMetadata({params, searchParams}: { params: ProfilePageParams, searchParams: ProfilePageSearchParams }) {
    const data = await ProfileData({params, searchParams, cookies: cookies()})
    if (!data.profile) {
        redirect('/error')
    } else {
        return {
            title: `${data.profile.nickname || data.profile.handle} | Social Layer`
        }
    }
}

export default async function Profile({params, searchParams}: { params: ProfilePageParams, searchParams: ProfilePageSearchParams }) {
    const {profile, currProfile, isSelf, tab, followings, followers} = await ProfileData({params, searchParams, cookies: cookies()})
    const lang = (await selectLang()).lang

    return <div className="bg-[#f8f8f8] min-h-[100svh] w-full">
        <div className="page-width bg-[#f8f8f8] min-h-[100svh] pl-0 pr-0 pb-12 pt-0 sm:pt-6">
            <div className="flex flex-col items-start sm:flex-row">
                <div className="bg-white w-full sm:w-[375px] mb-3 relative">
                    <img src="/images/profile_bg.png" className="w-full h-[140px]"/>
                    <div className="absolute right-3 top-3">
                        <a href={`/profile/${profile.handle}/edit`} className='flex-row-item-center'>
                            <div className="text-xs">{profile.nickname || profile.handle}</div>
                            <i className="uil-cog text-lg ml-1"/>
                        </a>
                    </div>

                    <div className="px-3 mt-[-40px]">
                        <img src={getAvatar(profile.id, profile.image_url)}
                            className="w-[60px] h-[60px] rounded-full" alt=""/>
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
                        <div className="flex-row-item-center my-2 text-sm">
                            <div className="mr-4"><strong>{followers}</strong> {lang['Followers']}</div>
                            <div className="mr-4"><strong>{followings}</strong> {lang['Following']}</div>
                        </div>
                        {!!profile.social_links &&
                            <div tabIndex={0}
                                className="inline-block max-h-7 hover:max-h-[200px] transition-all duration-1000 overflow-hidden my-3 cursor-pointer group">
                                <div className="flex flex-row justify-start text-xs group-hover:flex-col">
                                    {Object.keys(profile.social_links).map(key => {
                                        return <div key={key}
                                            className="flex-row-item-center grow-0 shrink-0">
                                            <i className={`${Media_Meta[key as keyof Solar.SocialMedia].icon} text-lg mr-1`}/>
                                            { Media_Meta[key as keyof Solar.SocialMedia].valueType === 'url' ?
                                                <a href={profile.social_links[key as keyof Solar.SocialMedia]!}
                                                    className="group-hover:inline hidden hover:underline"
                                                    target="_blank">{profile.social_links[key as keyof Solar.SocialMedia]}</a>
                                                : <a className="group-hover:inline hidden hover:underline">
                                                    <CopyText
                                                        value={profile.social_links[key as keyof Solar.SocialMedia]}>
                                                        {profile.social_links[key as keyof Solar.SocialMedia]}
                                                    </CopyText>
                                                </a>
                                            }
                                        </div>
                                    })
                                    }
                                </div>
                            </div>
                        }

                        <div className="text-xs mb-3">
                            {profile.about}
                        </div>

                        <a href="/send-badge"
                            className={`${buttonVariants({variant: 'special'})} w-full my-4`}>
                            <i className="uil-message mr-1 text-xl"/>
                            <span>{lang['Send a badge']}</span>
                        </a>
                    </div>
                </div>

                <div className="flex-1 sm:ml-6 px-3">
                    <div className="tab-titles">
                        <a className={buttonVariants({variant: tab === 'groups' ? 'normal' : 'ghost'})}
                            href={`/profile/${profile.handle}?tab=groups`}>
                            <span className="font-normal">{lang['Groups']}</span>
                        </a>
                        <a className={buttonVariants({variant: tab === 'events' ? 'normal' : 'ghost'})}
                            href={`/profile/${profile.handle}?tab=events`}>
                            <span className="font-normal"> {lang['Events']}</span>
                        </a>
                        <a className={buttonVariants({variant: tab === 'badges' ? 'normal' : 'ghost'})}
                            href={`/profile/${profile.handle}?tab=badges`}>
                            <span className="font-normal">{lang['Badges']}</span>
                        </a>
                        { isSelf &&
                            <a className={buttonVariants({variant: tab === 'sending' ? 'normal' : 'ghost'})}
                                href={`/profile/${profile.handle}?tab=sending`}>
                                <span className="font-normal"> {lang['Sending']}</span>
                            </a>
                        }
                    </div>

                    <div className="tab-contents">
                        {tab === 'groups' && <TabGroups profile={profile}/>}

                        {tab === 'events' && <TabEvents handle={profile.handle} currUserHandle={currProfile?.handle} />}

                        {tab === 'badges' && <TabBadges handle={profile.handle}
                            isSelf={isSelf} />
                        }

                        {tab === 'sending' && <TabVouchers handle={profile.handle} />}
                    </div>
                </div>
            </div>
        </div>
    </div>
}