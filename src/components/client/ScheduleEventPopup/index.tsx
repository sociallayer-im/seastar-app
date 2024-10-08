export default function ScheduleEventPopup({event} : {event: Solar.Event}) {
    return <div className="shadow bg-[--background] p-4 rounded-lg">
        {event.title}
    </div>
}
