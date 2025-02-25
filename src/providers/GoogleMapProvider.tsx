import {ReactNode} from "react"
import {APIProvider} from '@vis.gl/react-google-maps'

export default function GoogleMapProvider(props: { children: ReactNode, langType?: string }) {
    const lang = props.langType === 'zh' ? 'zh' : 'en'

    return <APIProvider
        onError={(e) => {
            console.warn(e)
        }}
        apiKey={'AIzaSyCNT9TndlC4dSd0oNR_L4vHYWafLDU1gbg'}
        language={lang}>
        {props.children}
    </APIProvider>
}
