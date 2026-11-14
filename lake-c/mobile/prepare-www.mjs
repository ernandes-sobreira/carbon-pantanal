import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve('..');
const out = path.resolve('www');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.copyFileSync(path.join(root, 'index.html'), path.join(out, 'index.html'));
for (const file of ['manifest.json','sw.js','icon-192.png','icon-512.png']) {
  const src=path.join(root,file);
  if(fs.existsSync(src)) fs.copyFileSync(src,path.join(out,file));
}
