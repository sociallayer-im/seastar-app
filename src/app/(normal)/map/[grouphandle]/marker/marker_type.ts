export interface MarkerType {
    label: string,
    category: string,
    pin: string,
    pin_checked: string,
}

export const MARKER_TYPES: MarkerType[] = [
    {
        label: 'Share',
        category: 'share',
        pin: '/images/marker/Vision Spot.png',
        pin_checked: '/images/marker/Vision Spot_checked.png',
    },
    {
        label: 'Food & Drink',
        category: 'food',
        pin: '/images/marker/Utility Table.png',
        pin_checked: '/images/marker/Utility Table_checked.png',
    },
    {
        label: 'Attractions',
        category: 'attractions',
        pin: '/images/marker/Vision Spot.png',
        pin_checked: '/images/marker/Vision Spot_checked.png',
    },
    {
        label: 'Co-working',
        category: 'co-working',
        pin: '/images/map_marker.png',
        pin_checked: '/images/map_marker.png',
    },
    {
        label: 'Community',
        category: 'community',
        pin: '/images/map_marker.png',
        pin_checked: '/images/map_marker.png',
    },
    {
        label: 'Book & Zine',
        category: 'book-zine',
        pin: '/images/map_marker.png',
        pin_checked: '/images/map_marker.png',
    },
    {
        label: 'Music & Club',
        category: 'music-club',
        pin: '/images/map_marker.png',
        pin_checked: '/images/map_marker.png',
    }
]