/**
 * Veil Promo → MP4
 *
 * Captures promo-record.html with puppeteer (headless Chrome),
 * generates narration via Windows SAPI (built-in, no dependencies),
 * merges video + audio with ffmpeg → veil-promo.mp4
 *
 * Usage: node scripts/make-mp4.mjs
 */

import puppeteer from 'puppeteer'
import fs        from 'fs'
import path      from 'path'
import { execSync, spawnSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dir   = path.dirname(fileURLToPath(import.meta.url))
const ROOT    = path.join(__dir, '..')
const FRAMES  = path.join(ROOT, '_frames')
const OUT_MP4 = path.join(ROOT, 'veil-promo.mp4')
const DURATION_S = 97   // seconds to record

/* ─── colour helpers ─── */
const C = { reset:'\x1b[0m', bold:'\x1b[1m', dim:'\x1b[2m',
  purple:'\x1b[35m', blue:'\x1b[34m', green:'\x1b[32m',
  red:'\x1b[31m', yellow:'\x1b[33m' }
const log  = (s,...r)=>console.log(`${C.purple}●${C.reset} ${s}`,...r)
const ok   = (s,...r)=>console.log(`${C.green}✓${C.reset} ${s}`,...r)
const info = (s,...r)=>console.log(`${C.dim}  ${s}${C.reset}`,...r)
const err  = (s,...r)=>console.error(`${C.red}✗${C.reset} ${s}`,...r)

/* ─── step 1: capture frames ─── */
async function captureFrames() {
  log('Launching headless Chrome...')
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--window-size=1280,720',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
    ]
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 720 })

  log('Navigating to promo-record.html...')
  await page.goto('http://localhost:3000/promo-record.html', {
    waitUntil: 'networkidle0',
    timeout: 30_000,
  })

  await new Promise(r => setTimeout(r, 900))   // let Three.js init

  /* clean frames dir */
  if (fs.existsSync(FRAMES)) fs.rmSync(FRAMES, { recursive: true })
  fs.mkdirSync(FRAMES, { recursive: true })

  const client = await page.createCDPSession()
  let frameIdx = 0
  const timestamps = []

  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 92,
    everyNthFrame: 1,
  })

  client.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    const name = `f${String(frameIdx).padStart(6,'0')}.jpg`
    fs.writeFileSync(path.join(FRAMES, name), Buffer.from(data, 'base64'))
    timestamps.push(metadata.timestamp)
    frameIdx++
    await client.send('Page.screencastFrameAck', { sessionId })
  })

  /* progress ticker */
  const t0 = Date.now()
  const ticker = setInterval(() => {
    const elapsed = Math.floor((Date.now() - t0) / 1000)
    process.stdout.write(`\r  ${C.dim}recording ${elapsed}s / ${DURATION_S}s  [${frameIdx} frames]${C.reset}`)
  }, 500)

  log(`Recording ${DURATION_S}s of animation...`)
  await new Promise(r => setTimeout(r, DURATION_S * 1000))

  clearInterval(ticker)
  process.stdout.write('\n')

  await client.send('Page.stopScreencast')
  await browser.close()

  ok(`Captured ${frameIdx} frames`)
  return timestamps
}

/* ─── step 2: write ffmpeg concat list ─── */
function writeConcatList(timestamps) {
  log('Writing concat list...')
  const lines = []
  for (let i = 0; i < timestamps.length; i++) {
    const name = `f${String(i).padStart(6,'0')}.jpg`
    const fp   = path.join(FRAMES, name).replace(/\\/g, '/')
    const dur  = i < timestamps.length - 1
      ? (timestamps[i+1] - timestamps[i]).toFixed(4)
      : '0.040'
    lines.push(`file '${fp}'`, `duration ${dur}`)
  }
  const listPath = path.join(FRAMES, 'list.txt')
  fs.writeFileSync(listPath, lines.join('\n'))
  return listPath
}

/* ─── step 3: generate narration with Windows SAPI ─── */
function generateNarration() {
  log('Generating narration (Windows SAPI)...')

  const TEXT = `
It's two A M. Twelve browser tabs open. And you're still switching between tools.
Every day, researchers juggle five different tools just to do one task.
Papers here. Models there. Experiments somewhere else. Writing in another window. Code in yet another.
The cost is real.
Over twelve hours a week lost to tool switching alone.
Twenty-three minutes to regain deep focus after every single interruption.
And five times more time spent on setup than on actual research.
There has to be a better way.
Introducing Veil. The unified AI workspace for researchers and ML engineers.
One workspace. Four modes. Your entire research stack, always connected.
Four specialized modes. Research, Biology, Flywheel, and Write.
Switch modes mid-session without losing a single token of context.
Read a paper. Fine-tune a model. Draft the manuscript.
All in one continuous session, with full context preserved across every mode switch.
Persistent sandboxes that survive any disconnect.
Elastic GPU compute that scales on demand.
Async orchestration that keeps your agents running while you sleep.
I built Veil because I was tired of the chaos.
Researchers and ML engineers deserve a workspace where the AI understands their entire context — not just the last message.
Join twenty-four hundred researchers already on Veil.
Research faster. Ship better models.
`.trim().replace(/\n/g, ' ')

  const wavPath = path.join(ROOT, '_narration.wav')
  const psPath  = path.join(ROOT, '_narrate.ps1')

  const escapedText = TEXT.replace(/'/g, "''").replace(/—/g, ' ')
  const ps = `
Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$s.Rate   = -1
$s.Volume = 100
$voices = $s.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Gender -eq 'Male' -and $_.VoiceInfo.Culture.Name -like 'en-*' }
if ($voices.Count -gt 0) { $s.SelectVoice($voices[0].VoiceInfo.Name) }
$s.SetOutputToWaveFile('${wavPath.replace(/\\/g,'\\\\').replace(/'/g,"''")}')
$s.Speak('${escapedText}')
$s.Dispose()
Write-Host "Narration saved"
`
  fs.writeFileSync(psPath, ps, 'utf8')

  const r = spawnSync('powershell', ['-ExecutionPolicy','Bypass','-File', psPath], {
    stdio: 'inherit', encoding: 'utf8'
  })
  fs.unlinkSync(psPath)

  if (r.status !== 0) {
    err('SAPI failed — continuing without audio')
    return null
  }
  ok('Narration WAV generated')
  return wavPath
}

/* ─── step 4: encode with ffmpeg ─── */
function encode(listPath, wavPath) {
  log('Encoding video with ffmpeg...')

  // find ffmpeg — winget may not update the current shell's PATH
  let ffmpeg = 'ffmpeg'
  try { execSync('ffmpeg -version', { stdio: 'ignore' }) }
  catch {
    const candidates = [
      // winget default install location
      `${process.env.LOCALAPPDATA}\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-full_build\\bin\\ffmpeg.exe`,
      'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
      'C:\\ffmpeg\\bin\\ffmpeg.exe',
    ]
    const found = candidates.find(p => fs.existsSync(p))
    if (!found) { err('ffmpeg not found'); process.exit(1) }
    ffmpeg = `"${found}"`
    info(`Using ffmpeg at: ${found}`)
  }

  const videoOnly = path.join(ROOT, '_video_only.mp4')

  /* encode variable-rate frames → H264 */
  execSync([
    ffmpeg, '-y',
    `-f concat -safe 0 -i "${listPath}"`,
    `-vf "scale=1280:720,fps=30"`,
    `-c:v libx264 -pix_fmt yuv420p -preset fast -crf 17`,
    `"${videoOnly}"`,
  ].join(' '), { stdio: 'inherit' })

  if (wavPath && fs.existsSync(wavPath)) {
    log('Merging audio...')
    execSync([
      ffmpeg, '-y',
      `-i "${videoOnly}"`,
      `-i "${wavPath}"`,
      `-c:v copy -c:a aac -b:a 192k -shortest`,
      `"${OUT_MP4}"`,
    ].join(' '), { stdio: 'inherit' })
    fs.unlinkSync(wavPath)
  } else {
    fs.renameSync(videoOnly, OUT_MP4)
  }

  if (fs.existsSync(videoOnly)) fs.unlinkSync(videoOnly)
}

/* ─── cleanup ─── */
function cleanup() {
  if (fs.existsSync(FRAMES)) fs.rmSync(FRAMES, { recursive: true })
}

/* ─── main ─── */
async function main() {
  console.log()
  console.log(`${C.bold}${C.purple}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`)
  console.log(`${C.bold}  Veil Research Promo → MP4${C.reset}`)
  console.log(`${C.bold}${C.purple}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`)
  console.log()
  info(`Output: ${OUT_MP4}`)
  info(`Duration: ~${DURATION_S}s at 30fps`)
  console.log()

  try {
    const timestamps = await captureFrames()
    const listPath   = writeConcatList(timestamps)
    const wavPath    = generateNarration()
    encode(listPath, wavPath)
    cleanup()

    console.log()
    console.log(`${C.bold}${C.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`)
    console.log(`${C.bold}${C.green}  Done!  →  veil-promo.mp4${C.reset}`)
    console.log(`${C.bold}${C.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`)
    console.log()
  } catch(e) {
    err(e.message)
    cleanup()
    process.exit(1)
  }
}

main()
