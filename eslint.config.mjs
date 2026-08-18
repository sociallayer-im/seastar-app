// ESLint 9 flat config — eslint-config-next@16 dropped eslintrc support, so
// the old .eslintrc.json lives on here. Rule choices are unchanged.
import coreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

export default [
    ...coreWebVitals,
    ...nextTypescript,
    {
        rules: {
            'no-unused-expressions': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@next/next/no-img-element': 'off',
            '@next/next/no-html-link-for-pages': 'off',
            // Crashes with infinite recursion (getStaticStringPrefix) on this
            // codebase as of @next/eslint-plugin-next 16.3.1 — upstream bug.
            '@next/next/no-location-assign-relative-destination': 'off',
            'react-hooks/exhaustive-deps': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            'jsx-a11y/alt-text': 'off',
            // Rules that are new (or newly strict) in eslint-config-next@16 /
            // react-hooks v6. They flag long-standing patterns in working code;
            // keeping the previous strictness rather than churning business
            // files during the toolchain upgrade.
            'prefer-const': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            'react-hooks/set-state-in-effect': 'off',
            'react-hooks/refs': 'off',
            'react-hooks/immutability': 'off',
            'react-hooks/use-memo': 'off',
            'react-hooks/purity': 'off',
            'react-hooks/static-components': 'off',
            '@typescript-eslint/no-wrapper-object-types': 'off',
            'semi': ['error', 'never']
        }
    },
    {
        ignores: ['.next/**', 'node_modules/**', 'public/**']
    }
]
