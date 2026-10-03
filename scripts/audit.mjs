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
  await page.waitForTimeout(1500)

  const info = await page.evaluate(() => {
    const doc = document.documentElement
    const overflow = doc.scrollWidth - doc.clientWidth
    const offenders = []
    if (overflow > 1) {
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect()
        if (r.width > 0 && (r.right > doc.clientWidth + 1 || r.left < -1)) {
          offenders.push(
            `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)} → ${Math.round(r.left)}..${Math.round(r.right)}`,
          )
          if (offenders.length > 5) break
        }
      }
    }
    const fonts = [...new Set([...document.querySelectorAll('h1,h2,p,span')].slice(0, 40)
      .map((el) => getComputedStyle(el).fontFamily.split(',')[0].replace(/"/g, '')))]
    return { overflow, offenders, fonts, height: doc.scrollHeight }
  })

  console.log(`\n=== ${width}px === scrollHeight ${info.height} | overflow ${info.overflow}px`)
  if (info.offenders.length) console.log('  offenders:', info.offenders.join('\n             '))
  console.log('  fonts in use:', info.fonts.join(', '))
  if (problems.length) console.log('  console:', problems.slice(0, 6).join('\n            '))
  else console.log('  console: clean')

  await page.close()
}

await browser.close()
console.log('\naudit complete')
