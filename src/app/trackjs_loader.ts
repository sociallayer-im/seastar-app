/**
 * trackjs-loader
 * This file enables polymophism between the server-side and client-side of NextJS
 * by detecting whether `window` exists and returning the appropriate agent.
 */

export const TrackJS = (typeof window !== "undefined") ?
    require("trackjs").TrackJS :
    require("trackjs-node").TrackJS;

export function TrackJSInstall() {
    if (!TrackJS.isInstalled()) {
        TrackJS.install({
            token: "0152620d86db425cbb01f366b16bc1ff"
        });
        console.info("TrackJS Installed");
    }
}