export default function LoadingGlobal() {
    return <div data-testid="loading-global" className="fixed left-0 top-0 z-[99999] w-[100vw] h-[100svh] flex flex-col items-center justify-center">
        <div className="w-[80px] h-[80px] rounded-2xl bg-[rgba(0,0,0,0.5)] flex flex-row items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="32px" height="32px" viewBox="0 0 128 128">
                <rect x="0" y="0" width="100%" height="100%" fill="none"/>
                <g>
                    <linearGradient id="linear-gradient">
                        <stop offset="0%" stopColor="#ffffff"/>
                        <stop offset="100%" stopColor="#999"/>
                    </linearGradient>
                    <path
                        d="M63.85 0A63.85 63.85 0 1 1 0 63.85 63.85 63.85 0 0 1 63.85 0zm.65 19.5a44 44 0 1 1-44 44 44 44 0 0 1 44-44z"
                        fill="url(#linear-gradient)" fillRule="evenodd"/>
                    <animateTransform attributeName="transform" type="rotate" from="0 64 64" to="360 64 64" dur="1080ms"
                        repeatCount="indefinite"></animateTransform>
                </g>
            </svg>
        </div>
    </div>
}
