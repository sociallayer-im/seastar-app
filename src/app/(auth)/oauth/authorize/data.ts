import {getOauthAuthorizeInfo, OauthAuthorizeInfo, OauthAuthorizeQuery, SolaApiError} from '@sola/sdk'
import {CLIENT_MODE} from '@/app/config'
import {getServerSideAuth} from '@/app/actions'

/**
 * The consent screen's data. The query string comes from the third-party
 * client, is passed through untouched, and is validated exclusively by the
 * backend — parsing it here would create a second, divergent definition of
 * what a valid authorization request is.
 */
export interface OauthAuthorizeDataProps {
    query: OauthAuthorizeQuery
    info: OauthAuthorizeInfo | null
    /** RFC 6749 error code from the backend, e.g. invalid_scope. */
    error: string | null
    errorDescription: string | null
    authToken?: string
}

export default async function OauthAuthorizeData(
    searchParams: Record<string, string | string[] | undefined>
): Promise<OauthAuthorizeDataProps> {
    const one = (key: string) => {
        const value = searchParams[key]
        return Array.isArray(value) ? value[0] : value
    }

    const query: OauthAuthorizeQuery = {
        client_id: one('client_id') ?? '',
        redirect_uri: one('redirect_uri') ?? '',
        response_type: one('response_type') ?? '',
        scope: one('scope') ?? '',
        code_challenge: one('code_challenge') ?? '',
        code_challenge_method: one('code_challenge_method') ?? '',
        state: one('state'),
        nonce: one('nonce')
    }

    const authToken = await getServerSideAuth()

    try {
        const info = await getOauthAuthorizeInfo({params: {query, authToken}, clientMode: CLIENT_MODE})
        return {query, info, error: null, errorDescription: null, authToken}
    } catch (e) {
        // A malformed request must be shown here, not bounced to the client's
        // redirect_uri — until the backend has confirmed the redirect_uri is
        // registered, sending anything to it is an open redirect.
        if (e instanceof SolaApiError) {
            // On the OAuth endpoints `message` is the RFC code and
            // `description` is the sentence — see SolaApiError.
            return {
                query,
                info: null,
                error: e.message || 'invalid_request',
                errorDescription: e.description ?? null,
                authToken
            }
        }
        throw e
    }
}
