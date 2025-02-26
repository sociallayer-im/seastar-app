'use client'

import {Dictionary} from '@/lang'
import {getEventByRecurringId, Recurring, Event} from '@sola/sdk'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {buttonVariants} from '@/components/shadcn/Button'
import DisplayDateTime from '@/components/client/DisplayDateTime'
import {CLIENT_MODE} from '@/app/config'

export interface RecurringListBtnProps {
    recurring: Recurring
    lang: Dictionary
    currEventId?: number
}

export default function RecurringListBtn({recurring, lang, currEventId}: RecurringListBtnProps) {
    const {openModal, showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const showDialog = async () => {
        const loading = showLoading()
        try {
            const recurringEvents = await getEventByRecurringId({
                params: {recurringId: recurring.id},
                clientMode: CLIENT_MODE
            })
            openModal({
                content: (close) => <DialogRecurringList
                    events={recurringEvents}
                    lang={lang}
                    close={close!}
                    currEventId={currEventId}/>,
            })
            closeModal(loading)
        } catch (e: unknown) {
            console.error(e)
            closeModal(loading)
            toast({
                description: 'Failed to load recurring events',
                variant: 'destructive'
            })
        }
    }

    return <div onClick={showDialog}
                className="text-xs cursor-pointer flex-row-item-center text-blue-400">
        {`${lang['Repeating Events']} ,${lang['every']}${lang[recurring.interval as keyof Dictionary]}`}
    </div>
}

interface DialogRecurringListProps {
    events: Event[],
    currEventId?: number,
    lang: Dictionary,
    close: () => void
}

function DialogRecurringList({events, lang, currEventId, close}: DialogRecurringListProps) {
    return <div className="w-[350px] h-auto max-h-[90svh] overflow-auto p-3 shadow rounded-lg bg-white">
        <div className="flex-row-item-center justify-between mb-3">
            <div className="font-semibold text-lg">{lang['Repeating Events']}</div>
            <i className="uil-times-circle cursor-pointer text-xl text-gray-500" onClick={close}/>
        </div>
        <div className="grid grid-cols-1 gap-1">
            {events.map((event) => {
                const color = currEventId === event.id ? '!text-primary-foreground' : '!text-foreground'
                return <a className={`${buttonVariants({variant: 'secondary'})} ${color}`}
                          href={`/event/detail/${event.id}`}
                          key={event.id}>
                    <div className="flex-row-item-center">
                        <DisplayDateTime dataTimeStr={event.start_time} tz={event.timezone}/>
                    </div>
                </a>
            })
            }
        </div>
    </div>
}