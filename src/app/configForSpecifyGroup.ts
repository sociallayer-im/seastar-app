
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
    tags: ['Protocols for Flourishing', 'Reality Reinvented', 'Environments of Tomorrow', 'Decentralized Technologies']
}, {
    title: 'Community',
    tags: ['Social Gathering', 'Workouts', 'Wellbeing', 'Food & Beverages', 'Party', 'Vibe-coding', 'Outdoor Adventure', 'Field Trip', 'Kids & Families']
},{
    title: 'Topics',
    tags: ['AI', 'Neurotech', 'Biotech', 'AR/VR/XR', 'D/ACC', 'Hardtech', 'Blockchain & Cryptography', 'Privacy', 'Health & Longevity', 'Education', 'Art & Design', 'Protocol Research', 'Philosophy', 'Politics', 'Climate & Sustainability', 'Agtech', 'Governance', 'Enlightment']
}]