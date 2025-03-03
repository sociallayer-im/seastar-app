'use client'

import HyperDX from '@hyperdx/browser'
import {useEffect} from 'react'
import {getSdkConfig} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'

export default function HyperDx() {

    useEffect(() => {
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
            const apiURL = new URL(getSdkConfig(CLIENT_MODE).api).host
            const graphqlURL = new URL(getSdkConfig(CLIENT_MODE).graphql).host
            HyperDX.init({
                apiKey: '5a926007-e14a-4a37-801b-40fcf982c6da',
                service: 'my-frontend-app',
                tracePropagationTargets: [ new RegExp(`${apiURL}`, "i"), new RegExp(`${graphqlURL}`, "i")], // Set to link traces from frontend to backend requests
                consoleCapture: true, // Capture console logs (default false)
                advancedNetworkCapture: true, // Capture full HTTP request/response headers and bodies (default false)
            })
            console.log('HyperDX init')
        }
    }, [])

    return null
}