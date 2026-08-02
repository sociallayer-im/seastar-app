import CardEvent from "@/components/CardEvent"
import {selectLang} from "@/app/actions"
import {EventWithJoinStatus, FedEvent} from '@sola/sdk'
import NoData from '@/components/NoData'
import NavTabs from '@/components/client/NavTabs'
import Dayjs from '@/libs/dayjs'

export default async function MyEvents({events, tab, remoteEvents = []}: {
    events: EventWithJoinStatus[],
    tab: string,
    /**
     * Events on other servers this user has asked to join. Kept in their own
     * section rather than mixed into the list above: they are mirrors of
     * records another server owns, a join here may still be unconfirmed, and
     * CardEvent's contract is the local Event shape.
     */
    remoteEvents?: FedEvent[]
}) {
    const {lang} = await selectLang()

    return (
        <div className="page-width min-h-[100svh] !pt-3 !sm:pt-6">
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
                        {/* Both lists, or the "nothing here" is a lie on a page
                            showing remote events. */}
                        {!events.length && !remoteEvents.length && <NoData />}
                        {events.map((event) => (
                            <CardEvent
                                lang={lang}
                                key={event.id}
                                event={event}
                                className="hover:shadow-md"
                            />
                        ))}
                    </div>

                    {!!remoteEvents.length && <div className="mt-8">
                        <h2 className="font-semibold mb-1">{lang['From other servers']}</h2>
                        <div className="grid gap-3">
                            {remoteEvents.map(event => {
                                const start = event.start_time
                                    ? Dayjs(event.start_time).tz(event.timezone || undefined)
                                    : null
                                return <a key={event.id} href={`/fediverse/${event.id}`}
                                          className="border rounded-lg p-4 hover:shadow-md block">
                                    <div className="font-semibold truncate">
                                        {event.status === 'CANCELLED' &&
                                            <span className="text-red-500 mr-1">{lang['Cancelled']}</span>}
                                        {event.title}
                                    </div>
                                    <div className="text-sm text-secondary-foreground">
                                        {start ? start.format('MMM D, YYYY HH:mm') : ''}
                                        {event.timezone ? ` (${event.timezone})` : ''}
                                    </div>
                                    <div className="text-xs text-secondary-foreground mt-1 truncate">
                                        {lang['from']} @{event.origin?.acct || event.uri}
                                        {' · '}
                                        {event.my_status === 'attending' ? lang['Going'] : lang['Requested']}
                                    </div>
                                </a>
                            })}
                        </div>
                    </div>}
                </NavTabs>
            </div>
        </div>
    )
}
