# Security Policy

This repository ships a static React bundle from an unprivileged nginx container, deployed to a
single VPS. The attack surface is small, and the goal of this policy is to keep it that way: what
runs in production must be built here, scanned here, signed here, and verified before it lands.

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
| The published container image and its supply chain | Vulnerabilities in third-party bases with no upstream fix (tracked, not blocked — see Trivy policy) |
| `deploy/nginx.conf`, `deploy/security-headers.conf`, `deploy/Caddyfile.example` | Social engineering, phishing, credential stuffing against the contact form (it is static — it submits nowhere) |
| `.github/workflows/*.yml` (injection, privilege escalation, unpinned actions) | DNS / registrar / Cloudflare account issues |
| Secrets committed to git history | Automated scanning of the live site without prior agreement |
| Client-side code that leaks or mishandles data | Missing features, dependency version freshness on its own |

## How the pipeline protects production

The release path is `tag → build → scan → sign → verify → deploy-by-digest → health gate`.

1. **CI gates** (`.github/workflows/ci.yml`) — strict TypeScript, a real production build,
   a headless-Chrome render check, CodeQL over both the app source and the workflow files,
   gitleaks across **full git history**, `npm audit` on the production tree, a check that
   every pinned action SHA still matches the tag its comment names, a Trivy misconfig scan
   of the Dockerfile, and a schema resolve of both compose files.
2. **Image scan before promotion** (`docker.yml`) — the immutable SHA-tagged build is scanned with
   Trivy at `CRITICAL,HIGH`; the moving `:main` / `:latest` tags are only promoted if that scan is
   clean, so a rejected image can never be what `:latest` points at.
3. **Keyless signing** — the pushed digest is signed with cosign using the workflow's OIDC identity
   (`this repo` + `docker.yml`). There is no stored private key to steal.
4. **Verification before deploy** — the deploy job re-resolves the release tag to a **digest**, then
   requires `cosign verify` to match that exact identity and issuer, and refuses to connect to the
   server unless `SSH_KNOWN_HOSTS` pins the host key (fail closed, no TOFU).
5. **Immutable pull** — the server pulls by digest with `--pull never --no-build`; nothing on the
   host compiles or re-tags anything.
6. **Health-gated rollback** — the container must report `healthy` and `$SITE_URL/healthz` must
   answer before the new digest is recorded; otherwise the previous digest is restored
   automatically.
7. **Runtime restrictions** — UID `101:101`, `cap_drop: ALL`, `no-new-privileges`, read-only root
   filesystem with only `tmpfs` for nginx's scratch paths, CPU/memory/PID limits, and access logs
   capped and rotated.
8. **Response headers** — CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
   `Permissions-Policy`, COOP/CORP and HSTS are set in `deploy/security-headers.conf`; the CI and
   PR smoke steps assert they survive on every response shape (root, hashed asset, deep link).

Dependencies are refreshed by Dependabot (`.github/dependabot.yml`), which also maintains the
digest pins on base images and the SHA pins on every third-party action.

## Verifying an image you pulled

Anyone can confirm a digest came from this repository's pipeline:

```bash
cosign verify \
  --certificate-oidc-issuer 'https://token.actions.githubusercontent.com' \
  --certificate-identity-regexp '^https://github\.com/nadeeshan01/portfolio-2/\.github/workflows/docker\.yml@refs/(heads/main|tags/v\..*)$' \
  ghcr.io/nadeeshan01/portfolio-2@sha256:<digest>
```

Also check the SLSA provenance and SBOM attached to the same digest:

```bash
slsa-verifier verify-image ghcr.io/nadeeshan01/portfolio-2@sha256:<digest> \
  --source-uri github.com/nadeeshan01/portfolio-2
trivy image --severity CRITICAL,HIGH --ignore-unfixed ghcr.io/nadeeshan01/portfolio-2@sha256:<digest>
```

## Secrets and supported versions

- Only CI **artifacts** may carry a build; secrets live in GitHub Actions secrets/variables, never
  in `.env` committed to the repo (`.env*` is git-ignored, `.env.example` is the template).
- The server's `.env` is `chmod 600` and rewritten only by the deploy job's `IMAGE=` line.
- `node scripts/setup-security.mjs` re-applies branch protection, scanning settings and the
  `production` environment gate, and reports any missing required secret by name.

Security fixes are shipped by tagging a new release (`v*`); the deployed digest is recorded in the
release's deploy job log. Older image tags stay pullable for forensics — roll forward rather than
relying on an unpatched `:latest`.
