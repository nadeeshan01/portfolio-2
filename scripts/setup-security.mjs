#!/usr/bin/env node
/**
 * One-shot hardening of the GitHub repo settings that the pipelines assume.
 *
 * Dockerfile and nginx can enforce runtime security, but nothing inside the
 * repository can enforce *process* security: whether main is protected, whether
 * a secret can be pushed at all, whether production needs a human approval.
 * Those live in repo settings, so this script sets them through the REST API.
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
 *   --reviewers login,login  who must approve a production deployment
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

// What docker.yml's deploy job reads. Missing any of these = a failed release,
// so they are listed here and checked for real in step 4.
const REQUIRED_SECRETS = ['SSH_DEPLOY_KEY', 'SSH_HOST', 'SSH_USER', 'SSH_KNOWN_HOSTS']
const REQUIRED_VARIABLES = ['DEPLOY_DIR', 'SITE_URL']

const FALLBACK_CHECKS = [
  'typecheck + build',
  'site audit (4 breakpoints)',
  'secret scan (full history)',
  'CodeQL (JS/TS + Actions)',
  'dependency advisories',
  'config + IaC scan',
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

  // ---- 3. production environment gate ---------------------------------------
  // docker.yml's deploy job declares `environment: production`. Adding a required
  // reviewer here makes a tagged release wait for a human even when every check
  // is green — the one control that stops a compromised workflow self-deploying.
  // No branch policy is set on purpose: the run ref is `refs/tags/v*`, which is
  // not a protected branch, so a protected-branch policy would reject the very
  // deployment this gate exists to approve.
  console.log('\n3. Production environment')
  let reviewers = []
  for (const login of (arg('reviewers') || '').split(',').map((s) => s.trim()).filter(Boolean)) {
    if (!TOKEN) {
      console.log(`        (dry run: cannot resolve reviewer "${login}" without a token)`)
      continue
    }
    const u = await gh('GET', `/users/${login}`)
    if (u.ok) reviewers.push({ reviewer_type: 'User', id: u.json.id })
    else console.log(`        !! cannot resolve user "${login}" (typo, or token lacks scope)`)
  }
  await call(
    `gate "production": ${reviewers.length ? `${reviewers.length} required reviewer(s)` : 'no reviewers configured (pass --reviewers login)'}`,
    'PUT',
    `/repos/${repo}/environments/production`,
    { can_admins_bypass: false, wait_timer: 0, ...(reviewers.length ? { reviewers } : {}) },
  )

  // ---- 4. deploy configuration presence -------------------------------------
  // Names are public; values never are.
  console.log('\n4. Deploy configuration present?')
  if (TOKEN && APPLY) {
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

  console.log('\nnext:')
  console.log('  1. Re-run with --apply to write these settings.')
  console.log('  2. Add the SSH_* secrets and DEPLOY_DIR/SITE_URL variables (README “Server one-time setup”).')
  console.log('  3. Settings → Actions → General → “Approve third-party actions” / self-hosted runners:')
  console.log('     keep default permissions on “Read” and let the per-job blocks in the workflows grant more.')
  if (unpinned) console.log('  4. Pin the actions listed above before trusting any run of these workflows.')
}

main().catch((e) => {
  console.error(`\nerror: ${e.message}`)
  process.exit(1)
})
