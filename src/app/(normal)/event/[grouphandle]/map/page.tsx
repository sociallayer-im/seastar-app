import {redirect} from 'next/navigation'

export default function MapPage({params}:{params: {grouphandle: string}}) {
    redirect(`/map/${params.grouphandle}/event`)
}