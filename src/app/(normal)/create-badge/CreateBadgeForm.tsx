'use client'

import {Dictionary} from "@/lang"
import {Input} from "@/components/shadcn/Input"
import DropdownMenu from "@/components/client/DropdownMenu"
import {getAvatar} from "@/utils"
import {Button, buttonVariants} from "@/components/shadcn/Button"
import {Textarea} from "@/components/shadcn/Textarea"

export default function CreateBadgeForm({lang}: {lang:Dictionary}) {
    return <div className="min-h-[calc(100svh-48px)] w-full">
        <div className="page-width min-h-[calc(100svh-48px)] px-3 pb-12 pt-0">
            <div className="py-6 font-semibold text-center text-xl">{lang['Create Badge']}</div>

            <div className="flex flex-col max-w-[500px] mx-auto">
                <div className="font-semibold pb-2">Badge Image</div>
                <div
                    className="cursor-pointer bg-secondary rounded-lg h-[170px] flex-col flex justify-center items-center mb-4">
                    <img className="w-[100px] h-[100px] rounded-full"
                        src={'/images/upload_default.png'} alt=""/>
                </div>

                <div className="font-semibold pb-2">Badge Name</div>
                <Input className="mb-4" placeholder={'Naming your badge'}/>

                <div className="font-semibold pb-2">Creator</div>
                <div className="mb-4">
                    <DropdownMenu
                        onSelect={() => {}}
                        valueKey="id"
                        options={[] as Solar.ProfileSample[]}
                        value={undefined}
                        renderOption={(creator, index) => <div className="flex-row-item-center" key={index}>
                            <img src={getAvatar(creator.id, creator.image_url)} className="w-6 h-6 rounded-full mr-2" alt=""/>
                            {creator.nickname || creator.handle}
                        </div>}>
                        <div
                            className={`${buttonVariants({variant: 'secondary'})} w-full !justify-between items-center cursor-pointer`}>
                            <div className="overflow-hidden whitespace-nowrap overflow-ellipsis font-normal flex-row-item-center">
                                <img className="w-6 h-6 rounded-full mr-2"
                                     src={getAvatar(1, undefined)} alt=""/>
                                {123123}
                            </div>

                            <div className="flex items-center">
                                <i className="uil-exchange-alt text-lg"/>
                            </div>
                        </div>
                    </DropdownMenu>
                </div>

                <div className="font-semibold pb-2">Reason (Optional)</div>
                <Textarea className="mb-4" placeholder={'Naming your badge'}/>

                <Button variant={"primary"}>Next</Button>
            </div>
        </div>
    </div>
}