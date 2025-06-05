'use client'

import {Dictionary} from "@/lang"
import {Button, buttonVariants} from "@/components/shadcn/Button"
import {Input} from "@/components/shadcn/Input"
import {Textarea} from "@/components/shadcn/Textarea"
import {useState} from "react"
import {Media_Meta, urlToUsername} from "@/utils/social_media_meta"
import useUploadAvatar from "@/hooks/useUploadAvatar"
import useModal from "@/components/client/Modal/useModal"
import DialogEditSocialMedia from "@/components/client/DialogEditSocialMedia"
import Cookies from "js-cookie"
import {useToast} from "@/components/shadcn/Toast/use-toast"
import {Switch} from "@/components/shadcn/Switch"
import {GroupDetail, updateGroup, Membership, freezeGroup} from '@sola/sdk'
import useConfirmDialog from '@/hooks/useConfirmDialog'
import {getAuth} from '@/utils'
import {CLIENT_MODE} from '@/app/config'

export interface EditProfileProps {
    group: GroupDetail
    lang: Dictionary
    isManager: boolean
    isOwner: boolean
    members: Membership[]
    currProfileHandle?: string
}

export default function EditProfile({group, lang, isManager, isOwner, members, currProfileHandle}: EditProfileProps) {
    const [newGroup, setNewGroup] = useState<GroupDetail>(group)
    const {uploadAvatar} = useUploadAvatar()
    const {openModal, showLoading, closeModal} = useModal()
    const {showConfirmDialog} = useConfirmDialog()
    const {toast} = useToast()

    const memberCount = members.filter(m => m.role !== 'owner').length
    const managerCount = members.filter(m => m.role === 'manager').length

    const enableGoogleMap = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_MAP === 'true'

    const showEditSocialMedia = (type: keyof Solar.SocialMedia, value?: string) => {
        openModal({
            content: (close) => <DialogEditSocialMedia
                lang={lang}
                value={value}
                close={close}
                type={type}
                onConfirm={(value) => {
                    setNewGroup({
                        ...newGroup,
                        social_links: {
                            ...newGroup.social_links,
                            [type]: value
                        }
                    })
                }}
            />
        })
    }

    const handleSave = async () => {
        const loadingId = showLoading()
        try {
            const auth_token = Cookies.get(process.env.NEXT_PUBLIC_AUTH_FIELD!)
            if (!auth_token) {
                throw new Error('Please login first')
            }

            await updateGroup({
                params: {group: newGroup, authToken: auth_token},
                clientMode: CLIENT_MODE
            })
            toast({title: 'Group updated'})
            window.location.href = '/group/' + newGroup.handle
        } catch (e: unknown) {
            console.error('[EditGroup]: ', e)
            toast({title: e instanceof Error ? e.message : 'Failed to update Group', variant: 'destructive'})
        } finally {
            closeModal(loadingId)
        }
    }

    const handleFreezeGroup = async () => {
        showConfirmDialog({
            lang: lang,
            title: lang['Freeze Group'],
            content: lang['Are you sure you want to freeze this group? This action cannot be undone.'],
            onConfig: async () => {
                const loading = showLoading()
                try {
                    const authToken = getAuth()
                    if (!authToken) {
                        closeModal(loading)
                        toast({title: 'Please login first', variant: 'destructive'})
                        return
                    }
                    await freezeGroup({
                        params: {groupId: group.id, authToken: authToken!},
                        clientMode: CLIENT_MODE
                    })
                    window.location.href = `/profile/${currProfileHandle}`
                } catch (e: unknown) {
                    console.error(e)
                    closeModal(loading)
                    toast({title: e instanceof Error ? e.message : 'Failed to freeze group', variant: 'destructive'})
                }
            }
        })
    }

    return <div className="min-h-[100svh] w-full">
        <div className="page-width-md min-h-[100svh] px-3 !pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Edit Profile']}</div>

            <div className="flex flex-col mx-auto">
                <div className="flex-1 mb-4">
                    <div className="font-semibold pb-2">{lang['Avatar']}</div>
                    <div className="bg-secondary rounded-lg h-[170px] flex-col flex justify-center items-center mb-4">
                        <img className="mb-3 w-[100px] h-[100px] rounded-full"
                             src={newGroup.image_url || '/images/upload_default.png'} alt=""/>
                        <Button size="sm"
                                onClick={() => uploadAvatar({
                                    onUploaded: (url) => {
                                        setNewGroup({...newGroup, image_url: url})
                                    }
                                })}
                                className="text-xs bg-white !rounded-3xl !text-foreground">{lang['Upload Avatar']}</Button>
                    </div>

                    <div className="font-semibold pb-2">{lang['Nickname']}</div>
                    <Input value={newGroup.nickname || ''}
                           placeholder={lang['Nickname']}
                           onChange={e => {
                               setNewGroup({...newGroup, nickname: e.target.value})
                           }}
                           maxLength={30}
                           endAdornment={<span>{newGroup.nickname?.length || 0}/30</span>}
                           className="w-full mb-4"/>

                    <div className="font-semibold pb-2">{lang['Location']}</div>
                    <Input value={newGroup.location || ''}
                           placeholder={lang['Location']}
                           onChange={e => {
                               setNewGroup({...newGroup, location: e.target.value})
                           }}
                           className="w-full mb-4"/>

                    <div className="font-semibold pb-2">{lang['Bio']}</div>
                    <Textarea value={newGroup.about || ''}
                              placeholder={lang['Bio']}
                              onChange={e => {
                                  setNewGroup({...newGroup, about: e.target.value})
                              }}
                              className="min-h-[120px]"
                    />

                    <div className="mt-6">
                        <div className="font-semibold pb-2">Group member Setting</div>
                        <a href={`/group/${group.handle}/management/member`}
                           className={`${buttonVariants({variant: 'secondary'})} w-full mb-3`}>
                            <div className="flex-row-item-center w-full justify-between">
                                <div>Members</div>
                                <div className="font-normal flex-row-item-center">
                                    <div>{memberCount + managerCount}</div>
                                    <i className="uil-arrow-right text-2xl"/>
                                </div>
                            </div>
                        </a>
                        <a href={`/group/${group.handle}/management/manager`}
                           className={`${buttonVariants({variant: 'secondary'})} w-full`}>
                            <div className="flex-row-item-center w-full justify-between">
                                <div>Managers</div>
                                <div className="font-normal flex-row-item-center">
                                    <div>{managerCount}</div>
                                    <i className="uil-arrow-right text-2xl"/>
                                </div>
                            </div>
                        </a>
                    </div>

                    <div className="flex-row-item-center justify-between mt-6">
                        <div className="font-semibold">Enable Event</div>
                        <Switch checked={newGroup.event_enabled}
                                onClick={() => setNewGroup({...newGroup, event_enabled: !newGroup.event_enabled})}
                        />
                    </div>

                    {enableGoogleMap &&
                        <div className="flex-row-item-center justify-between mt-6">
                            <div className="font-semibold">Enable Map</div>
                            <Switch checked={newGroup.map_enabled}
                                    onClick={() => setNewGroup({...newGroup, map_enabled: !newGroup.map_enabled})}
                            />
                        </div>
                    }

                </div>

                <div className="flex-1 mt-6">
                    <div className="font-semibold pb-2">{lang['Social Links']}</div>
                    {
                        (Object.keys(Media_Meta) as Array<keyof typeof Media_Meta>).map((key, i) => {
                            return <div key={i}
                                        className="flex flex-row items-center justify-between rounded-lg mb-3 px-3 h-[3rem] bg-secondary border border-secondary">
                                <div className="flex-row-item-center">
                                    <div className="w-9 flex flex-row justify-center">
                                        <i className={`${Media_Meta[key].icon} !text-lg`}/>
                                    </div>
                                    <span>{Media_Meta[key].label}</span>
                                </div>
                                <div>
                                    {
                                        !!newGroup.social_links?.[key] &&
                                        <span className="mr-2">
                                            {urlToUsername(newGroup.social_links[key], key)}
                                        </span>
                                    }
                                    <Button
                                        onClick={() => showEditSocialMedia(key, newGroup.social_links?.[key] || '')}
                                        size={'xs'}
                                        variant={'normal'}
                                        className="text-sm">Edit</Button>
                                </div>
                            </div>
                        })
                    }
                </div>
            </div>
            <div className="flex-row-item-center justify-between my-4">
                {isOwner &&
                    <Button variant={'secondary'}
                            className="!text-gray-400 text-sm flex-1 sm:flex-grow-0 sm:min-w-36 mr-4"
                            onClick={handleFreezeGroup}>
                        {lang['Freeze Group']}
                    </Button>
                }
                <div>
                    <Button variant={'secondary'} className="flex-1 sm:flex-grow-0 sm:min-w-36 mr-4" onClick={() => {
                        history.go(-1)
                    }}>{lang['Cancel']}</Button>
                    <Button variant={'primary'}
                            disabled={!isManager}
                            className="flex-1 sm:flex-grow-0 sm:min-w-36"
                            onClick={handleSave}>{lang['Save']}</Button>
                </div>
            </div>
        </div>
    </div>
}

