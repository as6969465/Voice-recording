// 本機預覽用靜態伺服器（Gemini 由瀏覽器直接呼叫）
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8765;
const ROOT = path.join(__dirname, 'public');
const STATIC = new Set(['/index.html', '/manifest.json', '/sw.js', '/icon.svg']);
const TYPES = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.js': 'text/javascript', '.svg': 'image/svg+xml' };

http.createServer((req, res) => {
  const p = new URL(req.url, 'http://x').pathname.replace(/^\/$/, '/index.html');
  if (req.method !== 'GET' || !STATIC.has(p)) { res.writeHead(404); return res.end('Not found'); }
  fs.readFile(path.join(ROOT, p), (err, buf) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)], 'X-Content-Type-Options': 'nosniff' });
    res.end(buf);
  });
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
