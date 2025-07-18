import type { Config } from "tailwindcss"

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            screens: {
                'xs': {'min': '374px'}
            },
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: "hsl(var(--primary))",
                'primary-foreground': `hsl(var(--primary-foreground))`,
                secondary: "var(--secondary)",
                'secondary-foreground': `var(--secondary-foreground)`,
                special: "var(--special)",
                'special-foreground': "var(--special-foreground)",
                destructive: "hsl(var(--destructive))",
                'destructive-foreground': "hsl(var(--destructive-foreground))",
            },
        },
    },
    plugins: [require("tailwindcss-animate")]
}
export default config
