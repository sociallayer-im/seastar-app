import {gql, request} from 'graphql-request'

export interface TabProfileGroup extends Solar.SampleGroupWithOwner {
    memberships: Solar.Membership[]
}

export const UserGroupListData = async (handle: string) => {
    const doc = gql`query MyQuery {
      groups(where: {status: {_neq: "freezed"}, memberships: {role: {_in: ["owner", "member", "manager"]}, profile: {handle: {_eq: "${handle}"}}}}, order_by: {id: desc}) {
        id
        image_url
        handle
        nickname
        memberships (where: {role: {_eq: "owner"}}){
          id
          role
          profile {
            id
            handle
            image_url
            username
            nickname
          }
        }
      }
    }`

    const resp = await request<{ groups: TabProfileGroup[] }>(process.env.NEXT_PUBLIC_GRAPH_URL!, doc)
    return resp.groups.map((group) => {
        const profile = group.memberships.length ? group.memberships?.[0].profile : null
        return {
            ...group,
            owner: profile!
        } as TabProfileGroup
    })
}
