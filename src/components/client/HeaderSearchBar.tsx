'use client'

import {useState} from 'react'
import {Input} from '@/components/shadcn/Input'
import {Button} from '@/components/shadcn/Button'
import {Dictionary} from '@/lang'

export default function HeaderSearchBar({lang}: { lang: Dictionary }) {
    const [keyword, setKeyword] = useState('')
    const [active, setActive] = useState(false)

    const handleSearch = () => {
        if (!keyword.trim()) return
        window.location.href = `/search?keyword=${encodeURIComponent(keyword)}`
    }

    const style = active ? {width: '350px', height: '32px', position: 'absolute'} : {width: '14px'}
    return <div className="z-10 right-0 bg-background" style={style as any}>
        {active ?
            <div className="flex-row-item-center">
                <Input inputSize={'sm'}
                       type={'search'}
                       onKeyUp={e => {
                           if (e.key === 'Enter') {
                               handleSearch()
                           }
                       }}
                       placeholder={lang['Events, Groups, Badges, Users']}
                       className="!rounded-full w-full"
                       value={keyword}
                       endAdornment={<Button
                           onClick={handleSearch}
                           variant={'primary'} size={'xs'}
                           className="!rounded-full !py-2 !h-[22px] bg-[#6cd7b2]">
                           <i className="uil-search cursor-pointer text-white"/>
                       </Button>}
                       onChange={e => {
                           setKeyword(e.target.value)
                       }}/>
                <Button size={'xs'}
                        onClick={() => setActive(false)}
                        variant={'ghost'} className="!text-[#6cd7b2] ml-1 !rounded-full">
                    {lang['Cancel']}
                </Button>
            </div>
            : <i className="uil-search text-sm cursor-pointer"
                 onClick={() => setActive(true)}/>
        }
    </div>
}