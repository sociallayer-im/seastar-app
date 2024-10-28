import {getCurrProfile, selectLang} from "@/app/actions"
import Image from "next/image"
import LangSwitcher from "@/components/client/LangSwitcher"
import ProfileMenu from "@/components/client/ProfileMenu"
import {headers} from "next/headers"

export default async function Header() {
    const langType = (await selectLang()).type
    const headersList = await headers()

    const returnPath = headersList.get('x-current-path')
    const profile = await getCurrProfile()



    return <header className="w-full h-[48px] shadow sticky top-0 bg-[var(--background)] z-[999]">
        <div className="page-width w-full flex-row-item-center justify-between items-center h-[48px]">
            <div className="flex-row-item-center">
                <a href="/">
                    <Image src="/images/logo_horizontal.svg" width={102} height={32} alt="Social Layer"/>
                </a>
            </div>
            <div className="flex-row-item-center text-xs">
                <a href="/search"><i className="uil-search text-base"></i></a>
                <span className="w-[1px] h-3 bg-gray-400 mx-2"></span>
                <div className="cursor-pointer">
                    <LangSwitcher value={langType} refresh={true}/>
                </div>
                <span className="w-[1px] h-3 bg-gray-400 mx-2"></span>
                {
                    !profile ?
                        <a className="cursor-pointer flex-row-item-center btn btn-ghost btn-sm text-xs font-normal px-1"
                            href={`${process.env.NUXT_SIGNIN_URL}?return=${returnPath}`}>
                            <i className="uil-wallet text-base" />
                            <span>Sign In</span>
                        </a> :
                        <ProfileMenu profile={profile} />
                }
            </div>
        </div>
    </header>
}
