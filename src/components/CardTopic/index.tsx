'use client'

import {getLabelColor} from '@/utils/label_color'
import {cfImage} from '@/utils'
import {Badge} from '@/components/shadcn/Badge'
import {Dictionary} from '@/lang'
import {Topic} from '@sola/sdk'
import Img from '@/components/Img'
import Avatar from '@/components/Avatar'
import StarDiscussionBtn from '@/components/client/StarDiscussionBtn'
import dynamic from 'next/dynamic'
import Link from 'next/link'

// ssr: false because a locale-formatted date cannot survive hydration — see
// the note in LocalTime.
const DynamicLocalTime = dynamic(() => import('@/components/client/LocalTime'), {ssr: false})

/**
 * A topic in the list, built to sit beside CardEvent without looking like a
 * different product: same shadow/rounding/padding, same xs-breakpoint flip,
 * same colour function for tags.
 *
 * The one deliberate divergence is the cover. CardEvent composes a fallback
 * image out of title + time + place when an event has none; a topic has
 * neither time nor place, so the same fallback would be a grey rectangle with
 * a title already displayed two lines to its left. Better to give that 140px
 * back to the text.
 */
export default function CardTopic({topic, href, lang}: {
    topic: Topic,
    href: string,
    lang: Dictionary
}) {
    const author = topic.user?.nickname || topic.user?.name

    return <Link href={href}
        className="overflow-hidden relative shadow-sm flex rounded-lg p-3 xs:flex-row flex-col flex-nowrap bg-background duration-200 hover:scale-[1.02]">
        <div className="flex-1 mr-2 order-2 xs:order-1">
            <div className="flex-row-item-center flex-wrap scale-90 sm:scale-100 origin-top-left">
                {topic.pinned && <Badge variant="upcoming" className="mr-1">{lang['Pinned']}</Badge>}
                {topic.closed && <Badge variant="past" className="mr-1">{lang['Locked']}</Badge>}
                {/* Only ever reaches the author and managers — everyone else is
                    not served a flagged topic at all. */}
                {topic.flagged && <Badge variant="private" className="mr-1">{lang['Hidden']}</Badge>}
            </div>

            <div className="my-1 font-semibold text-sm sm:text-base webkit-box-clamp-2">
                {topic.title}
            </div>

            <div className="flex-row-item-center flex-wrap! text-xs mt-1 mb-2">
                {topic.tags?.filter(tag => !tag.startsWith(':')).map((tag, i) =>
                    <div key={i} className="flex-row-item-center mr-2 shrink-0">
                        <i className="w-2 h-2 rounded-full mr-1" style={{background: getLabelColor(tag)}}/>
                        <span>{tag}</span>
                    </div>
                )}
            </div>

            <div className="flex flex-col text-xs sm:text-sm my-1">
                {!!topic.category &&
                    <div className="flex-row-item-center gap-1">
                        <span style={{color: getLabelColor(topic.category.name)}}>{topic.category.name}</span>
                        {topic.category.visibility !== 'public' &&
                            <i className="uil-lock text-xs text-gray-400"/>}
                    </div>
                }
                <div className="flex-row-item-center gap-1 text-gray-500">
                    <Avatar profile={topic.user} size={16}/>
                    <span>{author}</span>
                </div>
            </div>

            <div className="min-h-6 flex-row-item-center text-xs sm:text-sm gap-3 text-gray-500">
                <span className="flex-row-item-center">
                    <i className="uil-comment-alt-lines mr-1 text-sm"/>
                    {topic.replies_count}
                </span>
                <StarDiscussionBtn itemType="Topic" itemId={topic.id}
                    starred={topic.is_starred} count={topic.stars_count}/>
                {!!topic.replied_at &&
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                        {lang['Last reply']}: <DynamicLocalTime value={topic.replied_at} dateOnly/>
                    </span>
                }
            </div>
        </div>

        {/* No placeholder when there is no image — see the note above. */}
        {!!topic.image_url &&
            <div className="sm:w-[140px] sm:h-[140px] shrink-0 grow-0 w-[100px] h-[100px] order-1 xs:order-2 xs:mb-0 mb-2">
                <Img className="w-full h-full object-cover"
                    src={cfImage(topic.image_url, {width: 280, height: 280, fit: 'cover'})} alt=""/>
            </div>
        }
    </Link>
}
