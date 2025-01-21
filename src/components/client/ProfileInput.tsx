import {Dictionary} from "@/lang"
import {Input} from "@/components/shadcn/Input"
import {ChangeEvent, useCallback, useEffect, useRef, useState} from "react"
import DropdownMenu, {DropdownTrigger} from "@/components/client/DropdownMenu"
import {SearchProfile} from "@/service/solar"
import {getAvatar} from "@/utils"
import {debounce} from 'lodash'

interface ProfileInputProps {
    value: Array<Solar.ProfileSample>
    lang: Dictionary
    placeholder?: string
    onChange?: (value: Array<Solar.ProfileSample>) => void
}


const getEmptyRole = () => {
    return {
        nickname: '',
        image_url: '',
        handle: '',
        email: '',
        id: 0,
    } as Solar.ProfileSample
}

export default function ProfileInput({lang, value, onChange, placeholder}: ProfileInputProps) {
    const [list, setList] = useState<Solar.ProfileSample[]>(value)

    useEffect(() => {
        setList(value)
    }, [value])

    const updateList = (profiles: Solar.ProfileSample[]) => {
        const _list = profiles.filter(r => !!r.nickname || !!r.id)
        !!onChange && onChange(_list)
    }

    const handleAddNewRole = () => {
        const newList = [...list, getEmptyRole()]
        setList(newList)
    }

    const removeItem = (item: Solar.ProfileSample) => {
        const newList = list.filter(r => r !== item)
        setList(newList)
        updateList(newList)
    }

    const changeItem = (item: Solar.ProfileSample, index: number) => {
        const newList = list.map((r, i) => i === index ? item : r)
        setList(newList)
        updateList(newList)
    }

    useEffect(() => {
        if (!list.length) {
            handleAddNewRole()
        }
    }, [list])

    return <div>
        {
            list.map((item, i) => <RoleOption
                item={item}
                key={i}
                placeholder={placeholder}
                lang={lang}
                showAddBtn={i === list.length - 1}
                onAdd={handleAddNewRole}
                onRemove={() => {
                    removeItem(item)
                }}
                onChange={(profile) => changeItem(profile, i)}
            />)
        }
    </div>
}

export interface RoleOptionProps {
    item: Solar.ProfileSample,
    lang: Dictionary
    onChange?: (role: Solar.ProfileSample) => void
    onAdd?: () => void
    onRemove?: () => void
    showAddBtn?: boolean
    placeholder?: string
}

function RoleOption({showAddBtn, item, lang, onAdd, onRemove, onChange, placeholder}: RoleOptionProps) {
    const [searchResult, setSearchResult] = useState<Solar.ProfileSample[]>([])
    const {current: dropDownTrigger} = useRef<DropdownTrigger>({trigger: null})

    const handleSearch = useCallback(debounce(async (keyword: string) => {
        const _keyword = keyword.trim()
        if (_keyword.length < 3) {
            dropDownTrigger.trigger && dropDownTrigger.trigger(false)
            return
        }
        const res = await SearchProfile(_keyword)
        setSearchResult(res)
        dropDownTrigger.trigger && dropDownTrigger.trigger(!!res.length)
    }, 500), [dropDownTrigger])

    const handleInputName = async (e: ChangeEvent<HTMLInputElement>) => {
        !!onChange && onChange({...item, nickname: e.target.value})
        await handleSearch(e.target.value)
    }

    const handleFocus = async () => {
        await handleSearch(item.nickname || '')
    }

    const handleSelect = (profile: Solar.ProfileSample) => {
        !!onChange && onChange(profile)
    }

    return <div className="flex-row-item-center mb-2">
        <div className="flex-1 flex-row-item-center">
            <div className="flex-1">
                <DropdownMenu
                    options={searchResult}
                    valueKey="id"
                    onSelect={(profile) => {
                        handleSelect(profile[0])
                    }}
                    renderOption={(profile) => <div className="flex-row-item-center">
                        <img className="w-6 h-6 rounded-full mr-1"
                            src={getAvatar(profile.id, profile.image_url)} alt=""/>
                        {profile.handle} {profile.nickname && `(${profile.nickname})`}
                    </div>}
                    trigger={dropDownTrigger}>
                    <Input
                        onFocus={handleFocus}
                        onChange={handleInputName}
                        startAdornment={<div className="flex-row-item-center">
                            {!!item.id
                                ? <img className="w-5 h-5 rounded-full" src={getAvatar(item.id, item.image_url)} alt=""/>
                                : <i className="uil-user text-xl"/>
                            }
                        </div>}
                        value={item.nickname || item.handle}
                        className="w-full"
                        placeholder={placeholder || lang['Input name']}/>
                </DropdownMenu>
            </div>
        </div>
        <div className="flex-shrink-0 ml-3">
            {showAddBtn ? <i onClick={() => {
                !!onAdd && onAdd()
            }}
            className="uil-plus-circle text-3xl text-green-400 cursor-pointer hover:opacity-70 active:brightness-90"/>
                : <i onClick={() => {
                    !!onRemove && onRemove()
                }}
                className="uil-minus-circle text-3xl text-gray-400 cursor-pointer hover:opacity-70 active:brightness-90"/>
            }
        </div>
    </div>
}
