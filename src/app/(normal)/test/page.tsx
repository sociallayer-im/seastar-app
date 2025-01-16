import {getBadgeDetailByOwnerHandle, getBadgeClassDetailByOwnerHandle, getBadgeAndBadgeClassByOwnerHandle} from "@sola/sdk"

import TestClient from "./Client"
import TestClient2 from './Client2'


export default async function Test() {
    const profile = await getBadgeDetailByOwnerHandle('zfd')
    const profile1 = await getBadgeClassDetailByOwnerHandle('zfd')
    const profile2 = await getBadgeAndBadgeClassByOwnerHandle('zfd')



    return <div>
        {JSON.stringify(profile)}
        {JSON.stringify(profile1)}
        {JSON.stringify(profile2)}
        <TestClient />
        <TestClient2 />
    </div>
}