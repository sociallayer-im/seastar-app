'use client'

import {Dictionary} from "@/lang"
import {Button} from "@/components/shadcn/Button"
import {Input} from "@/components/shadcn/Input"
import {Textarea} from "@/components/shadcn/Textarea"
import {useState} from "react"
import {Media_Meta, urlToUsername} from "@/utils/social_media_meta"
import useUploadAvatar from "@/hooks/useUploadAvatar"
import useModal from "@/components/client/Modal/useModal"
import DialogEditSocialMedia from "@/components/client/DialogEditSocialMedia"
import Cookies from "js-cookie"
import {useToast} from "@/components/shadcn/Toast/use-toast"
import {ProfileDetail, updateProfile} from '@sola/sdk'

export default function EditProfile({profile, lang}: { profile: ProfileDetail, lang: Dictionary }) {
    const [newProfile, setNewProfile] = useState<ProfileDetail>(profile)
    const {uploadAvatar} = useUploadAvatar()
    const {openModal, showLoading, closeModal} = useModal()
    const {toast} = useToast()

    const showEditSocialMedia = (type: keyof Solar.SocialMedia, value?: string) => {
        openModal({
            content: (close) => <DialogEditSocialMedia
                lang={lang}
                value={value}
                close={close}
                type={type}
                onConfirm={(value) => {
                    setNewProfile({
                        ...newProfile,
                        social_links: {
                            ...newProfile.social_links,
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
            const authToken = Cookies.get(process.env.NEXT_PUBLIC_AUTH_FIELD!)
            if (!authToken) {
                throw new Error('Please login first')
            }

            await updateProfile(newProfile, authToken)
            toast({title: 'Profile updated'})
            window.location.href = '/profile/' + newProfile.handle
        } catch (e: unknown) {
            console.error('[EditProfile]: ', e)
            toast({title: e instanceof Error ? e.message : 'Failed to update profile', variant: 'destructive'})
        } finally {
            closeModal(loadingId)
        }
    }

    return <div className="min-h-[100svh] w-full">
        <div className="page-width min-h-[100svh] px-3 pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Edit Profile']}</div>

            <div className="flex flex-col max-w-[800px] mx-auto">
                <div className="flex-1 sm:mr-4 mr-0 sm:mb-0 mb-4">
                    <div className="font-semibold pb-2">{lang['Avatar']}</div>
                    <div className="bg-secondary rounded-lg h-[170px] flex-col flex justify-center items-center mb-4">
                        <img className="mb-3 w-[100px] h-[100px] rounded-full"
                            src={newProfile.image_url || '/images/upload_default.png'} alt=""/>
                        <Button size="sm"
                            onClick={() => uploadAvatar({
                                onUploaded: (url) => {
                                    setNewProfile({...newProfile, image_url: url})
                                }
                            })}
                            className="text-xs bg-white !rounded-3xl !text-foreground">{lang['Upload Avatar']}</Button>
                    </div>

                    <div className="font-semibold pb-2">{lang['Nickname']}</div>
                    <Input value={newProfile.nickname || ''}
                        placeholder={lang['Nickname']}
                        onChange={e => {
                            setNewProfile({...newProfile, nickname: e.target.value})
                        }}
                        maxLength={30}
                        endAdornment={<span>{newProfile.nickname?.length || 0}/30</span>}
                        className="w-full mb-4"/>

                    <div className="font-semibold pb-2">{lang['Location']}</div>
                    <Input value={newProfile.location || ''}
                        placeholder={lang['Location']}
                        onChange={e => {
                            setNewProfile({...newProfile, location: e.target.value})
                        }}
                        className="w-full mb-4"/>

                    <div className="font-semibold pb-2">{lang['Bio']}</div>
                    <Textarea value={newProfile.about || ''}
                        placeholder={lang['Bio']}
                        onChange={e => {
                            setNewProfile({...newProfile, about: e.target.value})
                        }}
                        className="min-h-[120px]"
                    />
                </div>
                <div className="flex-1 mt-6">
                    <div className="font-semibold pb-2">{lang['Social Links']}</div>
                    {
                        !!newProfile.social_links && Object.keys(Media_Meta).map((key, i) => {
                            return <div key={i}
                                className="flex flex-row items-center justify-between rounded-lg mb-3 px-3 h-[3rem] bg-secondary border border-secondary">
                                <div className="flex-row-item-center">
                                    <div className="w-9 flex flex-row justify-center">
                                        <i className={`${Media_Meta[key as keyof typeof Media_Meta].icon} !text-lg`}/>
                                    </div>
                                    <span>{Media_Meta[key as keyof typeof Media_Meta].label}</span>
                                </div>
                                <div>
                                    {
                                        !!newProfile.social_links?.[key as keyof typeof Media_Meta] &&
                                        <span className="mr-2">
                                            {urlToUsername(newProfile.social_links[key as keyof typeof Media_Meta]!, key as keyof typeof Media_Meta)}
                                        </span>
                                    }
                                    <Button
                                        onClick={() => showEditSocialMedia(key as keyof typeof Media_Meta, newProfile.social_links?.[key as keyof typeof Media_Meta] || '')}
                                        size={'xs'}
                                        variant={'normal'}
                                        className="text-sm">Edit</Button>
                                </div>
                            </div>
                        })
                    }
                </div>
            </div>
            <div className="flex-row-item-center sm:justify-center my-4">
                <Button variant={'secondary'} className="flex-1 sm:flex-grow-0 sm:min-w-36 mr-4" onClick={() => {
                    history.go(-1)
                }}>{lang['Cancel']}</Button>
                <Button variant={'primary'} className="flex-1 sm:flex-grow-0 sm:min-w-36"
                    onClick={handleSave}>{lang['Save']}</Button>
            </div>
        </div>
    </div>
}
