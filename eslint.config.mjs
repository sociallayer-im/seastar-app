// ESLint 9 flat config.
//
// This used to extend eslint-config-next, which cannot work here any more:
// it requires `next/dist/compiled/babel/eslint-parser`, and `next` is not a
// dependency of this app. It only ever resolved because bun installed `next`
// as an optional peer of @unpic/react — so linting was quietly relying on a
// package we believed we had removed. pnpm does not install optional peers,
// which is what surfaced it.
//
// Little is lost: nearly every rule that config brought was already disabled
// below, and the Next-specific ones (no-html-link-for-pages, no-img-element,
// no-location-assign-relative-destination) describe a framework this app no
// longer uses. What is worth keeping — rules-of-hooks and the TypeScript
// recommendations — is taken directly from the plugins that provide them.
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
    {
        ignores: ['.next/**', 'node_modules/**', 'public/**', 'dist/**', '.vinext/**']
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        plugins: {'react-hooks': reactHooks},
        rules: {
            // The one rule here that catches real, hard-to-see bugs.
            'react-hooks/rules-of-hooks': 'error',

            // Unchanged from the previous config — these were all off before.
            'no-unused-expressions': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-wrapper-object-types': 'off',
            'react-hooks/exhaustive-deps': 'off',
            // Newly strict in react-hooks v6/v7; they flag long-standing
            // patterns in working code, and churning business files during a
            // toolchain change is how regressions get in.
            'react-hooks/set-state-in-effect': 'off',
            'react-hooks/refs': 'off',
            'react-hooks/immutability': 'off',
            'react-hooks/use-memo': 'off',
            'react-hooks/purity': 'off',
            'react-hooks/static-components': 'off',
            'prefer-const': 'off',

            // js.configs.recommended is kept for what it genuinely catches
            // (no-dupe-keys, no-unreachable, no-undef — a duplicate key in
            // src/lang has bitten this repo before). These seven fired 113
            // times on existing code and found nothing real: `!!x` is the
            // house style, the `while ((m = re.exec(s)))` hits are in vendored
            // prosemirror, and the two "constant truthiness" ones are
            // deliberate `&& false &&` feature switches. Turning them off is
            // parity with what eslint-config-next enforced, not a relaxation.
            'no-extra-boolean-cast': 'off',
            'no-cond-assign': 'off',
            'no-useless-escape': 'off',
            'no-useless-assignment': 'off',
            'no-constant-binary-expression': 'off',
            'preserve-caught-error': 'off',
            // markdown_html.ts strips control characters from URLs on purpose.
            'no-control-regex': 'off',

            'semi': ['error', 'never']
        }
    },
    {
        // Browser and node globals: js.configs.recommended turns on no-undef,
        // which otherwise flags every window/document/process reference.
        languageOptions: {
            globals: {
                window: 'readonly', document: 'readonly', navigator: 'readonly',
                console: 'readonly', fetch: 'readonly', setTimeout: 'readonly',
                clearTimeout: 'readonly', setInterval: 'readonly', clearInterval: 'readonly',
                requestAnimationFrame: 'readonly', cancelAnimationFrame: 'readonly',
                process: 'readonly', Buffer: 'readonly', URL: 'readonly',
                URLSearchParams: 'readonly', FormData: 'readonly', Blob: 'readonly',
                File: 'readonly', FileReader: 'readonly', Image: 'readonly',
                localStorage: 'readonly', sessionStorage: 'readonly',
                performance: 'readonly', structuredClone: 'readonly',
                HTMLElement: 'readonly', HTMLInputElement: 'readonly',
                HTMLDivElement: 'readonly', HTMLButtonElement: 'readonly',
                HTMLTextAreaElement: 'readonly', HTMLVideoElement: 'readonly',
                HTMLCanvasElement: 'readonly', HTMLImageElement: 'readonly',
                MediaStream: 'readonly', CanvasImageSource: 'readonly',
                Uint8ClampedArray: 'readonly', ImageData: 'readonly',
                AbortController: 'readonly', Response: 'readonly', Request: 'readonly',
                Headers: 'readonly', React: 'readonly', JSX: 'readonly',
                NodeJS: 'readonly', globalThis: 'readonly'
            }
        }
    }
]
