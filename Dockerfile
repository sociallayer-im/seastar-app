# Next.js (App Router) build for the seastar-app monorepo, run under Bun.
# Built on a remote amd64 builder via ginger; deployed behind kamal-proxy.

FROM oven/bun:1 AS build
WORKDIR /app

# Copy the whole workspace — the build needs packages/* for the @sola/sdk
# workspace dependency, and .env.production so `next build` inlines NEXT_PUBLIC_*.
COPY . .

# --ignore-scripts avoids native builds (e.g. better-sqlite3) we don't need.
RUN bun install --frozen-lockfile --ignore-scripts

# next build reads .env.production (NODE_ENV=production) and bakes
# NEXT_PUBLIC_* into the client bundle.
RUN bun --bun run build

FROM oven/bun:1 AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Bring over the built app together with its installed dependencies.
COPY --from=build /app /app

EXPOSE 3000
# `next start` serves the .next build on 0.0.0.0:$PORT.
ENTRYPOINT ["bun", "--bun", "run", "start"]
