'use client'

import {Dictionary} from "@/lang"
import {Input} from "@/components/shadcn/Input"
import DropdownMenu from "@/components/client/DropdownMenu"
import {displayProfileName, getAuth} from "@/utils"
import {Button, buttonVariants} from "@/components/shadcn/Button"
import {Textarea} from "@/components/shadcn/Textarea"
import CreateBadgePageData from '@/app/(normal)/badge-class/create/data'
import {BadgeClass, Profile, Group, createBadgeClass} from '@sola/sdk'
import {useEffect, useMemo, useState} from "react"
import useUploadAvatar from '@/hooks/useUploadAvatar'
import Avatar from '@/components/Avatar'
import {Badge} from '@/components/shadcn/Badge'
import useModal from '@/components/client/Modal/useModal'
import {useToast} from '@/components/shadcn/Toast/use-toast'
import {CLIENT_MODE} from '@/app/config'

export interface CreateBadgeFormProps extends Awaited<ReturnType<typeof CreateBadgePageData>> {
    lang: Dictionary
}

export interface CreatorOpt extends Profile {
    type: 'profile' | 'group'
}

export interface BadgeClassDraft extends BadgeClass {
    content: string
}

export default function CreateBadgeForm({
                                            lang,
                                            badgeType,
                                            returnPage,
                                            groupSenderId,
                                            currProfile,
                                            availableGroupCreator
                                        }: CreateBadgeFormProps) {

    const {showPresetAvatar} = useUploadAvatar()
    const {showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const [badgeClassDraft, setBadgeClassDraft] = useState<BadgeClassDraft>({
        id: 0,
        title: '',
        creator_id: currProfile.id,
        image_url: null,
        display: null,
        badge_type: badgeType,
        content: '',
        group_id: groupSenderId || null
    })

    const [imgError, setImgError] = useState('')
    const [titleError, setTitleError] = useState('')
    const [createError, setCreateError] = useState('')
    const [loading, setLoading] = useState(false)


    const creatorOptions = useMemo(() => {
        const profile = {type: 'profile', ...currProfile}
        const groups = availableGroupCreator.map(group => ({type: 'group', ...group}))
        return [profile, ...groups] as CreatorOpt[]
    }, [availableGroupCreator, currProfile])

    const creator = useMemo(() => {
        if (badgeClassDraft.group_id) {
            return [creatorOptions.find(creator => creator.id === badgeClassDraft.group_id)!]
        } else {
            return [creatorOptions[0]]
        }
    }, [creatorOptions, badgeClassDraft.group_id])


    useEffect(() => {
        console.log('badgeClassDraft', badgeClassDraft)
    }, [badgeClassDraft]);


    const handleSetCreator = (creatorOpt: CreatorOpt[]) => {
        if (creatorOpt[0].type === 'group') {
            setBadgeClassDraft({
                ...badgeClassDraft,
                group_id: creatorOpt[0].id
            })
        } else {
            setBadgeClassDraft({
                ...badgeClassDraft,
                group_id: null
            })
        }
    }

    const handleCreateBadge = async () => {
        setCreateError('')

        if (!badgeClassDraft.image_url) {
            setImgError('Please upload image')
            return
        } else {
            setImgError('')
        }
        if (!badgeClassDraft.title) {
            setTitleError('Please input title')
            return
        } else {
            setTitleError('')
        }

        const loading = showLoading()
        setLoading(true)
        try {
            const authToken = getAuth()
            const badgeClass = await createBadgeClass({
                params: {
                    badgeClass: badgeClassDraft,
                    authToken: authToken!
                }, clientMode: CLIENT_MODE
            })

            toast({description: 'Badge created successfully', variant: 'success'})

            window.setTimeout(() => {
                if (returnPage) {
                    const url = new URL(returnPage)
                    url.searchParams.set('event_badge', badgeClass.id.toString())
                    window.location.href = url.toString()
                } else {
                    window.location.href = `/badge-class/${badgeClass.id}/send-badge${window.location.search}`
                }
            }, 1000)
        } catch (e: unknown) {
            console.error(e)
            setCreateError('Failed to create badge')
        } finally {
            closeModal(loading)
            setLoading(false)
        }
    }

    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width min-h-[calc(100svh-48px)] px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Create Badge']}</div>

            {badgeType === 'private' &&
                <div className="max-w-[500px] text-sm mx-auto p-2 bg-amber-50 text-amber-500 mb-2">
                    <i className="uil-info-circle text-lg mr-2"/>
                    <b>{lang['Privacy Badge']}</b>: {lang['Only receivers can see the badge detail']}
                </div>
            }

            <div className="flex flex-col max-w-[500px] mx-auto">
                <div className="mb-4">
                    <div className="font-semibold pb-2">{lang['Badge Image']}</div>
                    <div onClick={() => showPresetAvatar({
                        lang,
                        onSelect: url => setBadgeClassDraft({...badgeClassDraft, image_url: url})
                    })}
                         className="cursor-pointer bg-secondary rounded-lg h-[170px] flex-col flex justify-center items-center">
                        <img className="w-[100px] h-[100px] rounded-full"
                             src={badgeClassDraft.image_url || '/images/upload_default.png'} alt=""/>
                    </div>
                    <div className="text-red-400 text-sm my-2">{imgError}</div>
                </div>

                <div className="mb-4">
                    <div className="font-semibold pb-2">{lang['Badge Name']}</div>
                    <Input value={badgeClassDraft.title}
                           className="w-full"
                           onChange={e => setBadgeClassDraft({...badgeClassDraft, title: e.target.value})}
                           placeholder={lang['Naming your badge']}/>
                    <div className="text-red-400 text-sm my-2">{titleError}</div>
                </div>

                <div className="font-semibold pb-2">{lang['Creator']}</div>
                <div className="mb-4">
                    <DropdownMenu
                        onSelect={handleSetCreator}
                        valueKey="handle"
                        options={creatorOptions}
                        value={creator}
                        renderOption={(opt, index) => <div className="flex-row-item-center" key={index}>
                            <Avatar profile={opt} size={24} className="mr-2"/>
                            <div className="mr-2">{displayProfileName(opt)}</div>
                            {opt.type === 'group'
                                ? <Badge variant="upcoming">{lang['Group']}</Badge>
                                : <Badge variant="ongoing">{lang['Person']}</Badge>
                            }
                        </div>}>
                        <div
                            className={`${buttonVariants({variant: 'secondary'})} w-full !justify-between items-center cursor-pointer`}>
                            <div
                                className="overflow-hidden whitespace-nowrap overflow-ellipsis font-normal flex-row-item-center">
                                <Avatar profile={creator[0]} size={24} className="mr-2"/>
                                <div className="mr-2">{displayProfileName(creator[0])}</div>
                                {creator[0].type === 'group'
                                    ? <Badge variant="upcoming">{lang['Group']}</Badge>
                                    : <Badge variant="ongoing">{lang['Person']}</Badge>
                                }
                            </div>

                            <div className="flex items-center">
                                <i className="uil-exchange-alt text-lg"/>
                            </div>
                        </div>
                    </DropdownMenu>
                </div>

                <div className="font-semibold pb-2">{lang['Reason (Optional)']}</div>
                <Textarea
                    className="mb-4"
                    placeholder={'Input reason'}
                    value={badgeClassDraft.content}
                    onChange={e => setBadgeClassDraft({...badgeClassDraft, content: e.target.value})}
                />

                <div className="text-red-400 text-sm my-3">{createError}</div>

                <Button variant={"primary"}
                        disabled={loading}
                        onClick={handleCreateBadge}
                >{lang['Next']}</Button>
            </div>
        </div>
    </div>
}