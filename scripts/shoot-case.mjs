import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

const exe = path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe')
const base = process.env.URL ?? 'http://localhost:4173/'
const out = path.resolve('shots')
mkdirSync(out, { recursive: true })

const browser = await chromium.launch({ executablePath: exe, headless: true })

const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 0.75 })
await page.goto(base, { waitUntil: 'networkidle' })
await page.waitForTimeout(1800)

// scroll the projects section into view, then open the dossier
await page.evaluate(() => document.getElementById('projects')?.scrollIntoView())
await page.waitForTimeout(1400)
const projectsEl = await page.$('#projects')
if (projectsEl) await projectsEl.screenshot({ path: path.join(out, 'case-0-card.png') })
await page.click('text=Open case study')
await page.waitForTimeout(1400)
await page.screenshot({ path: path.join(out, 'case-1-overview.png') })

const positions = [
  ['case-2-stack', 0.22],
  ['case-3-diagram', 0.42],
  ['case-4-tree', 0.66],
  ['case-5-commands', 0.84],
]

for (const [name, ratio] of positions) {
  await page.evaluate((r) => {
    const dialog = document.querySelector('[role="dialog"]')
    if (dialog) dialog.scrollTop = dialog.scrollHeight * r
  }, ratio)
  await page.waitForTimeout(1100)
  await page.screenshot({ path: path.join(out, `${name}.png`) })
  console.log('shot', name)
}

/* keyboard close check */
await page.keyboard.press('Escape')
await page.waitForTimeout(700)
const closed = (await page.$('text=Open case study')) !== null
console.log('esc closes modal:', closed ? 'yes' : 'FAIL — still open')

/* mobile */
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } })
await mob.goto(base, { waitUntil: 'networkidle' })
await mob.waitForTimeout(1600)
await mob.evaluate(() => document.getElementById('projects')?.scrollIntoView())
await mob.waitForTimeout(1200)
await mob.click('text=Open case study')
await mob.waitForTimeout(1400)
await mob.screenshot({ path: path.join(out, 'case-m1.png') })
await mob.evaluate(() => {
  const d = document.querySelector('[role="dialog"]')
  if (d) d.scrollTop = d.scrollHeight * 0.45
})
await mob.waitForTimeout(1000)
await mob.screenshot({ path: path.join(out, 'case-m2.png') })
console.log('shot mobile')

await browser.close()
console.log('done')
