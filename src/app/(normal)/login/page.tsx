import {selectLang} from '@/app/actions'
import LoginForm from '@/app/(normal)/login/LoginForm'

export default async function LoginPage() {
    const {lang} = await selectLang()

    return <div className="min-h-[calc(100svh-48px)] w-full flex flex-col justify-center items-center">
        <div className="max-w-[400px] w-full px-4">
            <LoginForm lang={lang}/>
        </div>
    </div>
}
