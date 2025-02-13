import {useEffect, useState} from 'react'
import styles from './DialogBadgeSwap.module.scss'
import QRcode from '@/components/client/QRcode'
import {Badge, ProfileDetail} from '@sola/sdk'
import Avatar from '@/components/Avatar'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import useScanQrcode from '@/hooks/useScanQrcode'
import {displayProfileName, getAuth} from '@/utils'
import {getBadgeDetailByBadgeId, swapBadge} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'

function DialogBadgeSwap(props: { badge: Badge, currProfile: ProfileDetail, code: string, close?: () => any }) {
    const {closeModal, showLoading} = useModal()
    const {toast} = useToast()
    const {scanQrcode} = useScanQrcode()

    const user = props.currProfile
    const [success, setSuccess] = useState(false)

    const handleScan = () => {
        scanQrcode(async (res) => {
            const searchParams = new URLSearchParams(res)

            const token = searchParams.get('code')

            if (!token) {
                toast({
                    description: 'Invalid QR code',
                    variant: 'destructive'
                })
                return
            }

            await handleSwap()

            async function handleSwap() {
                const loading = showLoading()
                try {
                    const authToken = getAuth()
                    await swapBadge({
                        params: {
                            authToken: authToken!,
                            badgeId: props.badge.id,
                            swapToken: token!
                        },
                        clientMode: CLIENT_MODE
                    })
                    toast({
                        description: 'Swap success',
                        variant: 'success'
                    })
                    setTimeout(() => {
                        props.close?.()
                        window.location.href = `/profile/${user.handle}?tab=badges`
                    }, 500)
                } catch (e: any) {
                    console.error(e)
                    toast({
                        description: e.message || 'Swap in fail !',
                        variant: 'destructive'
                    })
                } finally {
                    closeModal(loading)
                }
            }
        })
    }

    useEffect(() => {
        const timeout = setInterval(async () => {
            getBadgeDetailByBadgeId({
                params: {badgeId: props.badge.id},
                clientMode: CLIENT_MODE
            }).then(res => {
                if (res?.owner.id !== props.badge.owner.id) {
                    setSuccess(true)
                    setTimeout(() => {
                        toast({
                            description: 'Swap success',
                            variant: 'success'
                        })
                        window.location.href = `/profile/${user.handle}?tab=badges`
                    }, 1500)
                }
            })
        }, 1000)

        return () => {
            clearInterval(timeout)
        }
    }, [user.id])

    return (<div className={styles['dialog']}>
        <div className={styles['card']}>
            <div className={styles['user']}>
                <Avatar profile={props.badge.owner} size={16}/>
                <div>{`${displayProfileName(props.badge.owner)} want to swap a card with you`}</div>
            </div>
            <div className={styles['swap-pic']}>
                <img src={props.badge.badge_class.image_url!} alt=""/>
                <svg xmlns="http://www.w3.org/2000/svg" width="43" height="22" viewBox="0 0 43 22" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd"
                          d="M33.8333 1.52391C33.3731 1.06365 32.6268 1.06365 32.1666 1.52391C31.7063 1.98417 31.7063 2.7304 32.1666 3.19066L34.8689 5.89299L4.71425 5.893C4.06334 5.893 3.53568 6.42066 3.53568 7.07157C3.53568 7.72247 4.06334 8.25014 4.71425 8.25014L37.7142 8.25014C38.1909 8.25014 38.6207 7.96299 38.8031 7.52258C38.9855 7.08218 38.8847 6.57526 38.5476 6.23819L33.8333 1.52391ZM4.71425 12.9639C4.23756 12.9639 3.80781 13.251 3.62539 13.6914C3.44297 14.1318 3.54381 14.6387 3.88088 14.9758L8.59518 19.6901C9.05544 20.1504 9.80167 20.1504 10.2619 19.6901C10.7222 19.2298 10.7222 18.4836 10.2619 18.0233L7.55958 15.321H37.7142C38.3652 15.321 38.8928 14.7933 38.8928 14.1424C38.8928 13.4915 38.3652 12.9639 37.7142 12.9639H4.71425Z"
                          fill="url(#paint0_linear_3448_26495)"/>
                    <defs>
                        <linearGradient id="paint0_linear_3448_26495" x1="44" y1="-0.785517" x2="44.1426" y2="27.5026"
                                        gradientUnits="userSpaceOnUse">
                            <stop stopColor="#4E1893"/>
                            <stop offset="1" stopColor="#920B7C"/>
                        </linearGradient>
                    </defs>
                </svg>
                <i> ? </i>
            </div>
            <div className={styles['white']}>
                <div className={styles['border']}>
                    <QRcode size={[114, 114]} text={`${window.location.href}?code=${props.code}`}/>
                    <div className={styles['des']}>Please select a card to swap with me</div>
                </div>
            </div>
        </div>
        <svg className={styles['close']} onClick={e => {
            props.close && props.close()
        }} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="12" fill="#F8F8F8"/>
            <path fillRule="evenodd" clipRule="evenodd"
                  d="M7.52876 7.52827C7.78911 7.26792 8.21122 7.26792 8.47157 7.52827L12.0002 11.0569L15.5288 7.52827C15.7891 7.26792 16.2112 7.26792 16.4716 7.52827C16.7319 7.78862 16.7319 8.21073 16.4716 8.47108L12.943 11.9997L16.4716 15.5283C16.7319 15.7886 16.7319 16.2107 16.4716 16.4711C16.2112 16.7314 15.7891 16.7314 15.5288 16.4711L12.0002 12.9425L8.47157 16.4711C8.21122 16.7314 7.78911 16.7314 7.52876 16.4711C7.26841 16.2107 7.26841 15.7886 7.52876 15.5283L11.0574 11.9997L7.52876 8.47108C7.26841 8.21073 7.26841 7.78862 7.52876 7.52827Z"
                  fill="#9B9B9B"/>
        </svg>
        <div className={styles['swap-btn']} onClick={handleScan}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2.5 6.25V2.5H6.25" stroke="#272928" strokeWidth="2" strokeLinecap="round"
                      strokeLinejoin="round"/>
                <path d="M6.25 17.5H2.5V13.75" stroke="#272928" strokeWidth="2" strokeLinecap="round"
                      strokeLinejoin="round"/>
                <path d="M17.5 13.75V17.5H13.75" stroke="#272928" strokeWidth="2" strokeLinecap="round"
                      strokeLinejoin="round"/>
                <path d="M13.75 2.5H17.5V6.25" stroke="#272928" strokeWidth="2" strokeLinecap="round"
                      strokeLinejoin="round"/>
                <path d="M4.1665 10H15.8332" stroke="#272928" strokeWidth="2" strokeLinecap="round"
                      strokeLinejoin="round"/>
            </svg>
            <div>Scan QR code</div>
        </div>
        {success &&
            <img className={styles['success-animation']} src="/images/merge_success_animation.gif" alt=""/>
        }
    </div>)
}

export default DialogBadgeSwap
