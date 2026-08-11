/**
 * Federation types. These describe content that lives on *another* instance —
 * everything here is a local mirror of a remote object, so `uri` (the
 * ActivityPub id) is the identity, not `id`.
 */

export interface FedActor {
    /** ActivityPub id — the canonical identity across the network */
    uri: string
    /** user@host, how a person types it */
    acct: string
    domain: string
    /** Person | Group | Application | … */
    type: string | null
    name: string | null
    summary: string | null
    image_url: string | null
}

export interface FedFollowing extends FedActor {
    state: 'pending' | 'accepted' | 'rejected'
}

export interface FedEventLocation {
    name?: string | null
    address?: string | null
    latitude?: number | null
    longitude?: number | null
}

/**
 * How the origin instance lets people join (Mobilizon's vocabulary):
 *   free       — joining is immediate
 *   restricted — a moderator there approves
 *   invite     — invitation only
 *   external   — registration happens on the origin's own site
 */
export type FedJoinMode = 'free' | 'restricted' | 'invite' | 'external'

export type FedParticipationStatus = 'pending' | 'attending' | 'rejected' | 'cancelled'

export interface FedEvent {
    /** local mirror id, for our own routes */
    id: string
    /** ActivityPub id on the origin instance */
    uri: string
    /** the human page over there */
    url: string | null
    title: string | null
    start_time: string | null
    end_time: string | null
    timezone: string | null
    status: 'CONFIRMED' | 'CANCELLED' | 'TENTATIVE'
    join_mode: FedJoinMode
    external_participation_url: string | null
    max_participant: number | null
    participant_count: number
    location: FedEventLocation
    image_url: string | null
    tags: string[]
    origin: {acct: string, domain: string, name: string | null} | null
    /** only on the detail view */
    content?: string | null
    summary?: string | null
    /** present when the caller is signed in */
    my_status?: FedParticipationStatus | null
}

/** DNS record a group must publish to prove it controls a custom domain. */
export interface FedDnsRecord {
    type: string
    name: string
    value: string
}

/**
 * A group's custom domain (PLAN §9.4). The domain carries the *acct* only —
 * the actor id never moves onto it — so binding and unbinding are both
 * lossless for followers.
 *
 * state: none — nothing claimed; pending — claimed, DNS challenge outstanding;
 * bound — verified and serving.
 */
export interface FedDomainStatus {
    state: 'none' | 'pending' | 'bound'
    domain: string | null
    verified_at: string | null
    /** what people type to find this group today */
    acct: string
    /** what they type when no domain is bound */
    canonical_acct: string
    actor_uri: string
    pending_domain?: string
    dns_challenge?: FedDnsRecord
    dns_routing?: FedDnsRecord
    note?: string
}

/** alsoKnownAs: identities this actor claims as its former selves. */
export interface FedAliases {
    also_known_as: string[]
    actor_uri: string
    /** set once this actor has announced a Move away */
    moved_to: string | null
}
