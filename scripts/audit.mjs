import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'

// Chrome location differs per OS; CI's Linux runner keeps it on the system path.
// Set CHROME_BIN to override explicitly.
function chromePath() {
  if (process.env.CHROME_BIN) return process.env.CHROME_BIN
  if (process.platform === 'win32') {
    return path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe')
  }
  if (process.platform === 'darwin') {
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  }
  return (
    ['/usr/bin/google-chrome-stable', '/usr/bin/google-chrome', '/usr/bin/chromium-browser']
      .find((p) => fs.existsSync(p)) ?? '/usr/bin/chromium'
  )
}

const exe = chromePath()
const base = process.env.URL ?? 'http://localhost:4173/'

const browser = await chromium.launch({ executablePath: exe, headless: true })

// Collected across breakpoints so CI can gate on them. STRICT=1 turns this
// reporter into a pass/fail check; locally it still just prints.
const failures = []

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

  // Only hard failures gate: thrown errors, console errors, layout overflow.
  // Console *warnings* stay informational (fonts and ARIA nag constantly).
  const hard = problems.filter((p) => p.startsWith('[error]') || p.startsWith('[pageerror]'))
  if (info.overflow > 1) failures.push(`${width}px → ${info.overflow}px horizontal overflow`)
  for (const h of hard) failures.push(`${width}px → ${h}`)
  for (const o of info.offenders) failures.push(`${width}px → offender ${o}`)

  await page.close()
}

await browser.close()

if (failures.length) {
  console.log(`\n${failures.length} issue(s):\n  ${failures.join('\n  ')}`)
  if (process.env.STRICT === '1') {
    console.error('\nSTRICT=1 — failing on audit issues')
    process.exit(1)
  }
} else {
  console.log('\nno issues found')
}

console.log('\naudit complete')
