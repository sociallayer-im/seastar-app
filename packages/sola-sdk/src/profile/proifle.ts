import {gqlClient} from "../client"
import {GET_PROFILE_BY_HANDLE} from "./schemas"
import {ProfileDetail} from "./types"

export const getProfileDetailByHandle = async (handle: string) => {
    const response = await gqlClient.query({
        query: GET_PROFILE_BY_HANDLE,
        variables: {handle}
    })

    if (!response.data.profiles || !response.data.profiles.length) {
        return null
    }

    return  {
        ...response.data.profiles[0],
        // follower_count: response.data.follower_count.aggregate.count,
        // following_count: response.data.following_count.aggregate.count
    } as ProfileDetail
}