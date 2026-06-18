// Lightweight liveness probe for kamal-proxy health checks.
// Static 200 — does not depend on the backend API.
export const dynamic = 'force-dynamic'

export function GET() {
    return new Response('OK', {status: 200})
}
