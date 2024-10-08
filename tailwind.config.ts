import type { Config } from "tailwindcss"
import daisyui from "daisyui"
import themes from "daisyui/src/theming/themes"

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
        },
    },
    plugins: [
        daisyui
    ],
    daisyui: {
        themes: [{
            light: {
                ...themes["light"],
                primary: "#7FF7CE",
                info: '#409eff'
            }
        }],
    }
}
export default config
