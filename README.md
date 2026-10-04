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
netlify.toml            build command · SPA fallback · security headers · asset caching
scripts/                headless verification harness
.github/workflows/      ci.yml — every gate below. Netlify does the build + deploy.
.github/                SECURITY.md · dependabot.yml
```

## Verification scripts

```bash
node scripts/audit.mjs          # page: console, overflow, fonts @ 4 breakpoints
node scripts/audit-case.mjs     # modal: overflow + console with the dossier open
node scripts/linkcheck.mjs      # every rendered href resolves (no relative links)
node scripts/shoot.mjs          # section screenshots → shots/
node scripts/shoot-case.mjs     # dossier screenshots (desktop + mobile)
node scripts/verify-deck.mjs    # command-deck tabs + clipboard assertions
node scripts/pins.mjs           # every action pin vs the upstream tag it claims
node scripts/setup-security.mjs # dry-run the GitHub repo settings; --apply to write them
```

## Deploy runbook (Netlify)

### Build and preview locally

```bash
npm run dev             # http://localhost:5173
npm run build           # tsc -b && vite build → dist/
npm run preview         # serve the production build on :4173
node scripts/audit.mjs  # the same check CI gates on
```

`netlify.toml` is the whole deployment surface. It declares `npm ci … && npm run build`
and `publish = "dist"`, plus the two things that used to live in `deploy/nginx.conf`:

- **SPA fallback** — `/* → /index.html 200`, a rewrite (not a redirect) so deep links
  keep their URL for the client router. It sits *below* `/assets/* → 404`, so a hashed
  bundle that no longer exists stays a 404 instead of being handed to the browser as
  JavaScript.
- **Security headers** — CSP, `frame-ancestors`, `nosniff`, referrer policy,
  permissions policy, all carried over from the old nginx snippet, plus **HSTS**, which
  nginx deliberately left off because the Caddy edge set it. There is no edge of our
  own any more, so HSTS is the one header that changed value rather than address.
  Documents get `Cache-Control: public, max-age=0, must-revalidate`; `/assets/*` gets
  `max-age=31536000, immutable`.

### Publish

Netlify builds on every push to `main` and opens a deploy preview for every PR branch.
There is no image, no registry and no signature to verify — the artifact is `dist/`,
and the deploy records the commit that produced it.

The one thing to internalise: **Netlify does not wait for GitHub Actions.** A push
deploys whether or not `ci.yml` is green. The gate therefore lives at *merge*, not at
*release* — make the five `ci.yml` jobs required status checks on `main`, and a broken
change cannot land in the first place — see **Netlify setup** below for the command
that writes those checks.

### Rollback

Deploys are immutable and each keeps its own `dist/`, so a rollback is a pointer move,
not a rebuild:

```bash
# UI: Deploys → pick a known-good deploy → ⋯ → Publish deploy to production
# or, without touching the UI:
git revert <bad-sha> && git push origin main   # the forward fix, still auditable
```

The old deploy stays in the history either way, so nothing is ever lost by rolling back.

### Verify the headers are actually enforced

```bash
SITE=https://<your-site>.netlify.app
curl -sI $SITE/ | grep -i content-security-policy
curl -sI $SITE/ | grep -i strict-transport-security
curl -sI $SITE/assets/<hashed>.js | grep -i cache-control
curl -s -o /dev/null -w '%{http_code}\n' $SITE/any/deep/route   # 200, the SPA shell
curl -s -o /dev/null -w '%{http_code}\n' $SITE/assets/nope.js   # 404, never HTML
```

### Monitoring

Probe `https://<your-site>.netlify.app/` — Netlify serves the built HTML, so a `200`
says the edge is up and the deploy is current, independently of React rendering. Alert
after **2 consecutive failures** to ride out a transient edge blip. Netlify's own status
page plus any free BetterStack / UptimeRobot check both do the job.

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
### The deploy is Netlify's, not ours

`docker.yml` (build → scan → sign → publish → release) is gone with the container it
produced: there is no image to scan or sign and no VPS to SSH into. Netlify owns build
and publish; this repository owns *whether a change is allowed to land*.

That trade is worth stating plainly, because it does cost a control:

| Used to be enforced by | Enforced now by |
| --- | --- |
| Trivy gate before `:main` / `:latest` moved | `npm audit` + dependency review + Dependabot, at merge |
| Keyless cosign signature over the digest | every deploy links back to the commit that built it |
| Health-gated rollout with automatic rollback | Netlify's atomic deploys + one-click rollback |
| `environment: production` human approval | branch protection: required checks + required review |

The last row is the one to actually turn on — see **Publish** above.

### Cutting a release

```bash
npm run typecheck && npm run build   # local sanity first
git tag -a v1.0.1 -m "release: …"
git push origin main                 # gates run, Netlify publishes
git push origin v1.0.1               # the tag is just a ref on that same commit
```

Tags are for humans and for SemVer in the changelog — Netlify deploys the *commit*, not
the tag, so a release is a push to `main` with a label on it. Nothing waits on the tag.

## Netlify setup (one time)

There is no server to provision. The whole setup is a few steps, and none of them puts
a secret in this repository:

1. **Import the repo** — Netlify → *Add new site → Import an existing project* → GitHub
   → this repository. `netlify.toml` already supplies the build command and the publish
   directory, so accept them as shown; there is nothing to type in.
2. **Point the contact form at Web3Forms** — submissions go to Web3Forms, not
   Netlify Forms:
   1. Get an access key at [web3forms.com](https://web3forms.com) — “Get Access
      Key”, sign in with the inbox that should receive submissions, copy the
      key. It is a public, browser-safe key: it is meant to ship in frontend
      code, and Web3Forms enforces rate limits and origin checks server side.
   2. Netlify → *Site configuration → Environment variables → Add a variable*:
      `VITE_WEB3FORMS_KEY` = that key. (Local dev: copy `.env.example` to
      `.env` and fill it in — `.env` is gitignored and must never be committed.)
   3. **Deploy → Trigger deploy → Deploy without cache** — Vite inlines `VITE_*`
      vars at build time, so the key only exists in a build made after the
      variable is set.
   4. Submit the form on the live site: the success panel appears and the
      submission shows up in the Web3Forms dashboard (and in your inbox).
3. **Custom domain** (optional) — attach it in Site settings. Netlify provisions and
   renews TLS for it automatically, which is what replaced the Caddy edge.
4. **Make the gates required**, so Netlify's deploy-on-push cannot outrun them:

```bash
GITHUB_TOKEN=<pat> node scripts/setup-security.mjs          # dry run
GITHUB_TOKEN=<pat> node scripts/setup-security.mjs --apply  # writes
```

That writes branch protection on `main` (required checks, required review, no
force-push, linear history), enables secret scanning with push protection, turns on
Dependabot security updates, and asserts `netlify.toml` still says `publish = "dist"`.

**No repository secrets are required.** The old `SSH_*` secrets and `DEPLOY_DIR` /
`SITE_URL` variables only describe machines you no longer run — delete them from
**Settings → Secrets and variables → Actions** if they are still listed.

`.github/SECURITY.md` covers how to report a vulnerability, and what still holds now
that the container image is gone.
