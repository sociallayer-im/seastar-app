import Link from 'next/link'
import NoData from '@/components/NoData'
import {buttonVariants} from '@/components/shadcn/Button'

export default function NotFound() {
    return (
        <div className="flex-row-item-center justify-center w-[100vw]">
           <div className="flex flex-col items-center justify-center">
               <NoData label={'Not Found'}  />
               <div className="font-semibold">Could not find requested resource</div>
               <Link className={`${buttonVariants({variant: 'primary'})} mt-4`} href="/">Return Home</Link>
           </div>
        </div>
    )
}