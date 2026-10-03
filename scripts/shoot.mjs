import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

const exe = path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe')
const base = process.env.URL ?? 'http://localhost:4173/'
const out = path.resolve('shots')
mkdirSync(out, { recursive: true })

const browser = await chromium.launch({ executablePath: exe, headless: true })

async function revealAll(page) {
  await page.evaluate(async () => {
    const h = document.body.scrollHeight
    for (let y = 0; y < h; y += 500) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 55))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(1200)
}

/* ---------- desktop ---------- */
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 0.75 })
await page.goto(base, { waitUntil: 'networkidle' })
await page.waitForTimeout(2200)
await revealAll(page)

const targets = [
  ['hero', '#home'],
  ['skills', '#skills'],
  ['pipeline', '#pipeline'],
  ['projects', '#projects'],
  ['contact', '#contact'],
  ['footer', 'footer'],
]

for (const [name, sel] of targets) {
  const el = await page.$(sel)
  if (!el) {
    console.log('missing', sel)
    continue
  }
  await el.scrollIntoViewIfNeeded()
  await page.waitForTimeout(700)
  await el.screenshot({ path: path.join(out, `${name}.png`) })
  console.log('shot', name)
}

/* pipeline mid-run state */
const pipe = await page.$('#pipeline')
if (pipe) {
  await page.waitForTimeout(1600)
  await pipe.screenshot({ path: path.join(out, 'pipeline-2.png') })
  console.log('shot pipeline-2')
}

/* ---------- mobile ---------- */
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } })
await mob.goto(base, { waitUntil: 'networkidle' })
await mob.waitForTimeout(2000)
await revealAll(mob)
await mob.screenshot({ path: path.join(out, 'mobile-hero.png') })

await mob.click('button[aria-label="Open navigation"]')
await mob.waitForTimeout(900)
await mob.screenshot({ path: path.join(out, 'mobile-menu.png') })
console.log('shot mobile')

await browser.close()
console.log('done')
