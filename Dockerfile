# vinext (Vite) build for the seastar-app monorepo. Bun installs and builds;
# the runtime stage is node:24-slim because vinext's SSR pass showed
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
# install above. .env.production has to be in the context: the build reads it
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

# `next` is an *optional* peer of @unpic/react (vinext's next/image shim), so
# bun installs it even though this app dropped Next entirely: 199 MB of the
# 597 MB production node_modules, in every image, pulled on every deploy.
# Nothing resolves it — verified by deleting it locally and running a full
# build plus a production smoke pass on all the main routes.
#
# The `test -d` is the point of this block, not a formality: bun's isolated
# layout is what the paths below are written against, and if a future bun
# changes it these globs would quietly match nothing and silently ship the
# 199 MB again. Failing the build instead forces a re-check.
#
# `webpack` (9.5 MB, peer of react-server-dom-webpack) is deliberately NOT
# pruned: removing it leaves dangling symlinks inside a package vinext does
# use at runtime, which is a poor trade for 9 MB.
RUN test -d node_modules/.bun/node_modules/next \
      || (echo "next not found where expected — bun layout changed, re-check this prune" && exit 1) \
    && rm -rf node_modules/.bun/next@* \
              node_modules/.bun/node_modules/next \
              node_modules/.bun/@unpic+react@*/node_modules/next \
              node_modules/.bun/@unpic+react@*/node_modules/.bin/next \
              node_modules/next

# node, not bun: vinext requires node >= 22 and its SSR pass misbehaved under
# the bun runtime in local testing. The bun-installed node_modules are plain JS
# (--ignore-scripts, no native builds), so they run under node unchanged.
# 24 = active LTS; verified locally (vinext start under 24.18, full smoke pass).
FROM node:24-slim AS production
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
