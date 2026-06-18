export interface Place {
    id: number
    name: string
    address: string | null
    geo_lat: number | null
    geo_lng: number | null
    location_viewport: string | null
    data: string | null  // Google Maps place_id
    created_at: string
    updated_at: string
}
