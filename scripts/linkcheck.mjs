import { chromium } from 'playwright-core'
import path from 'node:path'

const exe = path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe')
const base = process.env.URL ?? 'http://localhost:4173/'

const browser = await chromium.launch({ executablePath: exe, headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(base, { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)

const links = await page.evaluate(() =>
  [...document.querySelectorAll('a[href]')].map((a) => ({
    text: (a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 44),
    href: a.getAttribute('href'),
    resolved: a.href,
    newTab: a.target === '_blank',
  })),
)

const bad = []
for (const l of links) {
  const h = l.href
  const ok =
    h.startsWith('#') || h.startsWith('mailto:') || h.startsWith('http://') || h.startsWith('https://')
  if (!ok) bad.push(l)
}

console.log(`total anchors: ${links.length}`)
console.log('LinkedIn links:')
for (const l of links.filter((x) => /linkedin/i.test(x.href) || /linkedin/i.test(x.text))) {
  console.log(`  "${l.text}" → ${l.href} (resolved: ${l.resolved}, newTab: ${l.newTab})`)
}
console.log('GitHub links:')
for (const l of links.filter((x) => /github/i.test(x.href))) {
  console.log(`  ${l.href}`)
}
console.log(bad.length ? `BROKEN:\n${JSON.stringify(bad, null, 2)}` : 'no relative/broken hrefs ✓')

await browser.close()
