# syntax=docker/dockerfile:1.7
# ============================================================================
# Editorial DevOps Portfolio — production image
#
# builder (node:22-alpine):        full toolchain — tsc + vite. Never ships.
# runner  (nginx-unprivileged):    UID 101 on :8080, static files only.
#
#   docker compose up -d --build      # → http://localhost:8080
#   docker build -t portfolio:dev .
#   docker run --rm -p 8080:8080 portfolio:dev   # then curl localhost:8080/healthz
#
# Both bases are pinned by digest; Dependabot opens the bump PRs.
# ============================================================================

# ----------------------------------------------------------------------------
# Stage 1 — builder
# ----------------------------------------------------------------------------
# Digest-pinned for reproducible builds (verified OCI index: linux/amd64 + arm64).
# Refresh with:  docker buildx imagetools inspect node:22-alpine
FROM node:22-alpine@sha256:0a7108bf6c7bf5de370ffb1a3ed6be93d405b43ff159f681a8d18c0e2bc2e402 AS builder

WORKDIR /app

# Do NOT set NODE_ENV=production here. npm ci omits devDependencies when
# NODE_ENV=production, and the entire build toolchain (typescript, vite,
# tailwind) lives in devDependencies — the build dies with `sh: tsc: not found`.
# `--include=dev` also pins the intent against any ambient CI environment.

# Dependency layer first: rebuilds only when the lockfile changes.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --include=dev --no-audit --no-fund

# Build inputs — only what `tsc -b && vite build` actually reads.
COPY tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts index.html ./
COPY src ./src

RUN --mount=type=cache,target=/root/.npm npm run build

# ----------------------------------------------------------------------------
# Stage 2 — runner (non-root, ~20 MB compressed)
# ----------------------------------------------------------------------------
# `nginx-unprivileged` listens on 8080 and runs as UID 101 — no root required,
# so the container can run with `--user` / `read_only` / `cap_drop=ALL`.
# Digest = the :alpine OCI index as of 2026-10-03 (amd64 + arm64 + 14 more),
# so `docker buildx --platform linux/arm64` still resolves against this pin.
# Refresh with:  docker buildx imagetools inspect nginxinc/nginx-unprivileged:alpine
FROM nginxinc/nginx-unprivileged:alpine@sha256:26b0bf6fbf07297983cb341998d79c831508787de26627dd2a112321b9c3a4af AS runner

ARG BUILD_DATE
ARG GIT_SHA=dev
ARG VERSION=dev
# Injected by CI as <server_url>/<repository>; kept empty locally rather than
# baking a guessed origin into the image metadata.
ARG SOURCE=

LABEL org.opencontainers.image.title="editorial-devops-portfolio" \
      org.opencontainers.image.description="React + Vite editorial DevOps portfolio served by unprivileged nginx" \
      org.opencontainers.image.vendor="Alex Chen" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.source="${SOURCE}" \
      org.opencontainers.image.licenses="MIT"

# Hashed assets need no revalidation; SPA history fallback keeps deep links alive.
# Security headers live in snippets/ so they can be `include`d per-location
# (nginx's add_header replaces rather than merges across scopes).
COPY --chown=101:101 deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=101:101 deploy/security-headers.conf /etc/nginx/snippets/security-headers.conf

# dist/ is the only thing copied — no node_modules, no source, no build config.
COPY --from=builder --chown=101:101 /app/dist /usr/share/nginx/html

EXPOSE 8080

# busybox wget ships with the alpine base — no extra packages for the probe.
# `start-period` avoids flapping while nginx binds; `/healthz` is a static 200,
# so a failure means the server is genuinely down, not that a route 404s.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO /dev/null "http://127.0.0.1:${NGINX_PORT:-8080}/healthz" || exit 1
