# vinext (Vite) build for the seastar-app monorepo. Bun installs and builds;
# the runtime stage is node:22-slim because vinext's SSR pass showed
# intermittent shell errors under the bun runtime while node was clean.
# Built on a remote amd64 builder via ginger; deployed behind Traefik.
#
# Bun is pinned rather than tracking `oven/bun:1`: a floating base tag changes
# digest whenever upstream releases, which invalidates every layer below it and
# turns an incremental deploy into a full cold build. 1.3.14 is what local dev
# runs, and is what `oven/bun:1` resolved to when this was pinned.
FROM oven/bun:1.3.14 AS build
WORKDIR /app

# Dependencies first, in their own layer, so an ordinary source change reuses
# the cached install instead of re-resolving ~700MB of node_modules every
# deploy. Only the manifests are copied here — the workspace member manifests
# included, since `workspaces: [packages/*]` is resolved at install time and
# bun errors out if packages/sola-sdk/package.json is missing.
#
# --ignore-scripts avoids native builds (e.g. better-sqlite3) we don't need.
COPY package.json bun.lock ./
COPY packages/sola-sdk/package.json packages/sola-sdk/
RUN bun install --frozen-lockfile --ignore-scripts

# Now the source. node_modules is in .dockerignore, so this cannot clobber the
# install above. .env.production has to be in the context: `next build` reads it
# to inline NEXT_PUBLIC_* into the client bundle.
COPY . .
RUN bun --bun run build

# Runtime dependencies only. The build above needs the devDependencies
# (typescript, tailwind, postcss, sass, vite), but `vinext start` does not —
# shipping them meant most of node_modules rode along in the deployed image,
# paid for on every push and pull. Verified locally: a --production install
# serves the dist/ build (vinext + ipaddr.js are regular dependencies).
FROM oven/bun:1.3.14 AS prod-deps
WORKDIR /app
COPY package.json bun.lock ./
COPY packages/sola-sdk/package.json packages/sola-sdk/
RUN bun install --frozen-lockfile --ignore-scripts --production

# node, not bun: vinext requires node >= 22 and its SSR pass misbehaved under
# the bun runtime in local testing. The bun-installed node_modules are plain JS
# (--ignore-scripts, no native builds), so they run under node unchanged.
FROM node:22-slim AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# vinext binds HOST, not HOSTNAME (deliberate upstream rename).
ENV HOST=0.0.0.0

# Only what `vinext start` actually reads at runtime. packages/ comes along
# because `@sola/sdk` resolves through the tsconfig path alias to
# packages/sola-sdk/src/index.ts; the bundler inlines it, but keeping the source
# present means nothing breaks if a server-side path ever resolves it lazily.
# .env.production is read on boot for server-side NEXT_PUBLIC_* reads (ginger
# also injects them at runtime; this keeps the two consistent).
COPY --from=prod-deps /app/node_modules node_modules
COPY --from=build /app/dist dist
COPY --from=build /app/public public
COPY --from=build /app/packages packages
COPY --from=build /app/package.json /app/next.config.mjs /app/.env.production ./

EXPOSE 3000
# `vinext start` serves the dist/ build on 0.0.0.0:$PORT.
ENTRYPOINT ["node", "node_modules/vinext/dist/cli.js", "start"]
