# vinext (Vite) build for the seastar-app monorepo.
#
# Every stage is node — no bun anywhere. That is not a preference: vinext
# builds *incompletely* under bun's runtime. The build exits 0 and prints
# "Build complete", but dist/client comes out at ~1.6 MB instead of ~4 MB and
# the resulting server answers 404 to every route, health check included. It
# cost three failed deploys on 2026-08-19, each presenting as a health-check
# timeout rather than a build failure. Dropping bun's `--bun` flag was not
# enough either, because oven/bun ships a shim at
# /usr/local/bun-node-fallback-bin/node that re-executes bun, so honouring
# vinext's `#!/usr/bin/env node` shebang still landed on bun.
#
# pnpm is the package manager (pnpm-lock.yaml, pnpm-workspace.yaml), pinned via
# package.json's packageManager field and enabled through corepack.
#
# Built on a remote amd64 builder via ginger; deployed behind Traefik.
FROM node:24-slim AS build
WORKDIR /app
RUN corepack enable

# Dependencies first, in their own layer, so an ordinary source change reuses
# the cached install instead of re-resolving node_modules every deploy. Only the
# manifests are copied here — the workspace member manifest included, since
# pnpm-workspace.yaml is resolved at install time and pnpm errors out if
# packages/sola-sdk/package.json is missing.
#
# --ignore-scripts skips native postinstall steps we do not need; every
# platform-specific dependency here ships prebuilt binaries.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/sola-sdk/package.json packages/sola-sdk/
RUN pnpm install --frozen-lockfile --ignore-scripts

# Now the source. node_modules is in .dockerignore, so this cannot clobber the
# install above. .env.production has to be in the context: the build reads it
# to inline NEXT_PUBLIC_* into the client bundle.
COPY . .
RUN pnpm run build

# Runtime dependencies only. The build above needs the devDependencies
# (typescript, tailwind, postcss, sass, vite), but `vinext start` does not —
# shipping them meant most of node_modules rode along in the deployed image,
# paid for on every push and pull. Verified: a production install serves the
# dist/ build (vinext and ipaddr.js are regular dependencies, and everything
# else the server bundle needs is inlined into dist/ at build time).
#
# Note pnpm, unlike bun, does not install optional peer dependencies — so the
# 199 MB of `next` that bun pulled in as an optional peer of @unpic/react, and
# that this Dockerfile used to prune explicitly, never arrives at all.
FROM node:24-slim AS prod-deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/sola-sdk/package.json packages/sola-sdk/
RUN pnpm install --frozen-lockfile --ignore-scripts --prod

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
