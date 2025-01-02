import { buttonVariants } from "@/components/shadcn/Button"
import CardEvent from "@/components/CardEvent"
import { GroupEventListData } from "@/app/(normal)/group/[handle]/TabEvents/data"
import {selectLang} from "@/app/actions"


export default async function MyEventsPage() {
    const events = await GroupEventListData('playground2')
    const {lang} = await selectLang()

    return (
        <div className="page-width min-h-[100svh] !pt-3 !sm:pt-6">
            <div className="container py-6">
                <h1 className="text-2xl font-bold mb-6">My events</h1>

                <div className="flex gap-2 mb-6">
                    <a
                        className={`${buttonVariants({ size: 'sm' })}`}
                        href="/my-event/registered"
                    >
                        {lang['Registered']}
                    </a>
                    <a
                        className={`${buttonVariants({ size: 'sm', variant: 'ghost' })}`}
                        href="/my-event/created">
                        {lang['Created']}
                    </a>
                    <a
                        className={`${buttonVariants({ size: 'sm', variant: 'ghost' })}`}
                        href="/my-event/star">
                        {lang['Star']}
                    </a>
                    <a
                        className={`${buttonVariants({ size: 'sm', variant: 'ghost' })}`}
                        href="/my-event/pending-requests">
                        {lang['Pending Requests']}
                    </a>
                    <a
                        className={`${buttonVariants({ size: 'sm', variant: 'ghost' })}`}
                        href="/my-event/cohosting">
                        {lang['Co-hosting']}
                    </a>
                </div>

                <div className="grid gap-4">
                    {events.map((event) => (
                        <CardEvent
                            key={event.id}
                            event={event}
                            className="hover:shadow-md"
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
