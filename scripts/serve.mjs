import http from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();
const port = Number(process.env.PORT ?? 4173);
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.png':'image/png', '.svg':'image/svg+xml' };

const server = http.createServer((req, res) => {
  const rawPath = decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/');
  const requestPath = rawPath === '/' ? '/index.html' : rawPath;
  const safe = normalize(requestPath).replace(/^(\.\.[/\\])+/, '');
  const file = join(root, safe);
  if (!file.startsWith(root)) { res.writeHead(403); res.end('Forbidden'); return; }
  try {
    const stat = statSync(file);
    if (!stat.isFile()) throw new Error('not file');
    res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Cache-Control':'no-store' });
    createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404, { 'Content-Type':'text/plain; charset=utf-8' });
    res.end('Not Found');
  }
});
server.listen(port, '0.0.0.0', () => console.log(`Arcane Last Stand: http://localhost:${port}`));
