import { getCurrProfile, selectLang } from "@/app/actions"
import Image from "next/image"
import LangSwitcher from "@/components/client/LangSwitcher"
import ProfileMenu from "@/components/client/ProfileMenu"
import { headers } from "next/headers"
import HeaderSearchBar from "@/components/client/HeaderSearchBar"

export default async function Header() {
    const { type, lang } = await selectLang()
    const headersList = headers()

    const currentPath = headersList.get('x-current-path')
    const profile = await getCurrProfile()

    return <header className="w-full h-[48px] shadow sticky top-0 bg-[var(--background)] z-[999]">
        <div className="page-width w-full flex-row-item-center justify-between items-center h-[48px]">
            <div className="flex-row-item-center">
                <a href="/" className="sm:block hidden">
                    <Image src="/images/logo_horizontal.svg" width={102} height={32} alt="Social Layer"/>
                </a>
                <a href="/" className="sm:hidden block">
                    <Image src="/images/header_logo.svg" width={32} height={32} alt="Social Layer"/>
                </a>
                <a href="/discover"
                   className={`ml-3 text-xs font-semibold ${currentPath?.includes('discover') ? 'text-primary' : ''}`}>
                    {lang['Discover']}
                </a>
                {!!profile && <a href="/my-events/attended"
                                 className={`ml-3 text-xs font-semibold ${currentPath?.includes('/my-events/') ? 'text-primary' : ''}`}>
                    {lang['My Events']}
                </a>}
            </div>
            <div className="flex-row-item-center text-xs relative">
                <HeaderSearchBar lang={lang} />
                <span className="w-[0.5px] h-3 bg-gray-400 mx-2" />
                <div className="cursor-pointer">
                    <LangSwitcher value={type} refresh={true} />
                </div>
                <span className="w-[0.5px] h-3 bg-gray-400 mx-2" />
                {
                    !profile ?
                        <a className="cursor-pointer flex-row-item-center btn btn-ghost btn-sm text-xs font-normal px-1"
                            href={`${process.env.NEXT_PUBLIC_SIGN_IN_URL}?return=${encodeURIComponent(currentPath!)}`}>
                            <i className="uil-wallet text-base mr-1" />
                            <span>{lang['Sign In']}</span>
                        </a>
                        :<ProfileMenu profile={profile} />
                }
            </div>
        </div>
    </header>
}
