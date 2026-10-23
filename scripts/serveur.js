// Petit serveur de fichiers statiques pour tester le site en local (npm start), sans dépendance.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = fileURLToPath(new URL('..', import.meta.url));
const port = Number(process.env.PORT) || 3000;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.pdf': 'application/pdf', '.txt': 'text/plain' };

createServer(async (req, res) => {
  const chemin = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const fichier = join(racine, normalize(chemin.endsWith('/') ? chemin + 'index.html' : chemin));
  if (!fichier.startsWith(racine)) { res.writeHead(403).end(); return; }
  try {
    const contenu = await readFile(fichier);
    res.writeHead(200, { 'Content-Type': (TYPES[extname(fichier)] ?? 'application/octet-stream') + '; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(contenu);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Introuvable');
  }
}).listen(port, () => console.log(`Hetrako : http://localhost:${port}`));
