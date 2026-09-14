#!/usr/bin/env node
/**
 * fetch-fonts.js — self-host the webfonts (no external font requests: faster, private, no third-party dependency).
 * These three families ship as variable fonts, so we pull ONE latin woff2 per family into ../fonts/
 * and emit a weight-range @font-face. Writes ../fonts/_faces.css. Run:  node scripts/fetch-fonts.js
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'fonts');
fs.mkdirSync(OUT, { recursive: true });
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';
const slug = (s) => s.toLowerCase().replace(/\s+/g, '-');

const families = [
  { name: 'Space Grotesk', q: 'Space+Grotesk:wght@400;500;600;700', range: '400 700' },
  { name: 'Geist', q: 'Geist:wght@400;500;600;700', range: '400 700' },
  { name: 'JetBrains Mono', q: 'JetBrains+Mono:wght@400;500;600', range: '400 600' },
];

// clean out any earlier per-weight files
for (const f of fs.readdirSync(OUT)) if (f.endsWith('.woff2')) fs.unlinkSync(path.join(OUT, f));

let faces = '';
for (const fam of families) {
  const css = execSync(`curl -s --max-time 30 -A "${UA}" "https://fonts.googleapis.com/css2?family=${fam.q}&display=swap"`, { encoding: 'utf8' });
  const block = ('/*' + css.split('/*').slice(1).join('/*')).split('/*').map((b) => '/*' + b).find((b) => /^\/\*\s*latin\s*\*\//.test(b));
  const url = (block.match(/url\((https:\/\/[^)]+\.woff2)\)/) || [])[1];
  const file = `${slug(fam.name)}.woff2`;
  execSync(`curl -s --max-time 30 -o "${path.join(OUT, file)}" "${url}"`);
  faces += `@font-face{font-family:'${fam.name}';font-style:normal;font-weight:${fam.range};font-display:swap;src:url('fonts/${file}') format('woff2')}\n`;
}
fs.writeFileSync(path.join(OUT, '_faces.css'), faces);
console.log('self-hosted', families.length, 'variable woff2 -> fonts/');
console.log(faces);
