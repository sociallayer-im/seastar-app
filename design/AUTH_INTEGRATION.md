# Sign-in moved into seastar-app (2026-07-30)

Signing in used to bounce the user to `auth.sola.day` — a second Next.js app
(`seastar-auth`) on another origin — and back. The sign-in screens now live in
this app, so it happens in place.

This record covers what changed, the production cutover, and the bugs the work
uncovered. Several of those were pre-existing and unrelated to the integration;
they are recorded here because this is where the evidence is.

Deployed: `soon` `3f23370`, `seastar-app` `60a4753`, `seastar-auth` `1a961d0`.

---

## 1. What moved

`seastar-auth`'s screens were ported 1:1, and the **paths are deliberately
identical** so that every sign-in link already in circulation — including
`auth.sola.day` URLs sitting in caches and bookmarks — resolves to the same
screen:

| standalone auth app | here |
|---|---|
| `/` (sign-in) | `/signin`, plus a middleware rewrite of the auth host's `/` |
| `/register` | `/register` |
| `/bind-email` | `/bind-email` |
| `/verify-email?email=` | same |
| `/verify-bind-email?email=` | same |
| `?return=` + `return` cookie | same contract |
| `/status` | dropped — a debug page (its component was literally named `TextPage`); ProfileMenu already covers sign-out |
| `/api/google-siginin` | `/api/google-signin` (typo fixed; only its own component called it) |

The sign-in root is the one exception: `/` is this app's home page, so the
screen is served at `/signin` and middleware rewrites the auth host's `/` onto
it. `NEXT_PUBLIC_SIGN_IN_URL` is now empty, which selects the in-app screens;
pointing it back at an external origin is the rollback switch.

An orphaned `(normal)/login` route was removed — an email-only sign-in that
nothing ever linked to.

### Ethereum sign-in was simplified deliberately

It talks to `window.ethereum` directly: `eth_requestAccounts`, then
`personal_sign` over a message built by the SDK. The old app used wagmi plus
`@tanstack/react-query` to enumerate connectors and probe each for readiness,
which for a single injected provider bought a spinner and a one-item list. Two
RPC calls replace it and **this app gained no dependency for it**.

Security is unchanged because none of it was ever client-side: the nonce is
server-minted, single-use and short-lived; the SIWE `domain` must be on the
backend's allowlist; and `siwe-rb` recovers the signer. Verified against a live
backend with a real signature (accepted), a replayed one (401), and a domain off
the allowlist (401).

### Google sign-in

The access token is exchanged server-side in `app/api/google-signin` because
that call needs `NEXT_TOKEN`, a shared secret that makes the backend mint a
session for **any** email. The handler only ever signs in the address Google's
userinfo endpoint returns, and requires `email_verified`.

Prerequisite, done manually: `app.sola.day` (and `id.sola.day`) added to the
OAuth client's authorized JavaScript origins.

---

## 2. Host layout

```
before                                  after
app.sola.day    seastar-app             app.sola.day   seastar-app
auth.sola.day   seastar-auth            auth.sola.day  seastar-app  (rewrites / -> /signin)
                                        id.sola.day    seastar-auth (rollback target)
```

`id.sola.day` is a new CNAME to `sg.sola.day`, DNS-only like every other
subdomain so Traefik keeps issuing its own certificate. CN needed no DNS change
— `*.juluo.xyz` is wildcard-resolved to the single host.

`seastar-auth` was **moved rather than removed**, so rolling back is a redeploy
of a known-good image instead of a rebuild.

### Cutover order

Traefik's routing is undefined while two services claim the same Host rule:

1. `cd soon && ginger deploy` — SIWE allowlist must accept `app.sola.day` first,
   or wallet sign-in fails from the app host
2. `cd seastar-auth && ginger deploy` — releases `auth.sola.day`, moves to `id.sola.day`
3. `cd seastar-app && ginger deploy` — claims `auth.sola.day`

`auth.sola.day` was unrouted for ~14 minutes between steps 2 and 3 (longer than
planned — see §5). Only stale cached HTML points there; freshly served pages
link to `/signin` on their own origin.

### Rollback

```
cd seastar-app  && ginger rollback 142468e     # previous image has SIGN_IN_URL=https://auth.sola.day baked in
cd seastar-auth && <restore hosts: [auth.sola.day]> && ginger deploy --skip-push
```

---

## 3. Bugs found and fixed

### Pre-existing, unrelated to the integration

**Google sign-in had been broken all along.** `NEXT_TOKEN` did not match between
the frontends and `soon`: the backend expects `a4dea34a…`, both frontends sent
`15c76ac4…`, so `/auth/trusted_signin` returned 401, which the route handler
turned into a 500. The integration inherited it by faithfully copying
`seastar-auth`'s config. Proved without creating any user by posting the token
with no email — a wrong token gives `Unauthorized`, the right one gives
`email or sol_address is required`.

**Group permissions: `'all'` vs `'everyone'`.** Three components disagreed about
the same field. The settings form wrote `'all'`; the frontend read
`'all' | 'everyone' | empty` as open; `soon`'s `EventPolicy#create?` accepted
only `'everyone'` and fell through to manager-only for anything else. So a group
configured as "Everyone" showed a Create Event button that 403'd —
**160 of 453 groups**, including the busiest (vitalistbayca 336 events, zanzalu
317, viva-frontier-tower 246, playground1 193).

Data normalized in production (160 / 162 / 165 rows across the three columns,
`NULL` treated as `all`; none existed), and interpretation collapsed into one
function, `normalizeGroupPermission`, used by both the reader and the settings
form. It errs open: reading an unknown value as manager-only silently locks a
group down, which is the failure being fixed.

**Anonymous 500 on recurring events.** `recurring#show` never skipped
`authenticate!`, so `GET /api/v1/recurring/:id` 401'd without a token. The event
detail loader calls it whenever `recurring_id` is set and the SDK's
`requestOrNull` only swallows 404 — a 401 throws and takes the whole page down.
`forms#get_event_form` had the identical defect, so every anonymous view of an
event with a registration form 500'd too. Both are now public reads with
visibility enforced explicitly.

**Cancelled events stayed in listings** for the organizer and group managers,
including the schedule grid, which has no "Cancelled" badge to disambiguate
them. Now excluded from every listing; still reachable by direct link. The
exclusion is written NULL-safe — `events.status` has a default but no NOT NULL
constraint, and a plain `where.not(status: [...])` evaluates to NULL for a NULL
status in Postgres, which would have dropped every legacy row that has none.

**Single-event ICS export** leaked cancelled and pending events:
`calendar_visible?` hand-copied `Event.visible_to`'s status list and had drifted.
Now delegates to the scope instead of restating it.

### Introduced by this work, caught before or shortly after release

**Session cookie had no Domain.** `setAuth` wrote a host-only cookie, so a
session written here was invisible to `auth.sola.day` and to group subdomains,
and could shadow the real cookie under the same name. `setAuth`/`signOut` now
share one domain helper, which returns undefined for localhost and bare IPs (a
Domain attribute on a single-label host makes browsers drop the whole
Set-Cookie).

**Open redirect via `?return=`.** The value went unvalidated into
`window.location` and `redirect()`. `?return=javascript:…` was script execution
on our own origin, and any absolute URL was an open redirect wearing our domain.
Now restricted to the current registrable domain, which still allows the
cross-origin returns group subdomains need. Confirmed: `app.sola.day` and
`foo.sola.day` pass; `evil.com`, `sola.day.evil.com`, `//evil.com` and
`javascript:` all fall back.

**Post-sign-in fallback navigated to the string `"undefined"`** —
`NEXT_PUBLIC_DEFAULT_RETURN` is set in no environment.

**Auth screens rendered with no padding.** The markup was ported verbatim
including `btn btn-md` / `input` class names — those are daisyUI, which is not a
dependency here (removed in the dependency audit; it had never been registered
in `tailwind.config`'s plugins). Confirmed against the built CSS rather than by
eye: `.btn`, `.btn-md`, `.btn-ghost`, `.input`, `.input-error` are all absent
from it while the app's own `.page-width` and `.bg-secondary` are present.
Replaced with this app's `Button` and `Input` components.

**Empty-valued keys in `secrets.inject`.** `NEXT_PUBLIC_SIGN_IN_URL` is now the
empty string by design, and ginger treats an inject key with no value as unset
and aborts the deploy. Removed from the inject lists (nothing reads them
server-side — `NEXT_PUBLIC_*` are inlined at build time). Every remaining inject
key was cross-checked against its env file: 9/9 SG, 8/8 CN.

---

## 4. Operational traps discovered

**Nomad believes this host has 8 GiB; it has 3.8 GiB.** So it over-schedules and
the kernel handles the difference. Raising any task memory limit needs
`free -h` on `sg.sola.day` checked first, not Nomad's accounting.

**`seastar-app` was cgroup-OOM-killed in a restart loop** on ginger's default
512 MiB task memory. `next start` sits around 350 MiB but spikes past 512 while
server-rendering the heavier routes. Three allocations died in 19 minutes; while
no container was up, Traefik had no backend and answered with a bare Go
`404 page not found` — which is what "all static chunks are 404ing" actually
was. Raised to 900 MiB.

**Image builds are not memory-bound.** Measured on `wamo.city` during a real
build: baseline 12,413 MiB, peak 14,929 MiB — the build itself costs ~2.5 GB
against ~19 GB free. The constraint is the deploy target, not the builder.

**Docker registry traffic needs the local proxy; prod `curl` must not use it.**
`CLAUDE.md` says to unset `http_proxy`/`https_proxy`/`all_proxy` — that applies
to `curl` against production URLs, where the proxy returns misleading 404s. It
does **not** apply to `ginger deploy`: `auth.docker.io` is DNS-poisoned on this
machine (answers vary — `31.13.92.5`, `108.160.172.204`) and is unreachable
without the proxy, so the base-image token fetch times out. Three deploys failed
on this before the cause was clear; every resolver on the builder returned clean
addresses, which is what localised it to the client side.

**`.env.production` / `.env.cn.production` are gitignored** in both `soon` and
`seastar-app`. The `NEXT_TOKEN` correction, the SIWE allowlist and the empty
`NEXT_PUBLIC_SIGN_IN_URL` exist only on the machine that deployed. **Deploying
from anywhere else will reintroduce the Google sign-in 500.** This is the
biggest outstanding operational risk.

**Grepping rendered HTML for UI strings false-positives.** The language
dictionary is serialised into every page, so a string match proves nothing.
Match on structural markers (a class name, an element) instead. This produced a
wrong "the button is rendering" conclusion once during verification.

---

## 5. What is not done

- **CN (`juluo.xyz`) was never deployed.** The configs on disk say
  `seastar-app: [www.juluo.xyz, auth.juluo.xyz]` and
  `seastar-auth: [id.juluo.xyz]`, but production still runs the old arrangement
  (`auth.juluo.xyz` served by `seastar-auth`, `id.juluo.xyz` unrouted). Same
  three-step order applies. Google sign-in is off on CN, so that prerequisite
  does not apply.
- **The backend does not enforce `can_join_event`.**
  `ParticipantsController#create` checks required form fields, duplicate joins
  and capacity — never the group's join scope. Hiding the RSVP button is a UI
  hint, not a permission; a direct POST still joins. Adding enforcement would
  change behaviour for the 12 groups not set to "everyone".
- **`seastar-auth`'s Dockerfile is still the unslimmed one** — it copies the
  whole `/app` including cypress, storybook, wagmi and ethers into the runtime
  image. It is only a rollback target now, so this was left alone.
- **`HeaderSignInBtn` still carries `btn btn-ghost btn-sm`** — the same dead
  daisyUI classes, pre-existing and outside the auth screens. Worth a separate
  sweep of the whole app.
- `sails` was removed from `sg.sola.day` (freeing ~190 MiB). Restore with
  `cd sails && ginger deploy --skip-push`; image
  `ghcr.io/sociallayer-im/sails:d71c53e`. Its data is untouched in
  `sola_sails_db`, a different database from `soon`'s `sola_soon_db`.
