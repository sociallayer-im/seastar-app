import { getCurrProfile, selectLang } from "@/app/actions"
import Image from "next/image"
import LangSwitcher from "@/components/client/LangSwitcher"
import ProfileMenu from "@/components/client/ProfileMenu"
import { headers } from "next/headers"

export default async function Header() {
    const { type, lang } = await selectLang()
    const headersList = await headers()

    const currentPath = headersList.get('x-current-path')
    const profile = await getCurrProfile()

    return <header className="w-full h-[48px] shadow sticky top-0 bg-[var(--background)] z-[999]">
        <div className="page-width w-full flex-row-item-center justify-between items-center h-[48px]">
            <div className="flex-row-item-center">
                <a href="/">
                    <Image src="/images/logo_horizontal.svg" width={102} height={32} alt="Social Layer" />
                </a>
                <a href="/discover"
                    className={`ml-3 text-xs font-semibold ${currentPath?.includes('discover') ? 'text-primary' : ''}`}>
                    {lang['Discover']}
                </a>
                {!!profile && (
                    <a href="/my-events/registered"
                        className={`ml-3 text-xs font-semibold ${currentPath?.includes('/my-events/') ? 'text-primary' : ''}`}>
                        {lang['My Events']}
                    </a>
                )
                }
            </div>
            <div className="flex-row-item-center text-xs">
                <a href="/search">
                    <i className="uil-search text-sm" />
                </a>
                <span className="w-[0.5px] h-3 bg-gray-400 mx-2" />
                <div className="cursor-pointer">
                    <LangSwitcher value={type} refresh={true} />
                </div>
                <span className="w-[0.5px] h-3 bg-gray-400 mx-2" />
                {
                    !profile ?
                        <a className="cursor-pointer flex-row-item-center btn btn-ghost btn-sm text-xs font-normal px-1"
                            href={`${process.env.NUXT_SIGNIN_URL}?return=${currentPath}`}>
                            <i className="uil-wallet text-base mr-1" />
                            <span>Sign In</span>
                        </a> :
                        <ProfileMenu profile={profile} />
                }
            </div>
        </div>
    </header>
}
