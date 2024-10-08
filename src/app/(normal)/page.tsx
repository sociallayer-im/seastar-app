import {selectLang} from '@/app/actions'
import {redirect} from "next/navigation"


export default async function Home() {
    const lang = (await selectLang()).lang

    redirect('https://www.sola.day')

    return <div className="w-full min-h-[calc(100svh-48px)] flex flex-row justify-center items-center relative z-10">
        <div className="w-[360px] mx-auto p-4">
            <div className="font-semibold mb-6 text-lg">{lang['Sign In']}</div>
        </div>
    </div>
}
