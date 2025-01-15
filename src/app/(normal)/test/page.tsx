import {getProfileDetailByHandle} from "@sola/sdk"
import TestClient from "./Client"


export default async function Test() {
    const profile = await getProfileDetailByHandle('zfd')
    return <div>
        {JSON.stringify(profile)}
        <TestClient />
    </div>
}