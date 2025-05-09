
import { Group } from '@sola/sdk'



// some of the requirement_tags for the edge city group
export const SeatingStyle = ['theater', 'workshop', 'single table + chairs', 'Yoga mats']
export const AVNeeds = ['presentation screen', 'microphone', 'speakers']

export const isEdgeCityGroup = (groupId: number) => {
    return [3427, 3409, 3463, 3454, 924, 3579].includes(groupId)
}

export const tagsGroupNeeded = (groupId: number) => {
    return [3579].includes(groupId)
}

export const edgeTagsGroups = [{
    title: 'Weekly Themes',
    tags: ['Wellbeing', 'Food']
}, {
    title: 'Community',
    tags: ['Community', 'Social Events']
}]