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
public/                 portrait.jpg — staff-pass photo *and* browser-tab icon
Dockerfile              two-stage build → unprivileged nginx (UID 101, :8080)
docker-compose.yml      hardened runtime
                        (+ docker-compose.tls.yml for the Caddy HTTPS edge)
deploy/                 nginx.conf · security-headers.conf · Caddyfile.example
scripts/                headless verification harness
.github/workflows/      ci.yml (gates) · docker.yml (publish + release)
.github/                SECURITY.md · dependabot.yml
.trivyignore            documented image/config scan suppressions (empty by default)
```

## Verification scripts

```bash
node scripts/audit.mjs          # page: console, overflow, fonts @ 4 breakpoints
node scripts/audit-case.mjs     # modal: overflow + console with the dossier open
node scripts/linkcheck.mjs      # every rendered href resolves (no relative links)
node scripts/shoot.mjs          # section screenshots → shots/
node scripts/shoot-case.mjs     # dossier screenshots (desktop + mobile)
node scripts/verify-deck.mjs    # command-deck tabs + clipboard assertions
node scripts/digests.mjs        # check the Dockerfile digest pins (--write to refresh)
node scripts/pins.mjs           # every action pin vs the upstream tag it claims
node scripts/setup-security.mjs # dry-run the GitHub repo settings; --apply to write them
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
point at a rejected image. Reaching production additionally requires a `v*` tag, a
verified cosign signature and (if configured) a human approval — see **Pipelines** below.

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

## Pipelines

Two workflows. Every third-party action is pinned to a **full commit SHA** (never a
mutable tag), every job declares its own `permissions:` block, and every job has a
`timeout-minutes`. The workflow-level default is `contents: read` — a job that needs
more says so explicitly, so a compromised dependency cannot quietly widen the blast
radius.

### `ci.yml` — gates on every PR and every push to main

| Job | Turns red when |
| --- | --- |
| **typecheck + build** | strict `tsc` fails, `dist/` has no hashed JS/CSS chunk or no `portrait.jpg`, or it contains `.map` / `.env*` files that would ship to the public dir |
| **site audit (4 breakpoints)** | the real production bundle logs console or page errors, or overflows horizontally, at 4 viewport widths (`STRICT=1 node scripts/audit.mjs`) |
| **secret scan (full history)** | gitleaks finds a credential in *any* commit — a key deleted later is still leaked |
| **CodeQL (JS/TS + Actions)** | data-flow analysis flags the app source **or the workflow files themselves** (injection via `${{ }}` interpolation) |
| **dependency advisories** | a PR introduces a vulnerable package or a license outside `allow-licenses`, `npm audit --omit=dev` reports High/Critical in the tree that actually ships, or an action pin doesn't match the commit its version comment names. Needs the repo's **dependency graph** enabled (Settings → Code, security and analysis) — npm has no client-side snapshot upload, so until GitHub's extractor has run, this job fails with the remedy printed in its summary |
| **config + IaC scan** | Trivy finds a High/Critical misconfiguration in the Dockerfile, or either compose file fails to resolve against the schema |

### `docker.yml` — build → scan → sign → publish → release

| Job | Runs on | Does |
| --- | --- | --- |
| **build & smoke test (amd64)** | PRs | builds, starts the container under the production restrictions (non-root, read-only, `cap_drop ALL`), then asserts `/healthz`, the SPA deep-link fallback, CSP on every response shape, `immutable` on assets and `403` on dotfiles |
| **multi-platform publish** | `main`, `v*` tags, weekly cron | pushes the immutable SHA tags, signs the digest with **keyless cosign** (Fulcio cert bound to this repo + file, recorded in Rekor), scans the pushed digest, uploads SARIF, and promotes `:main` / `:latest` / semver tags **only if the scan is clean** |
| **release to production** | `v*` tags only | re-resolves the tag to a digest, `cosign verify` against the exact workflow identity, then SSHes to the VPS, pulls **by digest**, recreates the stack, and rolls back automatically if the health gate fails |

The deploy job is wrapped in `environment: production`, so it can be made to wait for a
manual approval (`node scripts/setup-security.mjs --reviewers <login> --apply`). Its
`concurrency.group` is `production-deploy` with `cancel-in-progress: false` — a running
release is never cancelled mid-swap.

### Cutting a release

```bash
npm run typecheck && npm run build   # local sanity first
git tag -a v1.0.1 -m "release: …"
git push origin main                 # gates + publish run
git push origin v1.0.1               # publish → verify → deploy (approvals first)
```

Rolling back a release does not need a new tag: the deploy job keeps the last known-good
reference in `$DEPLOY_DIR/.previous_digest`. Put it back into `.env` as `IMAGE=` and run
`docker compose -f docker-compose.yml -f docker-compose.tls.yml up -d --no-build --pull never`.

## Server one-time setup

The VPS needs Docker + Compose v2, this repo's compose files and `deploy/` config, and
nothing else — it never builds, so there is no node toolchain to install (and therefore
no npm dependency on the server to exploit). The deploy job replaces **only** the
`IMAGE=` line in `.env`; it never runs `git pull`, never builds, and never edits the
checkout. So when a release changes the compose files, nginx config or Caddyfile, pull
it on the server yourself:

```bash
git -C ~/portfolio pull --ff-only        # config change, then re-run the deploy
```

Run everything below as the unprivileged deploy user (`SSH_USER`), not root.

```bash
# 1. Let the deploy user drive Docker, then clone the ops files
sudo usermod -aG docker $USER            # re-login afterwards
git clone https://github.com/<owner>/<repo>.git ~/portfolio && cd ~/portfolio
cp deploy/Caddyfile.example deploy/Caddyfile   # put the real hostname in

# 2. Registry login so the pull works (or make the GHCR package public)
printf '%s' "$PAT_read_packages" | docker login ghcr.io -u <github-login> --password-stdin

# 3. .env is the single lever the deploy job moves; 600 because it sits next to config
printf 'IMAGE=ghcr.io/<owner>/<repo>@sha256:<digest>\n' > .env
chmod 600 .env

# 4. Start once by hand, confirm the hardening, then seed the rollback pointer
docker compose -f docker-compose.yml -f docker-compose.tls.yml up -d --pull always
docker inspect -f '{{.State.Health.Status}}' portfolio        # healthy
curl -fsSI https://yourdomain.com/ | grep -i content-security-policy
cat .env | sed -n 's/^IMAGE=//p' > .previous_digest           # last known-good
```

Open only 22, 80 and 443 in the host firewall; 8080 stays private because the TLS
overlay `!reset`s the published port and Caddy reaches the app over the compose network.

Then in GitHub (**Settings → Secrets and variables → Actions**):

| Secret | Value |
| --- | --- |
| `SSH_DEPLOY_KEY` | **private** half of a dedicated keypair added to the server's `authorized_keys` |
| `SSH_HOST` | server address |
| `SSH_USER` | the unprivileged deploy user (not root) |
| `SSH_KNOWN_HOSTS` | output of `ssh-keyscan -t ed25519,rsa <host>` — the job refuses to connect without it |

| Variable | Value |
| --- | --- |
| `DEPLOY_DIR` | e.g. `/home/<user>/portfolio` |
| `SITE_URL` | e.g. `https://yourdomain.com` (health gate probes `<SITE_URL>/healthz`) |

Generate the keypair locally and keep the private half off disk after pasting:

```bash
ssh-keygen -t ed25519 -f portfolio_deploy_key -N '' -C "github-actions-deploy"
# public  → server:~/.ssh/authorized_keys   (restrict to the deploy command if you like)
# private → GitHub secret SSH_DEPLOY_KEY
ssh-keyscan -t ed25519,rsa <host>           # → GitHub secret SSH_KNOWN_HOSTS
```

Finally apply the repo-side settings (branch protection, push protection, environment
gate) and read the policy:

```bash
GITHUB_TOKEN=<pat> node scripts/setup-security.mjs          # dry run
GITHUB_TOKEN=<pat> node scripts/setup-security.mjs --apply  # writes
```

`.github/SECURITY.md` covers how to report a vulnerability and how anyone can verify
that a digest was produced by this pipeline.
