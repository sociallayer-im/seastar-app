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
# `bun run build`, NOT `bun --bun run build`. The --bun flag forces vite to run
# under bun's runtime instead of node, and vinext builds incompletely there:
# the command still exits 0 and prints "Build complete", but dist/client comes
# out at ~1.6 MB instead of ~8 MB and the server then 404s every single route.
# That is what broke the 2026-08-19 deploys — twice — while the health check
# failure looked like a memory or networking problem.
RUN bun run build

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
# vinext takes PORT from the environment; the listen host is not read from the
# environment at all and already defaults to 0.0.0.0. Kept as documentation of
# the intended bind address — it is not what makes it happen.
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

# YATCH_TOKEN is a registry *push* credential that ginger reads from the env
# file; nothing in the app reads it, and shipping it means anyone who can pull
# this image can write to the registry. ginger.cn.yml already strips it while
# building the CN env file, but ginger.yml has no such pipeline, so the SG
# image carried it. Stripping here covers both environments and cannot be
# forgotten when a pipeline is edited.
RUN grep -v '^YATCH_TOKEN' .env.production > .env.production.clean \
    && mv .env.production.clean .env.production \
    && ! grep -q '^YATCH_TOKEN' .env.production

EXPOSE 3000
# `vinext start` serves the dist/ build on 0.0.0.0:$PORT.
ENTRYPOINT ["node", "node_modules/vinext/dist/cli.js", "start"]
