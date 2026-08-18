// Shared shell for route-level loading.tsx files: lets the App Router stream
// the layout immediately instead of blocking the whole page on data.ts.
export default function RouteLoading() {
    return <div className="min-h-[calc(100svh-48px)] w-full flex items-center justify-center">
        <i className="uil-spinner-alt text-3xl text-gray-300 animate-spin"/>
    </div>
}
