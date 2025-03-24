import {selectLang} from '@/app/actions'
import RegisterForm from './RegisterForm'

export default async function Register({searchParams}:{searchParams: {'create-popup-city'?: string | string[]}}) {
    const lang = (await selectLang()).lang

    const returnPage = searchParams['create-popup-city'] ? `/popup-city/create` : undefined

    return <div>
        <div className="absolute left-0 top-0 w-full h-[400px] opacity-[0.3] pointer-events-none"
            style={{background: 'linear-gradient(180deg, #9efedd, rgba(237, 251, 246, 0))'}} />
        <div className="w-full min-h-[calc(100svh-48px)] flex flex-row justify-center items-center relative z-10">
            <div className="w-full max-w-[500px] mx-auto p-4">
                <div className="font-semibold text-2xl">{lang['Set a unique group name']}</div>
                <div className="text-sm text-gray-500 my-2">
                    <ul className="pl-4">
                        <li className="list-disc">{lang['Contain the English-language letters a-z and the digits 0-9']}</li>
                        <li className="list-disc">{lang['Hyphens can also be used but it can not be used at the beginning and at the end']}</li>
                        <li className="list-disc">{lang['Should be equal or longer than 6 characters']}</li>
                    </ul>
                </div>
                <div className="my-4">
                    <RegisterForm lang={lang} returnPage={returnPage}/>
                </div>
            </div>
        </div>
    </div>
}
