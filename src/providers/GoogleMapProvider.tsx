import {ReactNode} from "react"
import {APIProvider} from '@vis.gl/react-google-maps'

export default function GoogleMapProvider(props: { children: ReactNode, langType?: string }) {
    const lang = props.langType === 'zh' ? 'zh' : 'en'

    return <APIProvider
        onError={(e) => {
            console.warn(e)
        }}
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY!}
        language={lang}>
        {props.children}
    </APIProvider>
}
