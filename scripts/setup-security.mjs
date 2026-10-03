#!/usr/bin/env node
/**
 * One-shot hardening of the GitHub repo settings that the pipelines assume.
 *
 * Netlify enforces headers, TLS and caching at the edge, but nothing inside
 * the repository can enforce *process* security: whether main is protected,
 * whether a secret can be pushed at all, whether a change needs review before
 * it merges. Those live in repo settings, so this script sets them through the
 * REST API.
 *
 *   node scripts/setup-security.mjs              # dry run: prints every call
 *   node scripts/setup-security.mjs --apply      # makes the changes
 *
 * Token: GITHUB_TOKEN (or GH_TOKEN) holding a classic PAT with `repo` +
 * `admin:org`, or a fine-grained PAT with Administration read/write.
 * Pass it in the environment, once — never as a repo secret or a commit.
 *
 * Flags:
 *   --repo owner/name        override auto-detection from `git remote`
 *   --checks a,b,c           required status contexts (default: ci.yml job names)
 */

import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
const APPLY = process.argv.includes('--apply')
const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? undefined : process.argv[i + 1]
}

const API = 'https://api.github.com'

// Netlify builds and publishes straight from git, so the old VPS credentials
// (SSH_*) and deploy variables (DEPLOY_DIR, SITE_URL) no longer exist to check:
// there is no machine left in a datacentre to hold a key. Both lists stay
// defined so step 4 still has one concrete place to declare what CI needs the
// day a credential-backed deploy comes back.
const REQUIRED_SECRETS = []
const REQUIRED_VARIABLES = []

const FALLBACK_CHECKS = [
  'typecheck + build',
  'site audit (4 breakpoints)',
  'secret scan (full history)',
  'CodeQL (JS/TS + Actions)',
  'dependency advisories',
]

function detectRepo() {
  const explicit = arg('repo') || process.env.GITHUB_REPOSITORY
  if (explicit) return explicit
  try {
    const url = execFileSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim()
    const m = url.match(/github\.com[:/]([^/]+\/[^/.]+)/)
    if (m) return m[1]
  } catch {
    /* not a git checkout */
  }
  throw new Error('could not determine owner/repo; pass --repo owner/name')
}

/**
 * Job names in .github/workflows/ci.yml, i.e. the status-check contexts.
 * Reading them from the file keeps this script from silently drifting when a job
 * is renamed — a required check that no job ever reports is a permanently red
 * wall that people route around by turning protection off.
 */
function ciCheckNames() {
  try {
    const text = readFileSync(path.join('.github', 'workflows', 'ci.yml'), 'utf8')
    const names = [...text.matchAll(/^ {2}\w[\w-]*:\n(?:^ {4}.*\n)*?^ {4}name:\s*(.+)$/gm)].map((m) => m[1].trim())
    if (!names.length) return { names: FALLBACK_CHECKS, matched: false }
    const missing = FALLBACK_CHECKS.filter((n) => !names.includes(n))
    return { names, matched: missing.length === 0, missing }
  } catch {
    return { names: FALLBACK_CHECKS, matched: false }
  }
}

async function gh(method, endpoint, body) {
  const res = await fetch(API + endpoint, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      Authorization: `Bearer ${TOKEN}`,
      'User-Agent': 'setup-security.mjs',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json = {}
  try {
    json = text ? JSON.parse(text) : {}
  } catch {
    json = { message: text.slice(0, 200) }
  }
  return { ok: res.ok, status: res.status, json }
}

/** Prints the intent; only writes under --apply. A 403 is reported, not fatal. */
async function call(label, method, endpoint, body) {
  if (!APPLY) {
    console.log(`  plan  ${method} ${endpoint}\n        ${label}`)
    return { ok: true, planned: true }
  }
  const r = await gh(method, endpoint, body)
  const mark = r.ok ? 'ok   ' : r.status === 403 ? '403  ' : 'FAIL '
  console.log(`  ${mark} ${method} ${endpoint} — ${label}${r.ok ? '' : `: ${r.json.message || r.status}`}`)
  return r
}

/**
 * Every third-party action must be pinned to a full commit SHA. A mutable tag is
 * a supply-chain hole no repo setting can close, and it is checked here because
 * it costs nothing and needs no token.
 */
function localPinAudit() {
  const dir = path.join('.github', 'workflows')
  const problems = []
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.yml')) continue
    readFileSync(path.join(dir, file), 'utf8')
      .split('\n')
      .forEach((line, i) => {
        const m = line.match(/^\s*(?:-\s+)?uses:\s*([^/\s][^\s@]*)@(\S+)/)
        if (!m) return
        const [, ref, ver] = m
        if (!/^[0-9a-f]{40}$/.test(ver)) problems.push(`${file}:${i + 1}  ${ref}@${ver}`)
      })
  }
  if (problems.length) {
    console.log('\n  UNPINNED actions — pin to a full commit SHA (Dependabot keeps them fresh):')
    problems.forEach((p) => console.log(`    ${p}`))
  } else {
    console.log('\n  audit: every action in .github/workflows is pinned to a full SHA')
  }
  return problems.length
}

async function main() {
  const repo = detectRepo()
  if (APPLY && !TOKEN) throw new Error('GITHUB_TOKEN is required with --apply')
  console.log(`repo: ${repo}   mode: ${APPLY ? 'APPLY' : 'dry run (add --apply to write)'}`)

  const unpinned = localPinAudit()

  const meta = TOKEN ? await gh('GET', `/repos/${repo}`) : { ok: false, json: {} }
  const isPublic = meta.json.public === true
  const defaultBranch = meta.json.default_branch || 'main'
  console.log(`\n  default branch: ${defaultBranch}   visibility: ${meta.ok ? (isPublic ? 'public' : 'private') : 'unknown (no token)'}`)

  // ---- 1. scanning, push protection, Dependabot alerts ----------------------
  // On a public repo secret scanning + push protection are free. On a private or
  // org repo `advanced_security` needs a GHAS licence and answers 403 without it
  // — the other three settings are still worth enabling, hence the separate call.
  console.log('\n1. Repository security & analysis settings')
  await call('enable secret scanning + push protection + dependabot security updates', 'PATCH', `/repos/${repo}`, {
    security_and_analysis: {
      secret_scanning: { status: 'enabled' },
      secret_scanning_push_protection: { status: 'enabled' },
      dependabot_security_updates: { status: 'enabled' },
    },
  })
  if (isPublic || !meta.ok) {
    console.log('        (private vulnerability reporting: enable in Settings → Security → Vulnerability reporting, or it 404s for org-owned repos)')
  }

  // ---- 2. branch protection on main -----------------------------------------
  // Deploys are tag-triggered, so protection here governs what reaches the gates:
  // no force-push rewriting a scanned+signed commit, no direct push around
  // review, no merge while a gate is red, and history stays linear so the blame
  // chain from a release tag back to a reviewed PR is unbroken.
  console.log('\n2. Branch protection')
  const ci = ciCheckNames()
  if (ci.matched === false && ci.missing) {
    console.log(`  note: ci.yml job names differ from the expected list — using what ci.yml says.`)
  }
  const checks = (arg('checks') || ci.names.join(',')).split(',').map((s) => s.trim()).filter(Boolean)
  const prot = await call(`protect ${defaultBranch}: required checks + review + no force-push`, 'PUT', `/repos/${repo}/branches/${defaultBranch}/protection`, {
    required_status_checks: { strict: true, contexts: checks },
    required_pull_request_reviews: {
      dismiss_stale_reviews: true,
      require_code_owner_reviews: false,
      require_last_push_approval: true,
      required_approving_review_count: 1,
    },
    enforce_admins: true,
    required_linear_history: true,
    allow_force_pushes: false,
    allow_deletions: false,
    block_creations: true,
    required_conversation_resolution: true,
    lock_branch: false,
    allow_fork_syncing: false,
  })
  if (prot.status === 403) console.log('        (403 = needs admin rights; private repos also need GitHub Pro/Team for protection rules)')
  else if (prot.ok) console.log(`        required contexts: ${checks.join(', ')}`)

  // ---- 3. Netlify configuration --------------------------------------------
  // The deploy is now "push to main", so what is worth asserting is that the
  // file Netlify actually reads still says what the pipeline assumes: builds
  // with the lockfile-strict command, publishes dist/. A publish-directory typo
  // is invisible until the live site starts serving 404s or a stale bundle.
  console.log('\n3. Netlify configuration')
  try {
    const toml = readFileSync('netlify.toml', 'utf8')
    const publish = toml.match(/^\s*publish\s*=\s*"([^"]+)"/m)
    const command = toml.match(/^\s*command\s*=\s*"([^"]+)"/m)
    console.log(`  ${publish ? 'ok  ' : 'MISS'} publish = ${publish ? publish[1] : '(not declared)'}`)
    console.log(`  ${command ? 'ok  ' : 'MISS'} command = ${command ? command[1] : '(not declared)'}`)
    if (publish && publish[1] !== 'dist') {
      console.log('        !! expected "dist" — vite.config.ts writes there and ci.yml asserts against it')
    }
    if (command && !/npm ci/.test(command[1])) {
      console.log('        !! use `npm ci` so a drifted lockfile fails loudly instead of re-resolving')
    }
  } catch {
    console.log('  MISS netlify.toml — Netlify has no build/publish configuration to read,')
    console.log('       so it falls back to UI settings that this repo cannot review or diff.')
  }

  // ---- 4. deploy configuration presence -------------------------------------
  // Names are public; values never are. Netlify owns the deploy itself, so this
  // is empty by design rather than missing — see the comment on the two lists.
  console.log('\n4. Deploy configuration present?')
  if (!REQUIRED_SECRETS.length && !REQUIRED_VARIABLES.length) {
    console.log('  none required — Netlify builds and deploys from git with no repo secrets')
  } else if (TOKEN && APPLY) {
    const secrets = await gh('GET', `/repos/${repo}/actions/secrets`)
    const vars = await gh('GET', `/repos/${repo}/actions/variables`)
    const have = new Set((secrets.json.secrets || []).map((s) => s.name))
    const haveVars = new Set((vars.json.variables || []).map((v) => v.name))
    REQUIRED_SECRETS.forEach((n) => console.log(`  ${have.has(n) ? 'ok  ' : 'MISS'} secret   ${n}`))
    REQUIRED_VARIABLES.forEach((n) => console.log(`  ${haveVars.has(n) ? 'ok  ' : 'MISS'} variable ${n}`))
  } else {
    console.log(`  secrets to add:    ${REQUIRED_SECRETS.join(', ')}`)
    console.log(`  variables to add:  ${REQUIRED_VARIABLES.join(', ')}`)
    console.log('  (verified for real once --apply runs with a token)')
  }

  // ---- 5. dependency graph --------------------------------------------------
  // actions/dependency-review-action diffs snapshots that GitHub's server-side
  // extractor stores per revision; npm has no client-side submission action, so
  // the only way to populate it is to enable the feature and push. Until then
  // the gate fails with an error that names no remedy. Asked with a token, the
  // SBOM endpoint is a real signal — unauthenticated it answers 200 with zero
  // packages for every repo, healthy or not, which is why this is report-only
  // and lives here rather than in the workflow.
  console.log('\n5. Dependency graph (required by the dependency-review gate)')
  if (TOKEN) {
    const sbom = await gh('GET', `/repos/${repo}/dependency-graph/sbom`)
    const count = sbom.ok ? Object.keys(sbom.json.packages || {}).length : -1
    if (count > 0) {
      console.log(`  ok    ${count} packages in the graph for ${defaultBranch}`)
    } else if (count === 0) {
      console.log(`  EMPTY nothing built yet — dependency review will fail on every PR.`)
      console.log(`        https://github.com/${repo}/settings/security_analysis then /network/dependencies`)
    } else {
      console.log(`  ?     endpoint returned ${sbom.status} (graph may be off, or the token lacks rights)`)
    }
  } else {
    console.log('  note: no token, so this cannot be checked. It is a UI-only setting;')
    console.log(`        https://github.com/${repo}/settings/security_analysis`)
  }

  console.log('\nnext:')
  console.log('  1. Re-run with --apply to write these settings.')
  console.log('  2. Connect this repo in Netlify: Add new site → Import an existing project.')
  console.log('     netlify.toml already supplies the build command and publish directory,',
    'so the UI has nothing left to get wrong.', '')
  console.log('  3. Settings → Actions → General → “Approve third-party actions” / self-hosted runners:')
  console.log('     keep default permissions on “Read” and let the per-job blocks in the workflows grant more.')
  if (unpinned) console.log('  4. Pin the actions listed above before trusting any run of these workflows.')
}

main().catch((e) => {
  console.error(`\nerror: ${e.message}`)
  process.exit(1)
})
