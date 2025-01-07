
import {selectLang} from "@/app/actions"
import {Button} from "@/components/shadcn/Button"
import TimezoneForm from "@/app/(normal)/event/[grouphandle]/timezone/TimezoneFomr"

export default async function GroupTracksPage() {
    const {lang} = await selectLang()

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width min-h-[calc(100svh-48px)] px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Timezone']}</div>
            <div className="mb-4">
                {lang['Default time zone for group event, but you can still change it when creating the event. If keep it blank, the default time zone will follow the operating system.']}
            </div>

            <div>
                <TimezoneForm />
            </div>

            <div className="mt-6 flex-row-item-center ">
                <Button variant={'secondary'} className="mr-3">{lang['Cancel']}</Button>
                <Button variant={'primary'} className="mr-3">{lang['Save']}</Button>
            </div>
        </div>
    </div>
}