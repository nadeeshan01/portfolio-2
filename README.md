# Technical Plate & Editorial Folio — DevOps Portfolio

A React + Tailwind CSS v4 rebuild of the *stitch_editorial_devops_portfolio* design, rebuilt as a
modern component application with an advanced (but restrained) motion system.

**Design language:** ink on warm, unbleached cotton rag paper — an archival editorial system of
hairline rules, stamped specimen plates, ledger metadata, and monospaced data readouts. Every
corner is square; depth comes from planar contrast and unblurred `3px` offset stamps rather than
blur shadows.

## Stack

| Concern    | Choice                                          |
| ---------- | ----------------------------------------------- |
| Build      | Vite 7 + React 19 + TypeScript (strict)          |
| Styling    | Tailwind CSS v4 (`@theme` design tokens)         |
| Motion     | Framer Motion 12 (scroll reveals, springs, tilt) |
| Icons      | lucide-react + inline brand marks                |
| Type       | Playfair Display · Inter · JetBrains Mono        |

## Case-study dossier (new)

The **CloudPath FocusFlow** card is flagged `NEW` and opens a popup dossier from its
**Open case study** button — a scrollable, ESC-dismissible modal containing:

1. **Overview** — what the project is, what it proves, and a facts ledger.
2. **Technology stack** — six grouped chip blocks (source, security, containers, k8s, IaC, app).
3. **Delivery architecture — animated** — a blueprint figure whose ten rows walk
   pending → in-flight → verified while pulses travel the dashed connectors (pauses off-screen).
4. **Repository structure, briefly** — every top-level folder/file with a one-line explanation.
5. **Command prompt — examples** — five tabs (Quick start · Docker · Kubernetes · Terraform · AWS·ECR)
   in a terminal that staggers each line in, with a working **Copy** button and blinking caret.
6. **Security & cost notes** — secret-handling rules and the cost-control decisions.


## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production bundle → dist/
npm run preview    # serve the production build on :4173
```

## Motion inventory

- **Masthead** — scroll-progress hairline, `layoutId` active-section underline, slide-in mobile drawer.
- **Metric ticker** — infinite marquee of live delivery metrics.
- **Hero** — staggered entrance choreography, looping typewriter with blinking caret, blueprint
  grid feathered by a radial mask, and a lanyard ID pass that sways on its strap and tilts to the
  pointer (spring-damped) with a portrait fallback plate.
- **Sections** — viewport-triggered rises, staggered children, hairline rules that draw themselves.
- **Sparkline** — SVG `pathLength` draw-on.
- **Pipeline topology** — self-running CI/CD rail: stages flip pending → active → verified while a
  travelling pulse crosses each gutter and a terminal log types itself out; pauses when off screen.
- **Projects** — count-up ledger metrics, stamped offset-shadow hover.
- **Contact** — sharp checkbox stamps, and a form that resolves into a rotated "transmission
  received" stamp.
- **Plate rail** — fixed left-margin ledger showing the running plate index and scroll percentage.
- All motion respects `prefers-reduced-motion`.

## Scripts

```bash
node scripts/shoot.mjs   # section screenshots → shots/ (drives installed Chrome)
node scripts/audit.mjs   # console errors, horizontal overflow, font check at 4 breakpoints
```

## Structure

```
src/                    React app (App.tsx · index.css · data/ · lib/ · components/)
Dockerfile              two-stage build → unprivileged nginx (UID 101, :8080)
docker-compose.yml      hardened runtime
                        (+ docker-compose.tls.yml for the Caddy HTTPS edge)
deploy/                 nginx.conf · security-headers.conf · Caddyfile.example
scripts/                headless verification harness
```

## Verification scripts

```bash
node scripts/audit.mjs        # page: console, overflow, fonts @ 4 breakpoints
node scripts/audit-case.mjs   # modal: overflow + console with the dossier open
node scripts/linkcheck.mjs    # every rendered href resolves (no relative links)
node scripts/shoot.mjs        # section screenshots → shots/
node scripts/shoot-case.mjs   # dossier screenshots (desktop + mobile)
node scripts/verify-deck.mjs  # command-deck tabs + clipboard assertions
node scripts/digests.mjs      # check the Dockerfile digest pins (--write to refresh)
```

## Container & deploy runbook

### Build and run locally

```bash
docker compose up -d --build                 # → http://localhost:8080
curl -i http://localhost:8080/healthz        # 200 ok + security headers
docker compose logs -f portfolio
docker compose down --remove-orphans
```

Base images are **pinned by digest** in the `Dockerfile` (`node:22-alpine`,
`nginxinc/nginx-unprivileged:alpine`), so a rebuild is byte-reproducible. Digests
only move when Dependabot opens the bump PR — the weekly cron rebuild alone will
not pick up upstream base patches. `node scripts/digests.mjs` reports drift, and
`--write` repins in place (it covers the Dockerfile only; the Caddy pin in
`docker-compose.tls.yml` is refreshed with `docker buildx imagetools inspect caddy:2-alpine`).

### Publish and deploy

`.github/workflows/docker.yml` pushes to GHCR with `GITHUB_TOKEN` (no stored secret),
for `linux/amd64` + `linux/arm64`. Immutable SHA tags are pushed first; `:main` and
`:latest` are promoted **only after** the Trivy gate passes, so a moving tag can never
point at a rejected image.

```bash
# Deploy an exact commit (preferred)
IMAGE=ghcr.io/<owner>/<repo>:<short-sha> docker compose up -d --pull always

# TLS edge: Caddy issues/renews certs and is the only published port
cp deploy/Caddyfile.example deploy/Caddyfile   # set your real hostname
docker compose -f docker-compose.yml -f docker-compose.tls.yml up -d --pull always
```

### Rollback

Rolling back is a tag swap — the old image is still in the registry, untouched.

```bash
IMAGE=ghcr.io/<owner>/<repo>:<previous-short-sha> \
  docker compose -f docker-compose.yml -f docker-compose.tls.yml up -d --pull always

docker compose ps            # STATUS should reach "running (healthy)"
docker compose logs --tail 50 portfolio
```

### Scan locally, before you push

```bash
docker build -t portfolio:local .
trivy image --severity CRITICAL,HIGH --ignore-unfixed portfolio:local
```

`--ignore-unfixed` matches CI policy: fail only on findings that have an upstream
patch, so an unpatchable base CVE can't block a deploy you cannot fix.

### Confirm the hardening is actually enforced

```bash
docker inspect -f '{{.Config.User}}' portfolio                  # 101:101
docker inspect -f '{{.HostConfig.ReadonlyRootfs}}' portfolio    # true
docker inspect -f '{{json .HostConfig.CapDrop}}' portfolio      # ["ALL"]
docker inspect -f '{{json .HostConfig.SecurityOpt}}' portfolio  # no-new-privileges
docker inspect -f '{{.State.Health.Status}}' portfolio          # healthy
curl -sI https://yourdomain.com/ | grep -i content-security-policy
```

### Monitoring

Probe `https://yourdomain.com/healthz` — a static `200 ok` from nginx, independent of
React rendering. Alert after **2 consecutive failures** to ride out a single restart.
Uptime Kuma (self-hosted, one container) or any free BetterStack / UptimeRobot check
both do the job.
