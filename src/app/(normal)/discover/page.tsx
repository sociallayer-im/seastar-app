import DiscoverPageData from '@/app/(normal)/discover/data'
import Image from 'next/image'
import {displayProfileName} from '@/utils'
import Avatar from '@/components/Avatar'
import {selectLang} from '@/app/actions'
import SelectedBadgeWannaSend from '@/components/client/SelectedBadgeWannaSend'
import Footer from '@/components/Footer'
import Feedback from '@/components/client/Feedback'
import DisplayDateTime from '@/components/client/DisplayDateTime'
import PopupCityMap from './PopupCityMap'

export async function generateMetadata() {
    return {
        title: 'Discover | Social Layer',
        openGraph: {
            title: 'Discover | Social Layer',
            images: '/images/facaster_default_cover.png',
        }
    }
}

export default async function DiscoverPage() {
    const {eventGroups, popupCities, events, currProfile, popupCityMap} = await DiscoverPageData()
    const {lang, type} = await selectLang()

    const mapMarkers = popupCityMap.map((event) => {
        return {
            position: {lat: Number(event.geo_lat), lng: Number(event.geo_lng)},
            title: event.title
        }
    })

    return <div className="page-width min-h-[100svh] pt-4 sm:pt-6 !pb-16">
        <PopupCityMap mapMarkers={mapMarkers} lang={lang}  langType={type}/>

        <div>
            <h2 className="text-2xl font-semibold mb-3 md:flex-row flex items-center justify-between flex-col">
                <div>{lang['Pop-up Cities']}</div>
                <a href="/popup-city" className="flex-row-item-center text-sm">
                    <span>{lang['See all Pop-up Cities events']}</span>
                    <i className="uil-arrow-right text-2xl ml-1"/>
                </a>
            </h2>
            <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-2">
                {popupCities.map((popupCity, index) => {
                    return <a key={index} href={`/event/${popupCity.group.handle}`}
                              className="h-[292px] rounded shadow p-3 duration-200 hover:translate-y-[-6px]">
                        <div className="rounded h-[148px] mb-3">
                            <Image className="object-cover w-full h-full rounded"
                                   width={227} height={148}
                                   src={popupCity.image_url!} alt=""/>
                        </div>
                        <div className="webkit-box-clamp-1 text-xs">
                            <DisplayDateTime format={'MMM DD'}
                                             dataTimeStr={popupCity.start_date!}/>
                            <span className="mx-1">-</span>
                            <DisplayDateTime format={'MMM DD'} dataTimeStr={popupCity.end_date!}/>
                        </div>
                        <div className="webkit-box-clamp-2 text-lg font-semibold leading-5 h-10 mb-4">
                            {popupCity.title}
                        </div>

                        <div className="flex items-end flex-row justify-between">
                            <div className="flex-1">
                                <div className="flex-row-item-center text-xs">
                                    <i className={'uil-location-point mr-0.5'}></i>
                                    <div className="webkit-box-clamp-1">{popupCity.location}</div>
                                </div>
                                <div className="flex-row-item-center text-xs">
                                    <Avatar profile={popupCity.group} size={14} className="mr-0.5"/>
                                    <div className="webkit-box-clamp-1">by {displayProfileName(popupCity.group)}</div>
                                </div>
                            </div>
                            <div
                                className="hidden sm:block whitespace-nowrap text-xs bg-primary py-1.5 px-2 rounded font-semibold ml-1">
                                {lang['View events']}
                            </div>
                        </div>
                    </a>
                })
                }
            </div>
        </div>

        <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-3 md:flex-row flex items-center justify-between flex-col">
                <div>Communities</div>
                <a href="/communities" className="flex-row-item-center text-sm">
                    <span>{lang['See all Communities']}</span>
                    <i className="uil-arrow-right text-2xl ml-1"/>
                </a>
            </h2>

            <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-2">
                {eventGroups.map((group, index) => {
                    return <a key={index} href={`/group/${group.handle}`}
                              className="h-[200px] rounded shadow p-3 duration-200 hover:translate-y-[-6px]">
                        <Avatar profile={group} size={64} className="object-cover"/>
                        <div className="webkit-box-clamp-2 text-lg font-semibold leading-5 h-10 mb-4 mt-2">
                            {displayProfileName(group)}
                        </div>

                        <div className="text-sm"><strong className="mr-1">
                            {(group as any).memberships_count}</strong>{lang['Members']}</div>
                        <div className="text-sm"><strong className="mr-1">
                            {(group as any).events_count}</strong>{lang['Events']}</div>
                    </a>
                })
                }
            </div>
        </div>

        <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-3 md:flex-row flex items-center justify-between flex-col">
                <div>{lang['Go to']}</div>
            </h2>

            <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-2">
                {!!currProfile && <>
                    <SelectedBadgeWannaSend lang={lang} profileDetail={currProfile}>
                        <div
                            className="h-[144px] rounded shadow p-4 cursor-pointer duration-200 hover:translate-y-[-6px]"
                            style={{'background': 'linear-gradient(180deg, #F3FFF8 0%, rgba(255, 255, 255, 0.00) 100%)'}}>
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M28.2855 5.38002L24.2855 1.38002C24.1586 1.25863 24.0091 1.16348 23.8455 1.10002C23.5208 0.966661 23.1567 0.966661 22.8321 1.10002C22.6685 1.16348 22.5189 1.25863 22.3921 1.38002L18.3921 5.38002C18.1411 5.63109 18 5.97162 18 6.32668C18 6.68175 18.1411 7.02228 18.3921 7.27335C18.6432 7.52442 18.9837 7.66547 19.3388 7.66547C19.6939 7.66547 20.0344 7.52442 20.2855 7.27335L22.0055 5.54002V11.9934C22.0055 12.347 22.1459 12.6861 22.396 12.9362C22.646 13.1862 22.9852 13.3267 23.3388 13.3267C23.6924 13.3267 24.0316 13.1862 24.2816 12.9362C24.5316 12.6861 24.6721 12.347 24.6721 11.9934V5.54002L26.3921 7.27335C26.5161 7.39832 26.6635 7.49751 26.826 7.56521C26.9885 7.6329 27.1628 7.66775 27.3388 7.66775C27.5148 7.66775 27.6891 7.6329 27.8516 7.56521C28.014 7.49751 28.1615 7.39832 28.2855 7.27335C28.4104 7.1494 28.5096 7.00193 28.5773 6.83945C28.645 6.67698 28.6799 6.5027 28.6799 6.32668C28.6799 6.15067 28.645 5.97639 28.5773 5.81392C28.5096 5.65144 28.4104 5.50397 28.2855 5.38002Z"
                                    fill="#272928"/>
                                <path
                                    d="M15 6C10.5817 6 7 9.58172 7 14C7 18.4183 10.5817 22 15 22C18.7277 22 21.8599 19.4505 22.748 16"
                                    stroke="#272928" strokeWidth="2.5" strokeLinecap="round"/>
                                <path
                                    d="M8.65894 19L4.53375 25.3728C4.31164 25.7159 4.58915 26.1386 5.00899 26.0967L8.61453 25.7369C8.83736 25.7146 9.04533 25.8297 9.12942 26.0218L10.49 29.1301C10.6484 29.492 11.1825 29.5185 11.4046 29.1753L15.5298 22.8026"
                                    stroke="#272928" strokeWidth="2.5"/>
                                <path
                                    d="M21.8708 19L25.996 25.3728C26.2181 25.7159 25.9406 26.1386 25.5208 26.0967L21.9153 25.7369C21.6924 25.7146 21.4845 25.8297 21.4004 26.0218L20.0398 29.1301C19.8814 29.492 19.3473 29.5185 19.1252 29.1753L15 22.8026"
                                    stroke="#272928" strokeWidth="2.5"/>
                            </svg>
                            <div className="text-lg font-semibold mt-2">{lang['Send Badge']}</div>
                        </div>
                    </SelectedBadgeWannaSend>

                    <a href={`/profile/${currProfile.handle}?tab=badges`}
                       className="h-[144px] rounded shadow p-4 duration-200 hover:translate-y-[-6px]"
                       style={{'background': 'linear-gradient(180deg, #FEFFF3 0%, rgba(255, 255, 255, 0.00) 100%)'}}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <path
                                d="M27.8267 23L24.2134 16.76C24.9528 15.402 25.338 13.8796 25.3334 12.3333C25.3334 9.85798 24.3501 7.48401 22.5997 5.73367C20.8494 3.98333 18.4754 3 16.0001 3C13.5247 3 11.1507 3.98333 9.40039 5.73367C7.65005 7.48401 6.66672 9.85798 6.66672 12.3333C6.66213 13.8796 7.04733 15.402 7.78672 16.76L4.17339 23C4.05614 23.2031 3.99452 23.4335 3.99475 23.668C3.99498 23.9025 4.05706 24.1328 4.17471 24.3356C4.29236 24.5385 4.46143 24.7067 4.66486 24.8234C4.8683 24.94 5.09889 25.0009 5.33339 25H9.16006L11.1067 28.28C11.1723 28.3887 11.2532 28.4875 11.3467 28.5733C11.5939 28.8116 11.9234 28.9453 12.2667 28.9467H12.4534C12.6547 28.9191 12.847 28.8459 13.0157 28.7327C13.1844 28.6195 13.325 28.4692 13.4267 28.2933L16.0001 23.8667L18.5734 28.3333C18.6766 28.5067 18.8179 28.6544 18.9865 28.7653C19.1551 28.8761 19.3466 28.9473 19.5467 28.9733H19.7334C20.0813 28.9754 20.4162 28.8414 20.6667 28.6C20.7564 28.519 20.8329 28.4246 20.8934 28.32L22.8401 25.04H26.6667C26.9017 25.0409 27.1327 24.9798 27.3364 24.8627C27.5401 24.7456 27.7093 24.5768 27.8267 24.3733C27.9513 24.166 28.0171 23.9286 28.0171 23.6867C28.0171 23.4447 27.9513 23.2074 27.8267 23V23ZM12.2534 25.04L11.0667 23.0533C10.9499 22.8562 10.7842 22.6926 10.5857 22.5781C10.3872 22.4637 10.1625 22.4023 9.93339 22.4H7.62672L9.53339 19.0933C10.8464 20.3585 12.5011 21.2114 14.2934 21.5467L12.2534 25.04ZM16.0001 19C14.6815 19 13.3926 18.609 12.2963 17.8765C11.1999 17.1439 10.3454 16.1027 9.84086 14.8846C9.33628 13.6664 9.20425 12.3259 9.46149 11.0327C9.71872 9.73952 10.3537 8.55164 11.286 7.61929C12.2184 6.68694 13.4062 6.052 14.6995 5.79476C15.9927 5.53753 17.3331 5.66955 18.5513 6.17414C19.7695 6.67872 20.8106 7.5332 21.5432 8.62953C22.2757 9.72586 22.6667 11.0148 22.6667 12.3333C22.6667 14.1014 21.9643 15.7971 20.7141 17.0474C19.4639 18.2976 17.7682 19 16.0001 19V19ZM22.0667 22.4C21.8376 22.4023 21.6129 22.4637 21.4144 22.5781C21.2159 22.6926 21.0502 22.8562 20.9334 23.0533L19.7467 25.04L17.7201 21.5067C19.506 21.1645 21.1547 20.3124 22.4667 19.0533L24.3734 22.36L22.0667 22.4Z"
                                fill="#272928"/>
                        </svg>
                        <div className="text-lg font-semibold mt-2">My Badge</div>
                    </a>

                    <a href={`/profile/${currProfile.handle}?tab=groups`}
                       className="h-[144px] rounded shadow p-4 duration-200 hover:translate-y-[-6px]"
                       style={{'background': 'linear-gradient(180deg, #F3F7FF 0%, rgba(255, 255, 255, 0.00) 100%)'}}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <path
                                d="M16.4002 16.2932C17.1116 15.6773 17.6822 14.9157 18.0733 14.0599C18.4644 13.2041 18.6668 12.2741 18.6668 11.3332C18.6668 9.56506 17.9645 7.86937 16.7142 6.61913C15.464 5.36888 13.7683 4.6665 12.0002 4.6665C10.2321 4.6665 8.53636 5.36888 7.28612 6.61913C6.03588 7.86937 5.3335 9.56506 5.3335 11.3332C5.33349 12.2741 5.5359 13.2041 5.927 14.0599C6.3181 14.9157 6.88873 15.6773 7.60016 16.2932C5.73368 17.1383 4.15012 18.5032 3.0388 20.2246C1.92749 21.9459 1.33546 23.9509 1.3335 25.9998C1.3335 26.3535 1.47397 26.6926 1.72402 26.9426C1.97407 27.1927 2.31321 27.3332 2.66683 27.3332C3.02045 27.3332 3.35959 27.1927 3.60964 26.9426C3.85969 26.6926 4.00016 26.3535 4.00016 25.9998C4.00016 23.8781 4.84302 21.8433 6.34331 20.343C7.8436 18.8427 9.87843 17.9998 12.0002 17.9998C14.1219 17.9998 16.1567 18.8427 17.657 20.343C19.1573 21.8433 20.0002 23.8781 20.0002 25.9998C20.0002 26.3535 20.1406 26.6926 20.3907 26.9426C20.6407 27.1927 20.9799 27.3332 21.3335 27.3332C21.6871 27.3332 22.0263 27.1927 22.2763 26.9426C22.5264 26.6926 22.6668 26.3535 22.6668 25.9998C22.6649 23.9509 22.0728 21.9459 20.9615 20.2246C19.8502 18.5032 18.2666 17.1383 16.4002 16.2932ZM12.0002 15.3332C11.209 15.3332 10.4357 15.0986 9.77788 14.659C9.12009 14.2195 8.6074 13.5948 8.30465 12.8639C8.00189 12.133 7.92268 11.3287 8.07702 10.5528C8.23136 9.77689 8.61233 9.06415 9.17174 8.50474C9.73115 7.94533 10.4439 7.56437 11.2198 7.41003C11.9957 7.25569 12.8 7.3349 13.5309 7.63765C14.2618 7.9404 14.8865 8.45309 15.326 9.11089C15.7656 9.76869 16.0002 10.542 16.0002 11.3332C16.0002 12.394 15.5787 13.4115 14.8286 14.1616C14.0784 14.9117 13.061 15.3332 12.0002 15.3332ZM24.9868 15.7598C25.8401 14.7989 26.3975 13.6119 26.5919 12.3416C26.7863 11.0713 26.6094 9.77194 26.0825 8.59984C25.5556 7.42774 24.7012 6.4329 23.6221 5.73507C22.543 5.03724 21.2852 4.66616 20.0002 4.6665C19.6465 4.6665 19.3074 4.80698 19.0574 5.05703C18.8073 5.30708 18.6668 5.64622 18.6668 5.99984C18.6668 6.35346 18.8073 6.6926 19.0574 6.94265C19.3074 7.19269 19.6465 7.33317 20.0002 7.33317C21.061 7.33317 22.0784 7.7546 22.8286 8.50474C23.5787 9.25489 24.0002 10.2723 24.0002 11.3332C23.9983 12.0335 23.8126 12.721 23.4616 13.3271C23.1106 13.9331 22.6067 14.4363 22.0002 14.7865C21.8025 14.9005 21.6374 15.0634 21.5206 15.2595C21.4039 15.4556 21.3395 15.6784 21.3335 15.9065C21.3279 16.1329 21.3801 16.3569 21.485 16.5575C21.59 16.7581 21.7444 16.9287 21.9335 17.0532L22.4535 17.3998L22.6268 17.4932C24.234 18.2555 25.5899 19.4612 26.5348 20.9683C27.4797 22.4754 27.9742 24.2211 27.9602 25.9998C27.9602 26.3535 28.1006 26.6926 28.3507 26.9426C28.6007 27.1927 28.9399 27.3332 29.2935 27.3332C29.6471 27.3332 29.9863 27.1927 30.2363 26.9426C30.4864 26.6926 30.6268 26.3535 30.6268 25.9998C30.6377 23.9537 30.1253 21.9388 29.1381 20.1466C28.151 18.3543 26.722 16.8443 24.9868 15.7598Z"
                                fill="#272928"/>
                        </svg>
                        <div className="text-lg font-semibold mt-2">My Groups</div>
                    </a>

                    <a href={`/profile/${currProfile.handle}/edit`}
                       className="h-[144px] rounded shadow p-4 duration-200 hover:translate-y-[-6px]"
                       style={{'background': 'linear-gradient(180deg, #FDF3FF 0%, rgba(255, 255, 255, 0.00) 100%)'}}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <path
                                d="M28.4265 12.7332L25.9065 11.8932L27.0932 9.51984C27.2135 9.27142 27.2537 8.99179 27.2083 8.71954C27.163 8.44728 27.0342 8.19582 26.8398 7.99984L23.9998 5.15984C23.8028 4.96262 23.5489 4.83212 23.2739 4.78668C22.9989 4.74123 22.7165 4.78314 22.4665 4.90651L20.0932 6.09317L19.2532 3.57318C19.1645 3.3105 18.9961 3.08201 18.7714 2.91951C18.5468 2.757 18.2771 2.66857 17.9998 2.66651H13.9998C13.7203 2.66579 13.4476 2.75293 13.2203 2.91563C12.993 3.07833 12.8226 3.30835 12.7332 3.57318L11.8932 6.09317L9.51984 4.90651C9.27142 4.78621 8.99179 4.74598 8.71954 4.79136C8.44728 4.83673 8.19582 4.96548 7.99984 5.15984L5.15984 7.99984C4.96262 8.19686 4.83212 8.45074 4.78668 8.72578C4.74123 9.00082 4.78314 9.28319 4.90651 9.53317L6.09317 11.9065L3.57318 12.7465C3.3105 12.8352 3.08201 13.0036 2.91951 13.2282C2.757 13.4529 2.66857 13.7226 2.66651 13.9998V17.9998C2.66579 18.2794 2.75293 18.552 2.91563 18.7793C3.07833 19.0066 3.30835 19.1771 3.57318 19.2665L6.09317 20.1065L4.90651 22.4798C4.78621 22.7283 4.74598 23.0079 4.79136 23.2801C4.83673 23.5524 4.96548 23.8039 5.15984 23.9998L7.99984 26.8398C8.19686 27.0371 8.45074 27.1676 8.72578 27.213C9.00082 27.2584 9.28319 27.2165 9.53317 27.0932L11.9065 25.9065L12.7465 28.4265C12.836 28.6913 13.0064 28.9214 13.2337 29.0841C13.461 29.2467 13.7336 29.3339 14.0132 29.3332H18.0132C18.2927 29.3339 18.5654 29.2467 18.7927 29.0841C19.02 28.9214 19.1904 28.6913 19.2798 28.4265L20.1198 25.9065L22.4932 27.0932C22.74 27.2104 23.0169 27.249 23.2864 27.2037C23.5559 27.1584 23.8049 27.0314 23.9998 26.8398L26.8398 23.9998C27.0371 23.8028 27.1676 23.5489 27.213 23.2739C27.2584 22.9989 27.2165 22.7165 27.0932 22.4665L25.9065 20.0932L28.4265 19.2532C28.6892 19.1645 28.9177 18.9961 29.0802 18.7714C29.2427 18.5468 29.3311 18.2771 29.3332 17.9998V13.9998C29.3339 13.7203 29.2467 13.4476 29.0841 13.2203C28.9214 12.993 28.6913 12.8226 28.4265 12.7332ZM26.6665 17.0398L25.0665 17.5732C24.6986 17.6925 24.361 17.8905 24.0772 18.1533C23.7935 18.4161 23.5703 18.7376 23.4231 19.0953C23.276 19.453 23.2084 19.8384 23.2251 20.2249C23.2418 20.6113 23.3424 20.9895 23.5198 21.3332L24.2798 22.8532L22.8132 24.3198L21.3332 23.5198C20.9912 23.3495 20.6167 23.2546 20.2349 23.2416C19.8531 23.2285 19.473 23.2977 19.1203 23.4444C18.7675 23.591 18.4504 23.8118 18.1904 24.0916C17.9304 24.3715 17.7335 24.704 17.6132 25.0665L17.0798 26.6665H14.9598L14.4265 25.0665C14.3072 24.6986 14.1092 24.361 13.8464 24.0772C13.5835 23.7935 13.2621 23.5703 12.9044 23.4231C12.5467 23.276 12.1612 23.2084 11.7748 23.2251C11.3884 23.2418 11.0102 23.3424 10.6665 23.5198L9.14651 24.2798L7.67984 22.8132L8.47984 21.3332C8.6573 20.9895 8.75787 20.6113 8.77457 20.2249C8.79127 19.8384 8.7237 19.453 8.57656 19.0953C8.42941 18.7376 8.20621 18.4161 7.92243 18.1533C7.63866 17.8905 7.3011 17.6925 6.93317 17.5732L5.33317 17.0398V14.9598L6.93317 14.4265C7.3011 14.3072 7.63866 14.1092 7.92243 13.8464C8.20621 13.5835 8.42941 13.2621 8.57656 12.9044C8.7237 12.5467 8.79127 12.1612 8.77457 11.7748C8.75787 11.3884 8.6573 11.0102 8.47984 10.6665L7.71984 9.18651L9.18651 7.71984L10.6665 8.47984C11.0102 8.6573 11.3884 8.75787 11.7748 8.77457C12.1612 8.79127 12.5467 8.7237 12.9044 8.57656C13.2621 8.42941 13.5835 8.20621 13.8464 7.92243C14.1092 7.63866 14.3072 7.3011 14.4265 6.93317L14.9598 5.33317H17.0398L17.5732 6.93317C17.6925 7.3011 17.8905 7.63866 18.1533 7.92243C18.4161 8.20621 18.7376 8.42941 19.0953 8.57656C19.453 8.7237 19.8384 8.79127 20.2249 8.77457C20.6113 8.75787 20.9895 8.6573 21.3332 8.47984L22.8532 7.71984L24.3198 9.18651L23.5198 10.6665C23.3495 11.0084 23.2546 11.383 23.2416 11.7648C23.2285 12.1465 23.2977 12.5267 23.4444 12.8794C23.591 13.2322 23.8118 13.5493 24.0916 13.8093C24.3715 14.0693 24.704 14.2661 25.0665 14.3865L26.6665 14.9198V17.0398ZM15.9998 10.6665C14.945 10.6665 13.9139 10.9793 13.0368 11.5653C12.1597 12.1514 11.4762 12.9843 11.0725 13.9589C10.6688 14.9334 10.5632 16.0058 10.769 17.0403C10.9748 18.0749 11.4827 19.0252 12.2286 19.7711C12.9745 20.517 13.9248 21.0249 14.9594 21.2307C15.9939 21.4365 17.0663 21.3309 18.0408 20.9272C19.0154 20.5235 19.8483 19.8399 20.4343 18.9629C21.0204 18.0858 21.3332 17.0547 21.3332 15.9998C21.3332 14.5854 20.7713 13.2288 19.7711 12.2286C18.7709 11.2284 17.4143 10.6665 15.9998 10.6665ZM15.9998 18.6665C15.4724 18.6665 14.9569 18.5101 14.5183 18.2171C14.0798 17.9241 13.738 17.5076 13.5362 17.0203C13.3343 16.5331 13.2815 15.9969 13.3844 15.4796C13.4873 14.9623 13.7413 14.4872 14.1142 14.1142C14.4872 13.7413 14.9623 13.4873 15.4796 13.3844C15.9969 13.2815 16.5331 13.3343 17.0203 13.5362C17.5076 13.738 17.9241 14.0798 18.2171 14.5183C18.5101 14.9569 18.6665 15.4724 18.6665 15.9998C18.6665 16.7071 18.3856 17.3854 17.8855 17.8855C17.3854 18.3856 16.7071 18.6665 15.9998 18.6665Z"
                                fill="#272928"/>
                        </svg>
                        <div className="text-lg font-semibold mt-2">Setting</div>
                    </a>
                </>
                }

                <a href={'https://www.sociallayer.im/'} target="_blank"
                   className="h-[144px] rounded shadow p-4 duration-200 hover:translate-y-[-6px]"
                   style={{'background': 'linear-gradient(180deg, #FFF6F3 0%, rgba(255, 255, 255, 0.00) 100%)'}}>
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M4.41475 23.5903H25.1884V21.6904L26.7864 21.6904V23.5903C26.7864 24.4691 26.0673 25.1882 25.1884 25.1882H4.41475C3.53586 25.1882 2.81677 24.4691 2.81677 23.5903V10.8065C2.81677 9.92758 3.53586 9.2085 4.41475 9.2085H5.81677V10.8065L4.41475 10.8065V23.5903Z"
                            fill="#272928"/>
                        <path
                            d="M27.1283 8.82091V21L7 21V8.82091L27.1283 8.82091ZM27.5854 6.81152H6.81172C5.93283 6.81152 5.21375 7.53061 5.21375 8.4095V21.1933C5.21375 22.0722 5.93283 22.7913 6.81172 22.7913H27.5854C28.4643 22.7913 29.1834 22.0722 29.1834 21.1933V8.4095C29.1834 7.52262 28.4723 6.81152 27.5854 6.81152Z"
                            fill="#272928"/>
                        <path
                            d="M14.0025 16.3994C13.7788 16.3994 13.603 16.2236 13.603 15.9999V12.005C13.603 11.7812 13.7788 11.6055 14.0025 11.6055C14.2262 11.6055 14.402 11.7812 14.402 12.005V15.9999C14.402 16.2156 14.2262 16.3994 14.0025 16.3994Z"
                            fill="#FF7BAC"/>
                        <path
                            d="M14.0026 10.8066C13.3394 10.8066 12.8041 11.342 12.8041 12.0051V16.0001C12.8041 16.6632 13.3394 17.1985 14.0026 17.1985C14.6657 17.1985 15.201 16.6632 15.201 16.0001V12.0051C15.201 11.342 14.6657 10.8066 14.0026 10.8066Z"
                            fill="#272928"/>
                        <path
                            d="M23.5904 16.3994C23.3667 16.3994 23.1909 16.2236 23.1909 15.9999V12.005C23.1909 11.7812 23.3667 11.6055 23.5904 11.6055C23.8141 11.6055 23.9899 11.7812 23.9899 12.005V15.9999C23.9899 16.2156 23.8141 16.3994 23.5904 16.3994Z"
                            fill="#FF7BAC"/>
                        <path
                            d="M23.5904 10.8066C22.9273 10.8066 22.392 11.342 22.392 12.0051V16.0001C22.392 16.6632 22.9273 17.1985 23.5904 17.1985C24.2536 17.1985 24.7889 16.6632 24.7889 16.0001V12.0051C24.7889 11.342 24.2536 10.8066 23.5904 10.8066Z"
                            fill="#272928"/>
                    </svg>
                    <div className="text-lg font-semibold mt-2">About</div>
                </a>
                <a href={'https://social-layer.notion.site/Use-Badges-531bcb47d3694d45bd6c73da99b1ad6f?pvs=4'}
                   target="_blank"
                   className="h-[144px] rounded shadow p-4 duration-200 hover:translate-y-[-6px]"
                   style={{'background': 'linear-gradient(180deg, #FFF2FB 0%, rgba(255, 255, 255, 0.00) 100%)'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <path
                            d="M15.0532 20.3865C14.9958 20.4499 14.9424 20.5167 14.8932 20.5865C14.8427 20.6608 14.8024 20.7415 14.7732 20.8265C14.7347 20.9021 14.7078 20.983 14.6932 21.0665C14.6866 21.1553 14.6866 21.2444 14.6932 21.3332C14.6887 21.5081 14.7252 21.6816 14.7998 21.8398C14.8597 22.0053 14.9553 22.1556 15.0797 22.28C15.2041 22.4044 15.3544 22.5 15.5198 22.5598C15.6794 22.6304 15.852 22.6668 16.0265 22.6668C16.201 22.6668 16.3736 22.6304 16.5332 22.5598C16.6986 22.5 16.8489 22.4044 16.9733 22.28C17.0978 22.1556 17.1933 22.0053 17.2532 21.8398C17.3124 21.6777 17.3396 21.5056 17.3332 21.3332C17.3342 21.1577 17.3006 20.9837 17.2342 20.8213C17.1679 20.6588 17.0701 20.5111 16.9465 20.3865C16.8226 20.2615 16.6751 20.1623 16.5126 20.0946C16.3501 20.027 16.1759 19.9921 15.9998 19.9921C15.8238 19.9921 15.6496 20.027 15.4871 20.0946C15.3246 20.1623 15.1771 20.2615 15.0532 20.3865ZM15.9998 2.6665C13.3628 2.6665 10.7849 3.44849 8.59224 4.91358C6.39958 6.37866 4.69062 8.46104 3.68145 10.8974C2.67228 13.3337 2.40824 16.0146 2.92271 18.601C3.43718 21.1875 4.70705 23.5632 6.57175 25.4279C8.43645 27.2926 10.8122 28.5625 13.3986 29.077C15.9851 29.5914 18.6659 29.3274 21.1023 28.3182C23.5386 27.3091 25.621 25.6001 27.0861 23.4074C28.5512 21.2148 29.3332 18.6369 29.3332 15.9998C29.3332 14.2489 28.9883 12.5151 28.3182 10.8974C27.6482 9.27972 26.666 7.80986 25.4279 6.57175C24.1898 5.33363 22.72 4.35151 21.1023 3.68144C19.4846 3.01138 17.7508 2.6665 15.9998 2.6665V2.6665ZM15.9998 26.6665C13.8902 26.6665 11.8279 26.0409 10.0738 24.8688C8.31964 23.6968 6.95246 22.0309 6.14513 20.0818C5.33779 18.1327 5.12656 15.988 5.53813 13.9189C5.94971 11.8497 6.96561 9.94913 8.45737 8.45737C9.94913 6.96561 11.8497 5.9497 13.9189 5.53813C15.988 5.12655 18.1327 5.33779 20.0818 6.14512C22.0309 6.95246 23.6968 8.31963 24.8689 10.0738C26.0409 11.8279 26.6665 13.8902 26.6665 15.9998C26.6665 18.8288 25.5427 21.5419 23.5423 23.5423C21.5419 25.5427 18.8288 26.6665 15.9998 26.6665V26.6665ZM15.9998 9.33317C15.2973 9.33272 14.607 9.51733 13.9984 9.86843C13.3898 10.2195 12.8845 10.7247 12.5332 11.3332C12.4367 11.4849 12.3719 11.6546 12.3427 11.8321C12.3136 12.0095 12.3206 12.191 12.3633 12.3657C12.4061 12.5403 12.4838 12.7046 12.5917 12.8484C12.6996 12.9923 12.8355 13.1128 12.9911 13.2028C13.1468 13.2928 13.3191 13.3504 13.4976 13.3721C13.6761 13.3938 13.8572 13.3791 14.0299 13.329C14.2026 13.2789 14.3634 13.1944 14.5026 13.0805C14.6418 12.9667 14.7565 12.8258 14.8398 12.6665C14.9573 12.463 15.1265 12.2942 15.3302 12.1771C15.5339 12.0601 15.7649 11.9989 15.9998 11.9998C16.3535 11.9998 16.6926 12.1403 16.9427 12.3904C17.1927 12.6404 17.3332 12.9795 17.3332 13.3332C17.3332 13.6868 17.1927 14.0259 16.9427 14.276C16.6926 14.526 16.3535 14.6665 15.9998 14.6665C15.6462 14.6665 15.3071 14.807 15.057 15.057C14.807 15.3071 14.6665 15.6462 14.6665 15.9998V17.3332C14.6665 17.6868 14.807 18.0259 15.057 18.276C15.3071 18.526 15.6462 18.6665 15.9998 18.6665C16.3535 18.6665 16.6926 18.526 16.9427 18.276C17.1927 18.0259 17.3332 17.6868 17.3332 17.3332V17.0932C18.215 16.7732 18.9563 16.1535 19.4275 15.3423C19.8988 14.5312 20.0699 13.5802 19.911 12.6557C19.7522 11.7312 19.2734 10.8919 18.5585 10.2845C17.8436 9.67719 16.9379 9.34045 15.9998 9.33317V9.33317Z"
                            fill="black"/>
                    </svg>
                    <div className="text-lg font-semibold mt-2">What is Badge</div>
                </a>
                <a href={'/'}
                   className="h-[144px] rounded shadow p-4 duration-200 hover:translate-y-[-6px]"
                   style={{'background': 'linear-gradient(180deg, #F3FFFE 0%, rgba(255, 255, 255, 0.00) 100%)'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <path
                            d="M26.6668 11.9198C26.6529 11.7974 26.6261 11.6767 26.5868 11.5598V11.4398C26.5227 11.3027 26.4372 11.1767 26.3335 11.0665V11.0665L18.3335 3.0665C18.2233 2.96279 18.0973 2.87728 17.9602 2.81317H17.8402C17.7047 2.73549 17.5551 2.68563 17.4002 2.6665H9.3335C8.27263 2.6665 7.25521 3.08793 6.50507 3.83808C5.75492 4.58822 5.3335 5.60564 5.3335 6.6665V25.3332C5.3335 26.394 5.75492 27.4115 6.50507 28.1616C7.25521 28.9117 8.27263 29.3332 9.3335 29.3332H22.6668C23.7277 29.3332 24.7451 28.9117 25.4953 28.1616C26.2454 27.4115 26.6668 26.394 26.6668 25.3332V11.9998C26.6668 11.9998 26.6668 11.9998 26.6668 11.9198ZM18.6668 7.21317L22.1202 10.6665H20.0002C19.6465 10.6665 19.3074 10.526 19.0574 10.276C18.8073 10.0259 18.6668 9.68679 18.6668 9.33317V7.21317ZM24.0002 25.3332C24.0002 25.6868 23.8597 26.0259 23.6096 26.276C23.3596 26.526 23.0205 26.6665 22.6668 26.6665H9.3335C8.97987 26.6665 8.64074 26.526 8.39069 26.276C8.14064 26.0259 8.00016 25.6868 8.00016 25.3332V6.6665C8.00016 6.31288 8.14064 5.97374 8.39069 5.7237C8.64074 5.47365 8.97987 5.33317 9.3335 5.33317H16.0002V9.33317C16.0002 10.394 16.4216 11.4115 17.1717 12.1616C17.9219 12.9117 18.9393 13.3332 20.0002 13.3332H24.0002V25.3332Z"
                            fill="black"/>
                    </svg>
                    <div className="text-lg font-semibold mt-2">Development Doc</div>
                </a>
                <a href={'https://twitter.com/SocialLayer_im'} target='_blank'
                   className="h-[144px] rounded shadow p-4 duration-200 hover:translate-y-[-6px]"
                   style={{'background': 'linear-gradient(180deg, #EEF3F5 0%, rgba(255, 255, 255, 0.00) 100%)'}}>
                    <i className='media-x text-xl'></i>
                    <div className="text-lg font-semibold mt-2">@SocialLayer_im</div>
                </a>
            </div>
        </div>

        <Footer/>
        <Feedback/>
    </div>
}
