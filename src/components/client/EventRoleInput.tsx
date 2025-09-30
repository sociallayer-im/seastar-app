import { Dictionary } from "@/lang"
import { Input } from "@/components/shadcn/Input"
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react"
import DropdownMenu, { DropdownTrigger } from "@/components/client/DropdownMenu"
import { getAvatar } from "@/utils"
import { debounce } from 'lodash'
import useUploadAvatar from "@/hooks/useUploadAvatar"
import { EventDraftType, EventRole, EventRoleDetail, EventRoleType, searchProfile } from '@sola/sdk'
import { CLIENT_MODE } from '@/app/config'

interface EventRoleInputProps {
    state: { event: EventDraftType, setEvent: (event: EventDraftType) => void }
    role: EventRoleType,
    lang: Dictionary,
    multiple?: boolean
}


const getEmptyRole = (role: EventRoleType) => {
    return {
        role,
        nickname: '',
        item_id: null,
        email: '',
        image_url: '',
        item_type: 'Profile'
    } as EventRole
}

export default function EventRoleInput({ lang, role, multiple = true, state: { event, setEvent } }: EventRoleInputProps) {
    const initList = (): EventRole[] => {
        return event.event_roles?.filter(r => r.role === role && !(r as EventRoleDetail)._destroy)
            .map(r => ({
                role: r.role,
                nickname: r.nickname,
                item_id: r.item_id,
                email: r.email,
                image_url: r.image_url,
                item_type: r.item_type
            } as EventRole)) || []
    }

    // Remove the role that already exists, create new roles after saving/creating event,
    // thought the role may not change, the id will be changed
    const listToRemove = event.event_roles?.filter(r => !!r.id && r.role === role)
        .map(r => ({ ...r, _destroy: '1' })) || []

    const [list, setList] = useState<EventRole[]>(initList())

    useEffect(() => {
        const list = initList()
        setList(list.length ? list : [getEmptyRole(role)])
    }, [event.event_roles])

    const updateEventRole = (newList: EventRole[]) => {
        const _list = event.event_roles?.filter(r => r.role !== role) || []
        const __list = [..._list, ...newList.filter(r => !!r.nickname), ...listToRemove]
        setEvent({
            ...event,
            event_roles: __list
        })
    }

    const handleAddNewRole = () => {
        const newList = [...list, getEmptyRole(role)]
        setList(newList)
    }

    const removeItem = (item: EventRole) => {
        const newList = list.filter(r => r !== item)
        setList(newList)
        updateEventRole(newList)
    }

    const changeItem = (item: EventRole, index: number) => {
        const newList = list.map((r, i) => i === index ? item : r)
        setList(newList)
        updateEventRole(newList)
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
                role={role}
                lang={lang}
                showAddBtn={i === list.length - 1}
                onAdd={handleAddNewRole}
                onRemove={() => {
                    removeItem(item)
                }}
                multiple={multiple}
                onChange={(role) => changeItem(role, i)}
            />)
        }
    </div>
}

export interface RoleOptionProps {
    role: EventRoleType,
    item: EventRole,
    lang: Dictionary
    onChange?: (role: EventRole) => void
    onAdd?: () => void
    onRemove?: () => void
    showAddBtn?: boolean,
    multiple?: boolean
}

function RoleOption({ showAddBtn, item, lang, onAdd, onRemove, onChange, multiple = true }: RoleOptionProps) {
    const { uploadAvatar } = useUploadAvatar()
    const [searchResult, setSearchResult] = useState<Solar.ProfileSample[]>([])
    const { current: dropDownTrigger } = useRef<DropdownTrigger>({ trigger: null })
    const searchIdentifier = useRef<number>(0)

    const handleSearch = useCallback(debounce(async (keyword: string) => {
        const _keyword = keyword.trim()
        const identifier = ++searchIdentifier.current

        if (_keyword.length < 3) {
            dropDownTrigger.trigger && dropDownTrigger.trigger(false)
            return
        }
        const res = await searchProfile({
            params: {
                query: _keyword
            },
            clientMode: CLIENT_MODE
        })
        if (identifier !== searchIdentifier.current) {
            console.log('Search result expired, keyword:', keyword)
            return
        }
        setSearchResult(res)
        dropDownTrigger.trigger && dropDownTrigger.trigger(!!res.length)
    }, 500), [dropDownTrigger])

    const handleInputName = async (e: ChangeEvent<HTMLInputElement>) => {
        !!onChange && onChange({ ...item, nickname: e.target.value })
        await handleSearch(e.target.value)
    }

    const handleFocus = async () => {
        await handleSearch(item.nickname || '')
    }

    const setAvatar = async () => {
        await uploadAvatar({
            onUploaded: (url) => {
                !!onChange && onChange({ ...item, image_url: url })
            }
        })
    }

    const handleSelect = (profile: Solar.ProfileSample) => {
        !!onChange && onChange({
            ...item,
            nickname: profile.handle,
            item_id: profile.id,
            image_url: profile.image_url
        })
    }

    return <div className="flex-row-item-center mb-2">
        {!!item.nickname &&
            <div className="w-11 h-11 relative flex-shrink-0 mr-3">
                <img className="w-11 h-11 rounded-full"
                    src={item.image_url || "/images/default_avatar/avatar_0.png"} alt="" />
                <div onClick={setAvatar}
                    className="cursor-pointer absolute bottom-0 right-0 bg-background rounded-full w-4 h-4 shadow flex-row-item-center justify-center">
                    <i className="uil-edit-alt text-xs" />
                </div>
            </div>
        }
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
                            src={getAvatar(profile.id, profile.image_url)} alt="" />
                        {profile.handle} {profile.nickname && `(${profile.nickname})`}
                    </div>}
                    trigger={dropDownTrigger}>
                    <Input
                        onFocus={handleFocus}
                        onChange={handleInputName}
                        startAdornment={<i className="uil-user text-xl" />}
                        value={item.nickname || ''}
                        className="w-full"
                        placeholder={lang['Input name']} />
                </DropdownMenu>
            </div>

            {!!item.nickname && (!item.item_id || !!item.email) &&
                <Input className="flex-1  ml-3"
                    startAdornment={<i className="uil-envelope text-xl" />}
                    value={item.email || ''}
                    onChange={e => {
                        !!onChange && onChange({ ...item, email: e.target.value })
                    }}
                    placeholder={lang['Input email to invite']} />
            }
        </div>
        {multiple &&
            <div className="flex-shrink-0 ml-3">
                {showAddBtn ? <i onClick={() => {
                    !!onAdd && onAdd()
                }}
                    className="uil-plus-circle text-3xl text-green-400 cursor-pointer hover:opacity-70 active:brightness-90" />
                    : <i onClick={() => {
                        !!onRemove && onRemove()
                    }}
                        className="uil-minus-circle text-3xl text-gray-400 cursor-pointer hover:opacity-70 active:brightness-90" />
                }
            </div>
        }
    </div>
}
