'use client'

import {EventDetail, ProfileDetail} from '@sola/sdk'
import {Dictionary} from '@/lang'
import {Button} from '@/components/shadcn/Button'
import useModal from '@/components/client/Modal/useModal'
import DialogTicket from '@/components/client/DialogTicket'
import {goToEventTab} from '@/app/(normal)/event/detail/[eventid]/EventTabs'

/**
 * "Join Event (RSVP)" for a ticketed event.
 *
 * This used to be a plain link to `?tab=tickets` — the same page with a query
 * parameter, so pressing it looked exactly like a page reload while the ticket
 * list it revealed sat below the fold. Buyers read that as the button being
 * broken, which on CN it effectively was: nothing on the way to paying gave
 * any sign of having worked.
 *
 * With one ticket type there is nothing to choose, so it opens the purchase
 * dialog directly. With several, choosing is the point and it still goes to
 * the tab.
 *
 * Signed-out visitors are deliberately let through: DialogTicket shows a
 * sign-in button in place of the price, which explains what to do next better
 * than a button that ignores the click.
 */
export default function JoinTicketEventBtn({eventDetail, lang, currProfile, className}: {
    eventDetail: EventDetail
    lang: Dictionary
    currProfile?: ProfileDetail | null
    className?: string
}) {
    const {openModal} = useModal()
    const tickets = eventDetail.tickets || []

    const onClick = () => {
        if (tickets.length !== 1) {
            // Same page — switch the tab and scroll to it rather than
            // navigating to a URL that differs only by a query parameter.
            goToEventTab('tickets')
            return
        }

        openModal({
            content: (close) => <DialogTicket
                eventDetail={eventDetail}
                ticket={tickets[0]}
                lang={lang}
                currProfile={currProfile}
                close={close!}
            />,
            clickOutsideToClose: true
        })
    }

    return <Button variant={'special'} className={className} onClick={onClick}>
        {lang['Join Event(RSVP)']}
    </Button>
}
