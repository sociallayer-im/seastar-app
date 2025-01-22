import {getSdkConfig} from '../client'
import {Event, Group, getGroupDetailById} from '@sola/sdk'
import {PopupCity} from './types'

export const discoverData = async () => {
    const url = `${getSdkConfig().api}/event/discover`
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error('Failed to fetch:' + response.status)
    }

    const data = await response.json()
    const mapGroup = await getGroupDetailById(3558)

    const sortedPopupCities = data.popups.sort((a: PopupCity, b: PopupCity) => {
        // if a popup city has ":featured" tag, it should be placed at the top
        if (a.group_tags?.includes(':featured')) {
            return -1
        }
    })

    return {
        eventGroups: data.groups as Group[],
        popupCities: sortedPopupCities as PopupCity[],
        events: data.events as Event[],
        mapGroup: mapGroup!
    }
}