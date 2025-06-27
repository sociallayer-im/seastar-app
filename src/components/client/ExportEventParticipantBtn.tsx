'use client'

import { Dictionary } from "@/lang";
import { Button } from "../shadcn/Button";
import useModal from "@/components/client/Modal/useModal"
import DatePicker from "@/components/client/DatePicker"
import dayjs from "@/libs/dayjs"
import { useState } from "react"
import { Input } from "../shadcn/Input";

export default function ExportEventParticipantBtn(props: { lang: Dictionary , groupId: number}) {
    const { lang, groupId } = props
    
    const { openModal } = useModal()
    
    const handleShowExportModal = () => {
        openModal({
            content: (close) => <ExportModal lang={lang} close={close!} groupId={groupId} />
        })
    }
    
    return <Button variant="secondary" className="mb-3 w-full sm:w-auto"  onClick={handleShowExportModal}>
    <div className="flex-row-item-center w-full justify-between">
        <div>{lang['Export Event Participant Data']}</div>
        <i className="uil-cloud-download text-2xl ml-2" />
    </div>
</Button>
}

function ExportModal(props: { lang: Dictionary, groupId: number, close: () => void }) {
    const { lang, close, groupId } = props
    const now = dayjs()
    const [startDate, setStartDate] = useState<string>(now.subtract(1, 'week').format('YYYY/MM/DD'))
    const [endDate, setEndDate] = useState<string>(now.format('YYYY/MM/DD'))
    const [error, setError] = useState<string | null>(null)

    const handleExport = () => {
        console.log('export event data')
        if (startDate > endDate) {
            setError('Start date must be before end date')
            return
        }
        setError(null)
    
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/participant/csv?group_id=${groupId}&start_date=${startDate}&end_date=${endDate}`
        const a = document.createElement('a')
        a.href = url
        a.download = `event_participant_data_${startDate}_${endDate}.csv`
        a.click()
    }

    return <div className="p-4 bg-white rounded-lg shadow w-[340px]">
        <div className="text-lg font-bold"  >{lang['Export Event Participant Data']}</div>
        <div className="flex flex-col gap-2 my-3">
            <div className="flex flex-row gap-2 items-center">
                <DatePicker initDate={startDate} onChange={setStartDate}>
                    <Input type="text"
                           inputSize="md"
                           placeholder={'Set Date'}
                           className="w-full"
                           readOnly
                           value={startDate}
                           startAdornment={<i className="uil-calender text-lg"/>}/>
                </DatePicker>

                <i className="uil-arrow-right text-2xl my-2" />
                <DatePicker initDate={endDate} onChange={setEndDate}>
                    <Input type="text"
                           inputSize="md"
                           placeholder={'Set Date'}
                           className="w-full"
                           readOnly
                           value={endDate}
                           startAdornment={<i className="uil-calender text-lg"/>}/>
                </DatePicker>
            </div>
        </div>
        {error && <div className="text-red-500 text-sm my-2">{error}</div>}
        <Button onClick={handleExport} className="w-full">{lang['Export']}</Button>
    </div>
}