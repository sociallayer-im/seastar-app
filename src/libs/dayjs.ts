import dayjs, {Dayjs} from 'dayjs'

// Registers 'zh' with dayjs so `.locale('zh')` (called per-instance, never as
// the global `dayjs.locale('zh')`) can render weekday/month names in Chinese.
// Importing it here only registers it — it does not change the default
// locale, which matters because dayjs's default locale is process-global and
// this app serves concurrent requests in different languages.
import 'dayjs/locale/zh'
import updateLocale from 'dayjs/plugin/updateLocale'
import timezone from 'dayjs/plugin/timezone'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import utc from 'dayjs/plugin/utc'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isBetween from 'dayjs/plugin/isBetween'
import calendar from 'dayjs/plugin/calendar'
import duration from 'dayjs/plugin/duration'

dayjs.extend(calendar)
dayjs.extend(updateLocale)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)
dayjs.extend(advancedFormat)
dayjs.extend(utc)
dayjs.extend(isBetween)
dayjs.extend(timezone)
dayjs.updateLocale('en', {weekStart: 1})
dayjs.extend(duration)

export type DayjsType = Dayjs

export default dayjs
