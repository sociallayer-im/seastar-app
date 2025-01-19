import {gql} from '@apollo/client'
import {INVITE_DETAIL_FRAGMENT} from '../badge'

export const SUBSCRIPTION_SCHEMES = gql`
    ${INVITE_DETAIL_FRAGMENT}
    subscription ProfileSubscription($profile_id: Int!, $addresses:[String!]!, $now: timestamp!) {
        invites: group_invites(where: {
            status: {_eq: "sending"}, 
            expires_at: {_gt: $now}, 
            _or: [
                {receiver_address: {_in: $addresses}}, 
                {receiver_id: {_eq: $profile_id}}
            ]
        })
        {
            ...InviteFragment
        }
    }
`