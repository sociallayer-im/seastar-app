export interface Place {
    id: string
    name: string
    address: string | null
    latitude: number | null
    longitude: number | null
    description: string | null
    data: Record<string, any> | null  // jsonb; carries the Google Maps place_id
    created_at: string
}
