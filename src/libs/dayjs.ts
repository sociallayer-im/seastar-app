import dayjs, {Dayjs} from 'dayjs'

import updateLocale from 'dayjs/plugin/updateLocale'
import timezone from 'dayjs/plugin/timezone'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import utc from 'dayjs/plugin/utc'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'


dayjs.extend(updateLocale)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)
dayjs.extend(advancedFormat)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.updateLocale('en', {weekStart: 1})

export type DayjsType = Dayjs

export default dayjs
