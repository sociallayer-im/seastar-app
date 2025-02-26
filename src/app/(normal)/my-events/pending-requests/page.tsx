import MyEventsPendingRequestPageData from '@/app/(normal)/my-events/pending-requests/data'
import {selectLang} from '@/app/actions'
import {buttonVariants} from '@/components/shadcn/Button'
import CardEvent from '@/components/CardEvent'
import ApprovalBtn from '@/app/(normal)/my-events/pending-requests/ApprovalBtn'
import RejectBtn from '@/app/(normal)/my-events/pending-requests/RejectBtn'
import NoData from '@/components/NoData'

export default async function MyEventsPage() {
    const {pendingRequests: events} = await MyEventsPendingRequestPageData()
    const {lang} = await selectLang()

    return (
        <div className="page-width min-h-[100svh] !pt-3 !sm:pt-6">
            <div className="container py-6">
                <h1 className="text-2xl font-bold mb-6">{lang['My Events']}</h1>

                <div className="flex gap-2 mb-6">
                    <a
                        className={`${buttonVariants({size: 'sm', variant: 'ghost'})}`}
                        href="/my-events/attended">
                        {lang['Attended']}
                    </a>
                    <a
                        className={`${buttonVariants({size: 'sm', variant: 'ghost'})}`}
                        href="/my-events/hosting">
                        {lang['Hosting']}
                    </a>
                    <a
                        className={`${buttonVariants({size: 'sm', variant: 'ghost'})}`}
                        href="/my-events/stared">
                        {lang['Starred']}
                    </a>
                    <a
                        className={`${buttonVariants({
                            size: 'sm',
                            variant: 'ghost'
                        })}`}
                        href="/my-events/co-hosting">
                        {lang['Co-hosting']}
                    </a>
                    <a
                        className={`${buttonVariants({size: 'sm', variant: 'normal'})}`}
                        href="/my-events/pending-requests">
                        {lang['Pending Requests']}
                    </a>
                </div>

                <div className="grid gap-4">
                    {!events.length && <NoData />}
                    {events.map((event) => (
                        <CardEvent
                            lang={lang}
                            key={event.id}
                            event={event}
                            className="hover:shadow-md"
                            additionalElement={<div className="flex-row-item-center mt-4">
                                <RejectBtn variant={'secondary'} size={'xs'} eventId={event.id}
                                           langPkg={lang}
                                           className="text-sm w-20 mr-3">
                                    {lang["Reject"]}
                                </RejectBtn>
                                <ApprovalBtn variant={'primary'} size={'xs'}
                                             langPkg={lang}
                                             eventId={event.id}
                                             className="text-sm w-20">
                                    {lang["Publish"]}
                                </ApprovalBtn>
                            </div>}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
