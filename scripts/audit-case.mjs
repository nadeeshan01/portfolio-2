import { chromium } from 'playwright-core'
import path from 'node:path'

const exe = path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe')
const base = process.env.URL ?? 'http://localhost:4173/'

const browser = await chromium.launch({ executablePath: exe, headless: true })

for (const width of [1440, 1024, 768, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } })
  const problems = []
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') problems.push(`[${m.type()}] ${m.text()}`)
  })
  page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`))

  await page.goto(base, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await page.evaluate(() => document.getElementById('projects')?.scrollIntoView())
  await page.waitForTimeout(800)
  await page.click('text=Open case study')
  await page.waitForTimeout(1500)

  const before = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]')
    const de = document.documentElement
    return {
      pageOverflow: de.scrollWidth - de.clientWidth,
      modalHOverflow: d ? d.scrollWidth - d.clientWidth : -1,
      bodyLocked: document.body.style.overflow === 'hidden',
    }
  })

  // walk the whole dossier so every block renders
  await page.evaluate(async () => {
    const d = document.querySelector('[role="dialog"]')
    if (!d) return
    for (let y = 0; y < d.scrollHeight; y += 500) {
      d.scrollTop = y
      await new Promise((r) => setTimeout(r, 60))
    }
    d.scrollTop = 0
  })
  await page.waitForTimeout(900)

  const widest = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]')
    if (!d) return null
    const limit = d.getBoundingClientRect().right
    const bad = []
    for (const el of d.querySelectorAll('*')) {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.right > limit + 1) {
        bad.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 36)} → ${Math.round(r.right)}`)
        if (bad.length > 4) break
      }
    }
    return bad
  })

  console.log(`\n=== ${width}px ===`)
  console.log('  page overflow:', before.pageOverflow, '| modal h-overflow:', before.modalHOverflow, '| body locked:', before.bodyLocked)
  if (widest && widest.length) console.log('  overflowing:', widest.join('\n               '))
  console.log(problems.length ? '  console:' + problems.slice(0, 5).join(' | ') : '  console: clean')

  await page.close()
}

await browser.close()
console.log('\ncase audit complete')
