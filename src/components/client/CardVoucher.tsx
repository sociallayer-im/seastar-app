'use client'

import {Voucher} from '@sola/sdk'
import {Dictionary} from '@/lang'
import Image from 'next/image'
import useShowVoucher from '@/hooks/useShowVoucher'

export default function CardVoucher({voucher, lang}: {voucher: Voucher, lang: Dictionary}) {
    const {showVoucher} = useShowVoucher()

    const handleClick = async () => {
        await showVoucher(voucher.id, lang)
    }

    return <div onClick={handleClick}
              className="h-[182px] bg-white shadow rounded-2xl shadow-badge p-2 cursor-pointer duration-200 hover:translate-y-[-6px]">
        <div
            className="bg-gray-100 flex flex-row items-center justify-center h-[130px] rounded-2xl relative overflow-auto">
            <Image className="w-[90px] h-[90px] rounded-full" width={90} height={90}
                   src={voucher.badge_class.image_url!} alt=""/>
        </div>
        <div
            className="font-semibold overflow-hidden overflow-ellipsis whitespace-nowrap text-center p-2">
            {voucher.badge_class.title!}
        </div>
    </div>
}