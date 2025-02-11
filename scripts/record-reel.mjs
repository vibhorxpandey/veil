import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const OUT_WEBM   = path.join(__dirname, '_reel.webm');
const OUT_MP4    = path.join(__dirname, '..', 'public', 'veil-reel.mp4');
const PORT       = 9322;
const DURATION   = 20_000; // ms (timeline ~16s + buffer)

// ── Local static server ─────────────────────────────────────────────────────
const SERVE_ROOT = path.join(__dirname, '..', 'public');
const GSAP_PATH  = path.join(__dirname, 'gsap.min.js');
const MIME       = { '.html':'text/html', '.js':'application/javascript',
                     '.png':'image/png', '.svg':'image/svg+xml' };

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  const filePath = url === '/gsap.min.js' ? GSAP_PATH : path.join(SERVE_ROOT, url);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404); res.end(); return;
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});
server.listen(PORT);

// Patch reel.html to use local GSAP
const reelSrc = fs.readFileSync(path.join(SERVE_ROOT, 'reel.html'), 'utf8');
const patched = reelSrc.replace(
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
  `http://localhost:${PORT}/gsap.min.js`
);
const tmpHtml = path.join(SERVE_ROOT, '_reel_record.html');
fs.writeFileSync(tmpHtml, patched);

// ── Launch browser ──────────────────────────────────────────────────────────
console.log('🎬 Launching browser...');
const browser = await puppeteer.launch({
  headless: true,
  protocolTimeout: 120_000,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-background-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    '--disable-ipc-flooding-protection',
    '--run-all-compositor-stages-before-draw',
    '--disable-features=TranslateUI',
  ],
});

const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('PAGE ERROR:', e.message));

await page.goto(`http://localhost:${PORT}/_reel_record.html`, {
  waitUntil: 'networkidle0', timeout: 30_000,
});

// Confirm GSAP loaded
const gsapReady = await page.evaluate(() => typeof gsap !== 'undefined');
if (!gsapReady) { console.error('GSAP not loaded'); process.exit(1); }
console.log('✓ GSAP ready');

// ── Record with page.screencast() ───────────────────────────────────────────
console.log('⏺  Recording...');
const recorder = await page.screencast({ path: OUT_WEBM });

// Start animation
await page.evaluate(() => {
  document.getElementById('overlay').style.display = 'none';
  startReel();
});

// Wait for full duration
await new Promise(r => setTimeout(r, DURATION));

await recorder.stop();
await browser.close();
server.close();
fs.unlinkSync(tmpHtml);

console.log('✓ Recording done');

// ── Convert WebM → MP4 ──────────────────────────────────────────────────────
console.log('🎞  Encoding MP4...');
execSync([
  'ffmpeg -y',
  `-i "${OUT_WEBM}"`,
  '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p',
  '-vf "scale=390:844:flags=lanczos"',
  '-movflags +faststart',
  `"${OUT_MP4}"`,
].join(' '), { stdio: 'inherit' });

fs.unlinkSync(OUT_WEBM);
console.log(`\n🎉 Done → ${OUT_MP4}`);
