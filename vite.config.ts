import {defineConfig} from 'vite'
import vinext from 'vinext'

// When no vite.config.ts exists, vinext generates this baseline itself; once
// the file exists, the plugin and dedupe MUST be declared here (vinext hands
// the whole config over to this file — everything went 404 without them).
// The optimizeDeps block is dev-experience only; production output is
// unaffected.
export default defineConfig({
    plugins: [vinext()],
    resolve: {
        dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime']
    },
    // Pre-bundle the heavy client dependencies so the dev server serves each
    // as one optimized chunk instead of walking their module graphs on demand.
    // Without this, a page navigation in dev fetched ~205 individual modules
    // and interactive components visibly popped in one by one.
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'dayjs',
            'js-cookie',
            'copy-to-clipboard',
            'markdown-it',
            'qrcode',
            'clsx',
            'class-variance-authority',
            'tailwind-merge',
            'embla-carousel-react',
            'embla-carousel-autoplay',
            'lucide-react',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-toast',
            '@react-oauth/google',
            '@vis.gl/react-google-maps',
            'prosemirror-view',
            'prosemirror-state',
            'prosemirror-model',
            'prosemirror-commands',
            'prosemirror-keymap',
            'prosemirror-history',
            'prosemirror-menu',
            'prosemirror-inputrules',
            'prosemirror-dropcursor',
            'prosemirror-gapcursor',
            'prosemirror-schema-list',
            'viem'
        ]
    }
})
