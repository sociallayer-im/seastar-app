'use client'

/**
 * A timestamp in the reader's own locale and timezone.
 *
 * `toLocaleString()` cannot be rendered on the server: Node formats with the
 * server's locale ("8/17/2026, 12:17:43 PM") and the browser re-formats with
 * the visitor's ("2026/8/17 12:17"), which React reports as a hydration
 * mismatch and then re-renders the whole subtree client-side to recover.
 *
 * So this is only ever mounted through `dynamic(..., {ssr: false})`. It renders
 * nothing on the server, and the placeholder holds the line's height so the
 * text beside it does not jump when the real value arrives.
 *
 * The same reason FormatEventDuration is loaded that way on the event cards.
 */
export default function LocalTime({value, dateOnly}: {
    value: string,
    /** Just the date — enough for "last reply", where the minute is noise. */
    dateOnly?: boolean
}) {
    const date = new Date(value)
    if (isNaN(date.getTime())) return null

    return <>{dateOnly ? date.toLocaleDateString() : date.toLocaleString()}</>
}
