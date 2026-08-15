# sola.day becomes the canonical host (2026-08-15)

The international frontend moved from `app.sola.day` to the bare apex
`sola.day`. `app.sola.day` and `www.sola.day` now 308 to it, and two groups
answer on their own subdomains.

Deployed: `soon` `4f9dc3e`, `seastar-app` `1f2ede2`.
Rollback baseline: `soon` `2e88232`, `seastar-app` `6c5fca1`.

---

## 1. What each host does now

| host | behaviour |
|---|---|
| `sola.day` | canonical — serves Discover |
| `app.sola.day/*` | 308 → `sola.day/*`, path and query preserved |
| `www.sola.day/*` | 308 → `sola.day/*` |
| `auth.sola.day` | unchanged — `/` still rewrites to `/signin` |
| `infinitacity.sola.day` | renders the `infinitacity` group home **in place** |
| `edgeesmeralda.sola.day` | renders the `edgeesmeralda` group home in place |

The group subdomains are a rewrite, not a redirect: the address bar keeps the
branded host. That mechanism already existed and was simply unreachable —
`middleware.ts` calls `getGroupSubdomain(host)`, sets `x-event-home`, and
`app/(normal)/page.tsx` renders `GroupEventHome` off that header. All that was
missing was DNS and a Traefik host rule.

`soon`'s `domains` table holds 391 group rows (and 30,912 *user* rows, from the
old sails per-user vanity subdomains) that could work identically. Nothing in
either codebase reads that table. Only the two above were asked for; each new
one needs a DNS record, a `proxy.hosts` entry, and a `ALLOWED_SIWE_DOMAINS`
entry. A wildcard would need a wildcard Traefik rule and a DNS-01 ACME
challenge, because HTTP-01 cannot answer for `*.sola.day`.

## 2. How the redirect is built

In `src/middleware.ts`, not Traefik — ginger's config exposes no way to attach
an arbitrary redirect middleware to a router.

Driven by two env vars (`src/app/config.ts`), both defaulting to empty:

- `NEXT_PUBLIC_CANONICAL_HOST` — the one host to land on
- `NEXT_PUBLIC_CANONICAL_REDIRECT_HOSTS` — comma-separated list that 308s to it

Empty means "no host normalisation", which is what local dev and CN both need:
CN's canonical host *is* `www.juluo.xyz` and must not bounce anywhere. Only
`.env.production` opts in.

Two deliberate choices:

- **308, not 301.** It is the only permanent redirect browsers must replay with
  the original method and body. The auth screens POST; 301 would silently turn
  those into GETs.
- **An explicit host list, not "anything that isn't canonical".** A catch-all
  would break `auth.sola.day` (which must answer on its own name) and every
  group subdomain (which must render, not redirect).

The redirect runs before every other branch, so alias hosts never reach the
sign-in rewrite or the group lookup. `app.sola.day`/`www.sola.day` stay in
`ginger.yml`'s `proxy.hosts` on purpose — they are routed here *only* so the
redirect can happen. Dropping them yields a bare Traefik 404 instead.

⚠️ A 308 is cached hard by browsers. Undoing this move does not un-teach the
browsers that already followed it.

## 3. Things that deliberately did NOT move

- **`MAIL_FROM`** stays `send@app.sola.day`. The sending domain is a DNS fact:
  SPF/DKIM/MX are published under `send.app.sola.day`, while `sola.day`'s own
  MX points at Google Workspace. Moving it without first verifying a new
  sending domain in Resend fails SPF on every message.
- **Plausible's `data-domain`** stays `app.sola.day`. It is a site *identifier*
  that must match a site configured in the Plausible instance, not a URL —
  renaming it splits the history in two. Override with
  `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` once the site is renamed there.
- **iCalendar UIDs.** See `soon/design/CHANGELOG.md` — they used to derive from
  `WEB_URL`, so this move would have doubled every event in every subscribed
  calendar. Now pinned to a constant.

## 4. The outage this caused, and the ordering rule

**Deploy after DNS, not before.** Traefik asks Let's Encrypt for the
certificate the moment the router appears — *not* on the first request, which
is what `ginger.yml`'s comment claimed and what the cutover was planned around.

Deploying first meant the HTTP-01 challenge for `sola.day`/`www.sola.day` was
answered by Vercel (404 — DNS had not moved yet) and the two group subdomains
had no records at all. The whole SAN bundle failed, so every host in the list
without an existing certificate served a TLS error — including `sola.day`,
which `app.sola.day` had just started 308ing to. ~9 minutes of downtime.

Recovery is not obvious: **Traefik re-runs ACME only on a router config
change**, so re-deploying the identical list is a no-op. The hosts had to be
removed and re-added across two `ginger deploy --skip-push` runs (~20s each) so
they registered as new domains. Restarting Traefik would also work but it is
shared with ~12 other services.

## 5. Follow-ups

- [ ] **Google sign-in on `sola.day` fails** until `https://sola.day` is added
      to the OAuth client's authorized JavaScript origins in Google Cloud
      Console. Email and wallet sign-in are unaffected.
- [ ] **CN is not deployed.** `juluo.xyz` was added to `ALLOWED_SIWE_DOMAINS`
      and `NEXT_PUBLIC_CANONICAL_ORIGIN` was set for CN, but neither is live —
      both need `ginger deploy -c ginger.cn.yml` in the respective repo.
      Without the latter, a CN redeploy would emit `https://sola.day/...` in
      its Open Graph tags and link visitors out of CN entirely.
- [ ] The `edge-esemeralda-2025.sola.day` DNS record is misspelled (extra `e`)
      and still points at Vercel. Left alone; it matches no group handle.
