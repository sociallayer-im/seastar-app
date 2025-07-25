import {Input} from "@/components/shadcn/Input"
import DropdownMenu, {DropdownTrigger} from "@/components/client/DropdownMenu"
import {useCallback, useEffect, useMemo, useState} from "react"
import {debounce} from 'lodash'
import {useMapsLibrary} from '@vis.gl/react-google-maps'
import {MarkerDraft, VenueDetail} from '@sola/sdk'
import {Dictionary} from '@/lang'

export interface SearchVenueLocationProps {
    state: {draft: VenueDetail, setDraft: (draft: VenueDetail) => void}
    lang: Dictionary

}

export default function SearchVenueLocation({
    state: {draft, setDraft},
    lang
}: SearchVenueLocationProps) {
    const placesLib = useMapsLibrary('places')
    const AutocompleteService = useMemo(() => {
        return !!placesLib && new placesLib.AutocompleteService()
    }, [placesLib])
    const placesService = useMemo(() => {
        return !!placesLib && new placesLib.PlacesService(document.querySelector('#gmap') as HTMLDivElement)
    }, [placesLib])

    const [predictions, setPredictions] = useState<google.maps.places.QueryAutocompletePrediction[]>([])
    const dropdown: DropdownTrigger = {trigger: null}
    const sessionToken = useMemo(() => {
        return !!placesLib ? new placesLib.AutocompleteSessionToken() : undefined
    }, [placesLib])

    const handleSearch = useCallback(debounce(async (keyword: string) => {
        if (!AutocompleteService) return

        // check if the keyword is geo point
        const rex = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/

        let customAddress: google.maps.places.QueryAutocompletePrediction | null = null
        if (rex.test(keyword)) {
            const [lat, lng] = keyword.split(',')
            customAddress = {
                description: `Use ${lat},${lng}`,
                structured_formatting: {
                    main_text: `${lat},${lng}`,
                    secondary_text: 'Custom Address'
                }
            } as google.maps.places.QueryAutocompletePrediction
        }

       const {predictions} = await AutocompleteService.getPlacePredictions({
            input: keyword,
            sessionToken: sessionToken
        })

        let res = customAddress ? [customAddress]  : []
        if (predictions?.length) {
            const _predictions = predictions.filter(p => !!p.place_id)
            res = res.concat(_predictions)
        }
        setPredictions(res)
        !!res.length && dropdown.trigger && dropdown.trigger(true)

    }, 500), [AutocompleteService])

    const handleSelected = (prediction: google.maps.places.QueryAutocompletePrediction) => {
        if (!placesService) return

        if (!prediction.place_id) {
            // custom address
            const [lat, lng] = prediction.structured_formatting.main_text.split(',')
            setDraft({
                ...draft,
                formatted_address: prediction.structured_formatting.main_text,
                location: prediction.structured_formatting.secondary_text,
                geo_lat: Number(lat),
                geo_lng: Number(lng),
                location_data: null
            })
        } else {
            // get place details
            placesService.getDetails({
                fields: ['geometry', 'formatted_address', 'name', 'place_id'],
                placeId: prediction.place_id
            }, (place) => {
                if (place) {
                    setDraft({
                        ...draft,
                        formatted_address: place.formatted_address!,
                        location: prediction.structured_formatting.main_text!,
                        geo_lat: place.geometry?.location?.lat() || null,
                        geo_lng: place.geometry?.location?.lng() || null,
                        location_data: place.place_id || null
                    })
                }
            })
        }
    }

    const [keywords, setKeywords] = useState<string>('')
    useEffect(() => {
        if (keywords) {
            handleSearch(keywords)
        }
    }, [keywords])


    return <div className="w-full">
        <div id="gmap" className="w-0 h-0"/>
        <div className="w-full">
            <DropdownMenu
                trigger={dropdown}
                options={predictions}
                fixWidth={true}
                onSelect={(opts) => {
                    handleSelected(opts[0])
                }}
                value={[]}
                renderOption={(opt) => <div>
                    <div className="font-semibold">{opt.structured_formatting.main_text}</div>
                    <div className="text-sm text-gray-500">{opt.structured_formatting.secondary_text}</div>
                </div>}
                valueKey={'place_id'}>
                <Input className="w-full"
                    onChange={e => {
                        setKeywords(e.target.value)
                        setDraft({...draft, formatted_address: e.target.value})
                    }}
                    onFocus={() => !!predictions.length && dropdown.trigger && dropdown.trigger(true)}
                    placeholder={lang['Input address or geo point eg. 4071.1,-74.06']}
                    value={draft.formatted_address || ''}
                />
            </DropdownMenu>
        </div>
    </div>
}
