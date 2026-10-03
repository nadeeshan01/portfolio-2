# Security Policy

This repository ships a static React bundle, built and published by Netlify straight from `main`.
There is no container, no registry and no server of our own to defend — the attack surface is a
build pipeline and a CDN. The goal of this policy is to keep it that way: what runs in production
must be built from this repository's source, under gates a change has to clear before it merges.

## Reporting a vulnerability

**Please do not open a public issue.** Use one of:

- GitHub **Private vulnerability reporting** — *Security* tab → *Report a vulnerability*
  (enabled on this repository; the report is invisible until you and I agree to disclose it).
- Email, if you cannot use GitHub: address in my GitHub profile, PGP on request.

Include: affected commit/tag or image digest, a reproduction, and the impact you see. No proof of
concept against the live site is needed — a description is enough.

I aim to **acknowledge within 3 business days** and to have a fix or a written explanation within
14. Reports that turn out to be configuration choices I intend to keep will get that reasoning, not
a silent close.

## What is in scope

| In scope | Typically out of scope |
| --- | --- |
| `netlify.toml` — build command, publish directory, SPA rewrite, security headers | Vulnerabilities in Netlify's own platform or CDN (theirs to own, tracked but not ours) |
| Response headers as actually served — CSP, HSTS, frame-ancestors, caching | Social engineering, phishing, credential stuffing against the contact form (it is static — it submits nowhere) |
| `.github/workflows/*.yml` (injection, privilege escalation, unpinned actions) | DNS / registrar / Cloudflare account issues |
| Secrets committed to git history | Automated scanning of the live site without prior agreement |
| Client-side code that leaks or mishandles data | Missing features, dependency version freshness on its own |

## How the pipeline protects production

The release path is `push → gates → merge → Netlify build → atomic deploy`.

1. **The gate is at merge, not at deploy.** Netlify publishes on push and does **not** wait for
   CI — so `main` carries *required status checks* plus a required review. A change that fails a
   gate cannot land, and therefore cannot ship. In the current design this is the single most
   important control, and `node scripts/setup-security.mjs --apply` is what writes it.
2. **CI gates** (`.github/workflows/ci.yml`) — strict TypeScript and a real production build, a
   headless-Chrome render check over the *built* bundle at four viewport widths, CodeQL over both
   the app source and the workflow files themselves, gitleaks across **full git history**,
   `npm audit` on the production tree, a dependency licence and advisory review on every PR, and
   a check that every pinned action SHA still matches the tag its comment names.
3. **Build isolation** — Netlify builds in a clean ephemeral environment from the committed
   lockfile (`npm ci`), so the artifact is a function of the commit and nothing else. There is no
   long-lived build host whose state could leak into a release.
4. **Atomic deploys and rollback** — a deploy swaps the whole site at once, so a visitor never
   sees a half-old, half-new bundle. Every previous deploy is retained and can be republished in
   one step, and each deploy records the revision it built.
5. **Supply chain** — every third-party GitHub Action is pinned to a full commit SHA carrying a
   version comment that `scripts/pins.mjs` verifies against upstream, so a retagged release cannot
   change what the pipeline runs. Dependabot keeps both the npm tree and those pins moving.
6. **Secrets** — no deploy credential exists in this repository. Secret scanning with push
   protection runs on every push, so a leaked key is rejected before the commit is accepted.
7. **Response headers** — CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
   `Permissions-Policy`, COOP/CORP and HSTS are declared in `netlify.toml` and served by the CDN
   on every response shape: document, hashed asset and deep link alike.

## Verifying what you are served

There is no image digest to verify any more. What you can verify is that the response carries
this repository's policy rather than a default, and that the build behind it is a commit you can
read:

```bash
SITE=https://<your-site>.netlify.app
curl -sI $SITE/ | grep -i content-security-policy      # this repo's CSP, not a bare default
curl -sI $SITE/ | grep -i strict-transport-security
curl -s -o /dev/null -w '%{http_code}\n' $SITE/any/deep/route   # 200, the SPA shell
curl -s -o /dev/null -w '%{http_code}\n' $SITE/assets/nope.js   # 404, never HTML
```

Every Netlify deploy links to the revision it built, so the line from what you are looking at to
a commit in this history needs no signature to follow — only the deploy page and `git log`.

## Secrets and supported versions

- No deploy credential is stored in this repository or in GitHub Actions — Netlify authenticates
  to GitHub through its own app installation, scoped to this repository.
- `.env*` stays git-ignored, and nothing in the build reads a secret at runtime: the shipped
  artifact is a static bundle with no server-side code to hand one to.
- `node scripts/setup-security.mjs` re-applies branch protection, secret scanning and push
  protection, and re-checks that `netlify.toml` still declares the build Netlify runs.

Security fixes ship the way everything else does: merge to `main` and let Netlify publish. Every
previous deploy is retained, so a bad release rolls back to an exact earlier deploy rather than
being patched forward under pressure.
