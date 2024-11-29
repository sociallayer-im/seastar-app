'use client'

import useModal from "@/components/client/Modal/useModal"
import {ReactNode, useRef} from "react"
import QRcode from "@/components/client/QRcode"
import {getAvatar} from "@/utils"

export default function BtnGroupQrcode(props: { group: Solar.GroupSample, children: ReactNode }) {
    const {openModal, showLoading, closeModal} = useModal()
    const handleShowQrcode = () => {
        const loadingId = showLoading()
        const bg = new Image()
        bg.src = '/images/qrcode_bg.png'
        bg.onload = () => {
            closeModal(loadingId)
            openModal({
                content: () => <GroupCard group={props.group} close={close}/>
            })
        }
    }

    return <div onClick={handleShowQrcode}>
        {props.children}
    </div>
}

function GroupCard(props: {group: Solar.GroupSample,  close: () => void }) {
    const cardRef = useRef(null)

    const url = `${window.location.origin}/group/${props.group.handle}`
    return <div className="w-[316px] h-[486px]">
        <div className="card relative w-[316px] h-[486px]" ref={cardRef}>
            <img src="/images/qrcode_bg.png"
                className="block w-[316px] h-[486px] absolute left-0 top-0" alt=""/>
            <div className="absolute left-[106px] top-[185px] w-[104px] h-[104px]">
                <QRcode size={[104, 104]} text={url}/>
            </div>
            <img className='avatar w-[32px] h-[32px] rounded-full block absolute left-[142px] top-[222px]'
                src={getAvatar(props.group.id, props.group.image_url)} alt=""/>
            <div className="absolute font-semibold text-base text-center top-[330px] leading-[22px] w-full">
                {props.group.nickname || props.group.handle}
            </div>
        </div>
    </div>
}
