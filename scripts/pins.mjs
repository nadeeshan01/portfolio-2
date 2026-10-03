#!/usr/bin/env node
/**
 * Supply-chain check: every third-party action used by the workflows must be
 * pinned to a full commit SHA, and that SHA must be exactly the commit the
 * trailing `# vX.Y.Z` comment claims.
 *
 * Why it earns a place in CI: pinning by SHA is the control that stops a tag
 * move (`v3` retargeted by a compromised maintainer, or by an account takeover)
 * from changing what our pipeline runs. A pin is only worth anything if it
 * points where it says it does — which is unverifiable by reading the file,
 * because the file is the thing being trusted. So ask GitHub's git protocol
 * directly: `git ls-remote` returns ref -> SHA with no API token and no rate
 * limit, and an Actions runner always has git.
 *
 *   node scripts/pins.mjs            # exit 1 on any problem
 *   node scripts/pins.mjs --quiet    # only print problems
 */

import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const QUIET = process.argv.includes('--quiet')
const WORKFLOWS = path.join('.github', 'workflows')
const say = (...a) => !QUIET && console.log(...a)

/** Collect `uses:` pins: owner/repo[/subpath]@ref, plus the tag in the comment. */
function collect() {
  const pins = []
  for (const file of readdirSync(WORKFLOWS)) {
    if (!file.endsWith('.yml')) continue
    readFileSync(path.join(WORKFLOWS, file), 'utf8')
      .split('\n')
      .forEach((input, i) => {
        // trimEnd also drops a CRLF working tree's trailing carriage return,
        // which would otherwise defeat the end-of-line anchor.
        const line = input.trimEnd()
        // Any `uses:` with a ref, pinned or not — an unpinned one must be
        // reported, not skipped for failing to look like a SHA.
        const m = line.match(/^\s*(?:-\s+)?uses:\s*([^/\s][^\s@]*)@(\S+?)\s*(?:#\s*(\S+))?$/)
        if (!m) return
        const slug = m[1].split('/').slice(0, 2).join('/')
        pins.push({ file, line: i + 1, slug, sub: m[1].slice(slug.length), sha: m[2], tag: m[3] })
      })
  }
  return pins
}

/** All tags of a repo as name -> commit SHA, peeling annotated tags. */
function tagMap(slug) {
  const out = execFileSync('git', ['ls-remote', '--tags', `https://github.com/${slug}`], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  })
  const map = new Map()
  for (const line of out.split('\n')) {
    const m = line.match(/^([0-9a-f]{40})\s+refs\/tags\/(.+?)(\^\{\})?$/)
    if (!m) continue
    // A `tag^{}` line is the peeled commit; prefer it over the tag object SHA.
    if (m[3]) map.set(m[2], m[1])
    else if (!map.has(m[2])) map.set(m[2], m[1])
  }
  return map
}

const pins = collect()
const cache = new Map()
let bad = 0

for (const p of pins) {
  const where = `${p.file}:${p.line}`
  if (!/^[0-9a-f]{40}$/.test(p.sha)) {
    console.error(`BAD ${where}  ${p.slug}${p.sub}@${p.sha} — mutable ref; pin to a full commit SHA`)
    bad++
    continue
  }
  if (!p.tag) {
    console.error(`BAD ${where}  ${p.slug}${p.sub}@${p.sha.slice(0, 10)} — no version comment, so the pin cannot be reviewed`)
    bad++
    continue
  }
  if (!cache.has(p.slug)) cache.set(p.slug, tagMap(p.slug))
  const target = cache.get(p.slug).get(p.tag)
  if (!target) {
    console.error(`BAD ${where}  ${p.slug}@${p.tag} — tag does not exist upstream`)
    bad++
  } else if (target !== p.sha) {
    console.error(`BAD ${where}  ${p.slug}@${p.tag} is ${target.slice(0, 12)}, pinned ${p.sha.slice(0, 12)}`)
    bad++
  } else {
    say(`ok   ${p.slug}${p.sub}@${p.tag}`)
  }
}

console.log(`\n${pins.length} action pins checked against upstream tags, ${bad} problem(s)`)
process.exit(bad ? 1 : 0)
