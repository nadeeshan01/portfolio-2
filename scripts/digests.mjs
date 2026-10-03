// Digest-pinning helper for the Dockerfile.
//
//   node scripts/digests.mjs           # report drift between pin and live tag
//   node scripts/digests.mjs --write   # rewrite the pins to the current digest
//
// Each pinned FROM line keeps its human-readable tag, so the file still says
// `node:22-alpine@sha256:…`. Only Docker Hub (registry-1.docker.io) refs are
// resolved here; GHCR refs are reported as skipped.
import { readFile, writeFile } from 'node:fs/promises'

const dockerfile = new URL('../Dockerfile', import.meta.url)
const write = process.argv.includes('--write')

const PIN_RE = /^FROM\s+(?<name>[^\s@/]+\/[^\s@]+|[^\s@]+):(?<tag>[^\s@]+)@(?<digest>sha256:[0-9a-f]{64})(?<rest>.*)$/
const ACCEPT =
  'application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.list.v2+json'

async function resolveDigest(repo, tag) {
  const scopeRepo = repo.includes('/') ? repo : `library/${repo}`
  const auth = await fetch(
    `https://auth.docker.io/token?service=registry.docker.io&scope=repository:${scopeRepo}:pull`,
  ).then((r) => r.json())

  const res = await fetch(
    `https://registry.hub.docker.com/v2/${scopeRepo}/manifests/${tag}`,
    {
      method: 'HEAD',
      headers: {
        Authorization: `Bearer ${auth.token}`,
        Accept: ACCEPT,
      },
    },
  )
  if (!res.ok) throw new Error(`registry returned ${res.status} for ${scopeRepo}:${tag}`)
  const digest = res.headers.get('docker-content-digest')
  if (!digest) throw new Error(`no Docker-Content-Digest header for ${scopeRepo}:${tag}`)
  return digest
}

const source = await readFile(dockerfile, 'utf8')
const lines = source.split(/\r?\n/)
let changed = 0
let checked = 0

for (let i = 0; i < lines.length; i += 1) {
  const match = lines[i].match(PIN_RE)
  if (!match) continue

  const { name, tag, digest } = match.groups
  checked += 1

  if (name === 'ghcr.io' || name.includes('ghcr')) {
    console.log(`skip   ${name}:${tag} (non-Docker-Hub ref)`)
    continue
  }

  let live
  try {
    live = await resolveDigest(name, tag)
  } catch (error) {
    console.error(`error  ${name}:${tag} — ${error.message}`)
    continue
  }

  if (live === digest) {
    console.log(`pinned ${name}:${tag} @ ${digest.slice(0, 19)}… up to date`)
    continue
  }

  changed += 1
  console.log(`drift  ${name}:${tag} ${digest.slice(0, 19)}… → ${live.slice(0, 19)}…`)

  if (write) {
    lines[i] = lines[i].replace(digest, live)
    console.log(`       rewrote line ${i + 1}`)
  }
}

if (checked === 0) {
  console.error('No digest-pinned FROM lines found — nothing to check.')
  process.exit(1)
}

if (write && changed > 0) {
  await writeFile(dockerfile, lines.join('\n'), 'utf8')
  console.log(`\nUpdated ${changed} pin(s). Rebuild and re-run the pipeline to verify.`)
} else if (changed > 0) {
  console.log(`\n${changed} pin(s) out of date. Re-run with --write to update them.`)
} else {
  console.log(`\n${checked} pin(s) checked, all current.`)
}
