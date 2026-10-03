import { chromium } from 'playwright-core'
import path from 'node:path'
import { readFileSync } from 'node:fs'

const exe = path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe')
const target = process.argv[2] ?? 'shots/case-1-overview.png'

const browser = await chromium.launch({ executablePath: exe, headless: true })
const page = await browser.newPage()
await page.goto('about:blank')

const src = `data:image/png;base64,${readFileSync(path.resolve(target)).toString('base64')}`

const res = await page.evaluate(async (url) => {
  const img = new Image()
  img.src = url
  await img.decode()
  const c = document.createElement('canvas')
  c.width = img.naturalWidth
  c.height = img.naturalHeight
  const ctx = c.getContext('2d')
  ctx.drawImage(img, 0, 0)

  const pts = {
    leftBackdrop: [45, 300],
    rightBackdrop: [1020, 300],
    panelBody: [400, 300],
    headerBar: [400, 45],
    bottomLeft: [45, 640],
    topStrip: [700, 20],
  }
  const out = { size: [c.width, c.height] }
  for (const [k, [x, y]] of Object.entries(pts)) {
    const d = ctx.getImageData(x, y, 1, 1).data
    out[k] = [d[0], d[1], d[2]]
  }
  return out
}, src)

console.log(JSON.stringify(res, null, 2))
await browser.close()
