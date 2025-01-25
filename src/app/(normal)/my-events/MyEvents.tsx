import {buttonVariants} from "@/components/shadcn/Button"
import CardEvent from "@/components/CardEvent"
import {selectLang} from "@/app/actions"
import {EventWithJoinStatus} from '@/utils'

export default async function MyEvents({events, tab}: { events: EventWithJoinStatus[], tab: string }) {
    const {lang} = await selectLang()

    return (
        <div className="page-width min-h-[100svh] !pt-3 !sm:pt-6">
            <div className="container py-6">
                <h1 className="text-2xl font-bold mb-6">{lang['My Events']}</h1>

                <div className="flex gap-2 mb-6">
                    <a
                        className={`${buttonVariants({size: 'sm', variant: tab === 'attended' ? 'normal' : 'ghost'})}`}
                        href="/my-events/attended">
                        {lang['Attended']}
                    </a>
                    <a
                        className={`${buttonVariants({size: 'sm', variant: tab === 'hosting' ? 'normal' : 'ghost'})}`}
                        href="/my-events/hosting">
                        {lang['Hosting']}
                    </a>
                    <a
                        className={`${buttonVariants({size: 'sm', variant: tab === 'stared' ? 'normal' : 'ghost'})}`}
                        href="/my-events/stared">
                        {lang['Stared']}
                    </a>
                    <a
                        className={`${buttonVariants({size: 'sm', variant: tab === 'pending' ? 'normal' : 'ghost'})}`}
                        href="/my-events/pending-requests">
                        {lang['Pending Requests']}
                    </a>
                    <a
                        className={`${buttonVariants({
                            size: 'sm',
                            variant: tab === 'co-hosting' ? 'normal' : 'ghost'
                        })}`}
                        href="/my-events/co-hosting">
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
