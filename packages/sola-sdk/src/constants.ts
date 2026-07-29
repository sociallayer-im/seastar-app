// NEXT_PUBLIC_API_URL overrides both when set (production already sets it to
// the same value as the hardcoded default below, so this changes nothing
// there — it only makes local/.env.local overrides actually take effect,
// which they silently didn't before).
export const PROD_NETWORK_CONFIG = {
    api: process.env.NEXT_PUBLIC_API_URL || 'https://api.sola.day',
}

export const DEV_NETWORK_CONFIG = {
    // soon (Rails) dev server
    api: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
}
