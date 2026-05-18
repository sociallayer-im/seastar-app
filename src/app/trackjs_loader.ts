/**
 * trackjs-loader
 * This file enables polymophism between the server-side and client-side of NextJS
 * by detecting whether `window` exists and returning the appropriate agent.
 */

export const TrackJS = (typeof window !== "undefined") ?
    require("trackjs").TrackJS :
    require("trackjs-node").TrackJS

export function TrackJSInstall() {
    if (process.env.NODE_ENV === 'development') return

    if (!TrackJS.isInstalled()) {
        TrackJS.install({
            token: "52a6f8006a3349a09d6846c3aa7d8226",
            window: { enabled: false }
        })
        console.info("TrackJS Installed" + (typeof window !== "undefined" ? window.location.href : 'server'))
    }
}