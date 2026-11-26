import CardEvent from "@/components/CardEvent"
import {selectLang} from "@/app/actions"
import {EventWithJoinStatus} from '@sola/sdk'
import NoData from '@/components/NoData'
import NavTabs from '@/components/client/NavTabs'
import CancelRegistrationBtn from '@/components/client/CancelRegistrationBtn'

export default async function MyEvents({events, tab}: { events: EventWithJoinStatus[], tab: string }) {
    const {lang} = await selectLang()

    return (
        <div className="page-width min-h-svh pt-3! !sm:pt-6">
            <div className="container py-6">
                <h1 className="text-2xl font-bold mb-6">{lang['My Events']}</h1>

                {/* These tabs are sibling routes, so each already fetches only
                    its own list. They were plain links, though, so picking one
                    reloaded the document. */}
                <NavTabs
                    className="mb-6"
                    current={tab}
                    tabs={[
                        {key: 'attended', label: lang['Attended'], href: '/my-events/attended'},
                        {key: 'hosting', label: lang['Hosting'], href: '/my-events/hosting'},
                        {key: 'stared', label: lang['Starred'], href: '/my-events/stared'},
                        {key: 'co-hosting', label: lang['Co-hosting'], href: '/my-events/co-hosting'},
                        {key: 'pending', label: lang['Pending Requests'], href: '/my-events/pending-requests'}
                    ]}>
                    <div className="grid gap-4">
                        {!events.length && <NoData />}
                        {events.map((event) => (
                            <div key={event.id}>
                                <CardEvent lang={lang} event={event} className="hover:shadow-md" />
                                {tab === 'attended' && event.is_attending &&
                                    <div className="mt-2 flex justify-end">
                                        <CancelRegistrationBtn lang={lang} kind="participation"
                                            eventId={event.id} className="text-xs" />
                                    </div>}
                            </div>
                        ))}
                    </div>
                </NavTabs>
            </div>
        </div>
    )
}
