import {selectLang} from '@/app/actions'
import {headers} from "next/headers"


export default async function Home(props: {test?: string}) {
    console.log('props', props)
    const lang = (await selectLang()).lang
    console.log('headers()', headers())

    return <div className="w-full min-h-[calc(100svh-48px)] flex flex-row justify-center items-center relative z-10">
        <div className="w-[360px] mx-auto p-4">
            <div className="font-semibold mb-6 text-lg">{lang['Sign In']}</div>
        </div>
    </div>
}
