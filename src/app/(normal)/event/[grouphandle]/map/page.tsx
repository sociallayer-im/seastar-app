import {redirect} from 'next/navigation'

export default async function MapPage(props:{params: Promise<{grouphandle: string}>}) {
    const params = await props.params
    redirect(`/map/${params.grouphandle}/event`)
}