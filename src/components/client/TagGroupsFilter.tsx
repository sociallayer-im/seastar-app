'use client'

import {Button} from '@/components/shadcn/Button'
import {getLabelColor} from '@/utils/label_color'
import {Dictionary} from '@/lang'
import {edgeTagsGroups} from '@/app/configForSpecifyGroup'
import {useState} from 'react'

export interface TagGroupsFilterProps {
    lang: Dictionary
    allowResetBtn?: boolean
    tags: string[]
    multiple?: boolean
    values?: string[]
    onSelected?: (tags: string[] | undefined) => void
}

export default function TagGroupsFilterProps({tags, values, onSelected, multiple, lang, allowResetBtn=true}: TagGroupsFilterProps) {
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

    const toggleGroup = (groupTitle: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupTitle]: !prev[groupTitle]
        }))
    }

    const handleSelect = (tag: string) => {
        if (values?.includes(tag)) {
            const newValues = values.filter(v => v !== tag)
            onSelected?.(newValues.length ? newValues : undefined)
        } else {
            multiple ? onSelected?.([...values!, tag]) : onSelected?.([tag])
        }
    }

    const handleGroupSelect = (groupTags: string[]) => {
        onSelected?.(groupTags)
    }

    // 找到包含当前标签的组
    const findGroupForTag = (tag: string) => {
        return edgeTagsGroups.find(group => group.tags.includes(tag))
    }

    // 按组对标签进行分组
    const groupedTags = tags.reduce((acc, tag) => {
        const group = findGroupForTag(tag)
        if (group) {
            if (!acc[group.title]) {
                acc[group.title] = {
                    title: group.title,
                    tags: []
                }
            }
            acc[group.title].tags.push(tag)
        } else {
            if (!acc['Other']) {
                acc['Other'] = {
                    title: 'Other',
                    tags: []
                }
            }
            acc['Other'].tags.push(tag)
        }
        return acc
    }, {} as Record<string, {title: string, tags: string[]}>)

    const { Other, ...namedGroups } = groupedTags
    const groups = Object.values(namedGroups)

    return <div className="flex flex-col gap-4">
        {groups.map((group, groupIndex) => (
            <div key={groupIndex} className="flex flex-col gap-2 border border-gray-200 rounded-md p-2">
                <div 
                    onClick={() => toggleGroup(group.title)}
                    className="justify-between text-sm font-medium cursor-pointer transition-colors flex items-center"
                >
                    <span>{group.title}</span>
                    <i className={`uil ${expandedGroups[group.title] ? 'uil-minus' : 'uil-plus'} text-xl transition-transform`} />
                </div>
                {expandedGroups[group.title] && (
                    <div className="flex flex-row flex-wrap gap-1">
                        {group.tags.map((tag, tagIndex) => {
                            const selected = values?.includes(tag)
                            return (
                                <Button
                                    key={tagIndex}
                                    onClick={() => handleSelect(tag)}
                                    variant={selected ? 'normal' : 'outline'}
                                    size="sm"
                                    className={`border select-none hover:brightness-95 ${selected ? 'border-foreground' : 'border-gray-300'}`}
                                >
                                    <div className="text-xs font-normal">
                                        <div className="font-semibold">{tag}</div>
                                    </div>
                                </Button>
                            )
                        })}
                    </div>
                )}
            </div>
        ))}

        {Other && Other.tags.length > 0 && (
            <div className="flex flex-col gap-2 border border-gray-200 rounded-md p-2">
                <div 
                    onClick={() => toggleGroup('Other')}
                    className="justify-between text-sm font-medium cursor-pointer transition-colors flex items-center"
                >
                    <span>Other</span>
                    <i className={`uil ${expandedGroups['Other'] ? 'uil-minus' : 'uil-plus'} text-xl transition-transform`} />
                </div>
                {expandedGroups['Other'] && (
                    <div className="flex flex-row flex-wrap gap-1">
                        {Other.tags.map((tag, tagIndex) => {
                            const selected = values?.includes(tag)
                            return (
                                <Button
                                    key={tagIndex}
                                    onClick={() => handleSelect(tag)}
                                    variant={selected ? 'normal' : 'outline'}
                                    size="sm"
                                    className={`border select-none hover:brightness-95 ${selected ? 'border-foreground' : 'border-gray-300'}`}
                                >
                                    <div className="text-xs font-normal">
                                        <div className="font-semibold">{tag}</div>
                                    </div>
                                </Button>
                            )
                        })}
                    </div>
                )}
            </div>
        )}

        {allowResetBtn && false &&
            <Button onClick={() => {
                onSelected?.(undefined)
            }}
                    variant={values?.length ? 'outline' : 'normal'}
                    className={`select-none hover:brightness-95 ${values?.length ? 'border-gray-300' : 'border-foreground'}`}
                    size={'sm'}>
                <div className="text-xs font-normal">
                    <div className="font-semibold">{lang['All Tags']}</div>
                </div>
            </Button>
        }
    </div>
}