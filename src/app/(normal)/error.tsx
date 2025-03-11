'use client'

import {useEffect} from 'react'
import NoData from '@/components/NoData'
import Link from 'next/link'
import {buttonVariants, Button} from '@/components/shadcn/Button'
import { TrackJS, TrackJSInstall } from "@/app/trackjs_loader"

TrackJSInstall()

export default function Error({error,reset }: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
        TrackJS.track(error)
    }, [error])

    return (
        <div>
            <div className="flex-row-item-center justify-center w-[100vw] p-3">
                <div className="flex flex-col items-center justify-center">
                    <NoData label={'Something went wrong!'}  />
                    {!!error.digest && <div className="my-3">Digest: {error.digest}</div>}
                   <div className="flex-row-item-center items-center mt-4">
                       <Button variant={'secondary'}
                               onClick={ () => reset()}>
                           Try again
                       </Button>
                       <Link className={`${buttonVariants({variant: 'primary'})} ml-3`} href="/">Return Home</Link>
                   </div>
                    <div className="bg-red-50 p-3 rounded-lg overflow-auto mt-4 mx-3 max-w-[90vw]">
                        <div className="font-semibold text-red-500">{error.message}</div>
                        <div className="whitespace-pre-wrap text-xs break-all">
                            {error.stack}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}