import {GROUP_FRAGMENT} from '../group'
import {gql} from '@apollo/client'

export const POPUP_CITY_FRAGMENT = gql`
    ${GROUP_FRAGMENT}
    fragment PopupCityFragment on popup_cities {
        id
        image_url
        location
        start_date
        title
        updated_at
        website
        created_at
        end_date
        group_id
        group {
            ...GroupFragment
        }
        group_tags
    }
`

export const GET_POPUP_CITIES = gql`
    ${POPUP_CITY_FRAGMENT}
    query GetPopupCities {
        popup_cities(order_by: {id: desc}) {
            ...PopupCityFragment
        }
    }
`