'use client'

import { useState } from "react"
import {
    AVNeeds,
    isEdgeCityGroup,
    SeatingStyle,
    ExternalCatering
} from "@/app/configForSpecifyGroup"
import { Button, buttonVariants } from "@/components/shadcn/Button"
import { EventDraftType } from '@sola/sdk'
import { Dictionary } from "@/lang"
import { Switch } from "@/components/shadcn/Switch"

export interface RequirementTagsSelectorProps {
    event: EventDraftType
    setEvent: (event: EventDraftType) => void
    lang: Dictionary
}

export default function RequirementTagsSelector({ event, setEvent, lang }: RequirementTagsSelectorProps) {
    const [avNeeds, setAvNeeds] = useState(event.requirement_tags?.some(t => AVNeeds.includes(t)))
    const [externalCatering, setExternalCatering] = useState(event.requirement_tags?.some(t => ExternalCatering.includes(t)))

    const updateRequirementTags = (tag: string) => {
        if (event.requirement_tags?.includes(tag)) {
            setEvent({
                ...event,
                requirement_tags: event.requirement_tags.filter((t) => t !== tag),
            })
        } else {
            setEvent({
                ...event,
                requirement_tags: [...(event.requirement_tags || []), tag],
            })
        }
    }

    const handleClearAvNeeds = () => {
        setEvent({
            ...event,
            requirement_tags: event.requirement_tags?.filter(t => !AVNeeds.includes(t)) || null,
        })
    }

    const handleClearExternalCatering = () => {
        setEvent({
            ...event,
            requirement_tags: event.requirement_tags?.filter(t => !ExternalCatering.includes(t)) || null,
        })
    }

    const handleSwitchExternalCatering = () => {
        const checked = !externalCatering
        setExternalCatering(checked)
        if (!checked) {
            handleClearExternalCatering()
        }
    }

    const handleSwitchAvNeeds = () => {
        const checked = !avNeeds
        setAvNeeds(checked)
        if (!checked) {
            handleClearAvNeeds()
        }
    }

    return <div className="">
        <div className="text-base font-semibold mb-2">Service Request</div>
        <div className="mb-8 flex flex-col gap-4 border border-gray-200 rounded-lg p-4">
            <div className="font-semibold mb-1 flex-row-item-center justify-between">
                <div className="text-sm">AV Required</div>
                <Switch checked={avNeeds} onCheckedChange={handleSwitchAvNeeds} />
            </div>
            {avNeeds && (
                <div className="flex-row-item-center !flex-wrap gap-2 -mt-2">
                    {AVNeeds.map((t, i) => {
                        return (
                            <Button
                                size={"xs"}
                                onClick={() => updateRequirementTags(t)}
                                className="text-xs mr-1"
                                variant={
                                    event.requirement_tags?.includes(t)
                                        ? "normal"
                                        : "outline"
                                }
                                key={i}
                            >
                                {t}
                            </Button>
                        )
                    })}
                </div>
            )}
            <div className="font-semibold mb-1 flex-row-item-center justify-between">
                <div className="text-sm">External Catering</div>
                <Switch checked={externalCatering} onCheckedChange={handleSwitchExternalCatering} />
            </div>
            {externalCatering && (
                <div className="flex-row-item-center !flex-wrap gap-2 -mt-2">
                    {ExternalCatering.map((t, i) => {
                        return (
                            <Button
                                size={"xs"}
                                onClick={() => updateRequirementTags(t)}
                                className="text-xs mr-1"
                                variant={
                                    event.requirement_tags?.includes(t)
                                        ? "normal"
                                        : "outline"
                                }
                                key={i}
                            >
                                {t}
                            </Button>
                        )
                    })}
                </div>
            )}
        </div>
    </div>
}