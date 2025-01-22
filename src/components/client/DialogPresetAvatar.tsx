import {Dictionary} from '@/lang'
import useUploadAvatar from '@/hooks/useUploadAvatar'
import Image from 'next/image'

export interface DialogPresetAvatarProps {
    lang: Dictionary
    close: () => void
    onSelect?: (image: string) => void
}

export const AvatarTemplates = [
    'https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/cvs06g2n_kARAFJMkR',
    'https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/w7r1n4di_QxRt8gZBb',
    'https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/nlo4yr8d_7q2G-EXlw',
    'https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/iwag5uop_tOEUTph5X',
    'https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/jhzcud5i_ya0y_MMjI',
    'https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/go5h8usy_Tw9HhUYEC',
    'https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/6bzj88py_Z9rQMzf7I',
    'https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/vtkjvmuj_P1ZCoNa-2',
    'https://ik.imagekit.io/soladata/tr:n-ik_ml_thumbnail/5ypp629n_4fCVC1OIJ'

]

export default function DialogPresetAvatar({close, lang, onSelect}: DialogPresetAvatarProps) {
    const {uploadAvatar} = useUploadAvatar()

    return <div className="w-[360px] rounded-lg shadow p-4 grid grid-cols-1 gap-3 bg-background">
        <div className="font-semibold flex-row-item-center justify-between">
            <div>{lang['Choose a image for badge']}</div>
            <i className="uil-times-circle cursor-pointer text-xl"
               onClick={close}/>
        </div>

        <div onClick={() => uploadAvatar({
            onUploaded: (image: string) => {
                onSelect?.(image);
                close()
            }
        })}
             className="hover:brightness-95 flex flex-col items-center justify-center rounded-lg bg-secondary py-6 cursor-pointer">
            <img className="w-14 h-14" src="/images/upload_image_icon.png" alt=""/>
            <div className="font-semibold text-sm mt-1">{lang['Upload Image']}</div>
        </div>

        <div>
            <div className="font-semibold mb-1">{lang['Public']}</div>
            <div className="flex-row-item-center overflow-auto w-full pb-1">
                {
                    AvatarTemplates.map((url, index) => {
                        return <div
                            key={index}
                            onClick={() => {onSelect?.(url); close()}}
                            className="mr-1 cursor-pointer hover:brightness-95 rounded-lg bg-secondary w-20 h-20 flex-row-item-center justify-center  flex-shrink-0">
                            <Image src={url} width={64} height={64}
                                   className="rounded-full w-[64px] h-[64px]"
                                   alt=""/>
                        </div>
                    })
                }
            </div>
        </div>
    </div>
}