import { chromium } from 'playwright-core'
import path from 'node:path'

const exe = path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe')
const base = process.env.URL ?? 'http://localhost:4173/'
const out = path.resolve('shots')

const browser = await chromium.launch({ executablePath: exe, headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 0.75,
  permissions: ['clipboard-read', 'clipboard-write'],
})
const page = await context.newPage()

await page.goto(base, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
await page.evaluate(() => document.getElementById('projects')?.scrollIntoView())
await page.waitForTimeout(700)
await page.click('text=Open case study')
await page.waitForTimeout(1200)

// scroll the dossier to the command deck
await page.evaluate(() => {
  const d = document.querySelector('[role="dialog"]')
  const heading = [...d.querySelectorAll('*')].find(
    (el) => el.textContent?.trim() === 'Command prompt — examples',
  )
  heading?.scrollIntoView({ block: 'start' })
})
await page.waitForTimeout(1400)

const tabs = await page.$$('[role="tab"]')
const labels = await Promise.all(tabs.map((t) => t.innerText()))
console.log('tabs:', labels.join(' | '))

// switch to the Kubernetes tab and confirm its commands render
await page.click('[role="tab"]:has-text("Kubernetes")')
await page.waitForTimeout(1200)
const body = await page.innerText('[role="tab"][aria-selected="true"] ~ div, body')
const hasKind = (await page.$('text=kind create cluster --name cloudpath')) !== null
const hasRollout =
  (await page.$('text=rollout undo deployment/focusflow-api')) !== null
console.log('selected tab:', (await page.getAttribute('[role="tab"][aria-selected="true"]', 'innerText')))
console.log('kubectl examples rendered:', hasKind && hasRollout)

// copy button
await page.click('text=Copy')
await page.waitForTimeout(500)
const copied = (await page.$('text=Copied')) !== null
const clip = await page.evaluate(() => navigator.clipboard.readText())
console.log('copy button works:', copied, '| clipboard starts:', JSON.stringify(clip.split('\n')[0]))

// capture the terminal only
const term = await page.$('text=terminal — cloudpath-focusflow')
const box = await term.evaluate((el) => {
  const card = el.closest('div[class*="border-ink"]') ?? el
  const r = card.getBoundingClientRect()
  return { x: r.x - 8, y: r.y - 46, width: r.width + 16, height: r.height + 120 }
})
await page.screenshot({ path: path.join(out, 'deck-final.png'), clip: box })
console.log('captured deck-final.png')

await browser.close()
