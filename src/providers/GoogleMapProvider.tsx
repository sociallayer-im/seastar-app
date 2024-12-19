import {ReactNode} from "react"
import {APIProvider} from '@vis.gl/react-google-maps'

export default function GoogleMapProvider(props: { children: ReactNode }) {
    return <APIProvider apiKey={'AIzaSyCNT9TndlC4dSd0oNR_L4vHYWafLDU1gbg'}>
        {props.children}
    </APIProvider>
}
