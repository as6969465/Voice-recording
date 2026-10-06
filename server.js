// 本機開發用伺服器：模擬 Firebase Hosting + /api/summarize Function。金鑰讀自 .env，不會送到瀏覽器。
const http = require('http');
const fs = require('fs');
const path = require('path');
const { summarize } = require('./functions/gemini');

// 讀取同資料夾的 .env，不覆蓋已存在的環境變數
try {
  for (const line of fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {}

const PORT = process.env.PORT || 8765;
const ROOT = path.join(__dirname, 'public');
const MAX_BODY = 500 * 1024;
const STATIC = new Set(['/index.html', '/manifest.json', '/sw.js', '/icon.svg']);
const TYPES = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.js': 'text/javascript', '.svg': 'image/svg+xml' };

function send(res, code, body, type = 'application/json') {
  res.writeHead(code, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

async function handleSummarize(req, res) {
  if (!process.env.GEMINI_API_KEY) return send(res, 503, { error: '未設定 GEMINI_API_KEY' });
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BODY) return send(res, 413, { error: '逐字稿過長' });
  }
  try {
    send(res, 200, { summary: await summarize(JSON.parse(raw), process.env.GEMINI_API_KEY, process.env.GEMINI_MODEL) });
  } catch (e) {
    send(res, e.status || 400, { error: e.status ? e.message : '格式錯誤' });
  }
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (req.method === 'POST' && url.pathname === '/api/summarize') return handleSummarize(req, res);
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });

  const p = url.pathname === '/' ? '/index.html' : url.pathname;
  if (!STATIC.has(p)) return send(res, 404, 'Not found', 'text/plain');
  fs.readFile(path.join(ROOT, p), (err, buf) =>
    err ? send(res, 404, 'Not found', 'text/plain') : send(res, 200, buf, TYPES[path.extname(p)]));
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
