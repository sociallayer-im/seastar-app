import GoogleMap, {GoogleMapMarkerProps} from '@/components/client/Map'
import {buttonVariants} from '@/components/shadcn/Button'
import {Dictionary} from '@/lang'

export default function EventHomeMap({mapMarkers, langType, groupHandle, lang}: {mapMarkers: GoogleMapMarkerProps[], langType: string, lang: Dictionary, groupHandle: string}) {

    const style = {
        height: '260px',
        marginBottom: '24px'
    }

    return <div className="event-map w-full relative overflow-hidden rounded-lg loading-bg" style={style}>
        <GoogleMap
            markers={mapMarkers}
            center={mapMarkers[0]?.position}
            langType={langType}/>
        <a className={`${buttonVariants({
            variant: "secondary",
            size: "sm"
        })} absolute bottom-2 right-2 z-10 text-xs bg-white shadow`}
           href={`/map/${groupHandle}/event`}>
            {lang['Browse on Map']} <i className="uil-expand-arrows-alt text-base"/>
        </a>
    </div>
}