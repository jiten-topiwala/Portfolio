#!/usr/bin/env node
/**
 * build-pages.js — generate one static page per featured project from content/*.json.
 *
 * Why: the single-page site can only rank for one topic. Each project page is its own
 * indexable URL targeting its own query, and carries the long_description / features /
 * links that render nowhere on the main page. Regenerated on every build, so editing
 * the JSON is the only step — never edit p/*.html by hand.
 *
 * Run: node scripts/build-pages.js   (seo-build.js runs it automatically)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const site = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', 'site.json'), 'utf8'));
const SITE = site.meta.canonical_url;            // single source: content/site.json
const OUT = path.join(ROOT, 'p');

const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'content', f), 'utf8'));
const profile = read('profile.json');
const projects = read('projects.json');

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (p) => (p ? SITE + String(p).replace(/^\.?\//, '') : '');
const crypto = require('crypto');
const assetV = {};
for (const file of fs.readdirSync(path.join(ROOT, 'Images'))) {
  if (!/\.(webp|png|jpe?g|gif|svg)$/i.test(file)) continue;
  assetV['Images/' + file] = crypto.createHash('md5').update(fs.readFileSync(path.join(ROOT, 'Images', file))).digest('hex').slice(0, 8);
}
const ver = (src) => (src && assetV[src] ? `${src}?v=${assetV[src]}` : src);

const featured = (projects.projects || []).filter((p) => p.featured === true)
  .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

fs.mkdirSync(OUT, { recursive: true });
// stale pages (project removed or unfeatured) must not linger in the index
for (const f of fs.readdirSync(OUT)) if (f.endsWith('.html')) fs.unlinkSync(path.join(OUT, f));

const CSS = `:root{--ink:#0E0F12;--graphite:#1C1E22;--panel-2:#181a1f;--orange:#FF5A1F;--line:#272A30;--text:#F4F4F2;--soft:#C9CDD2;--muted:#8A8F98;--fhead:'Space Grotesk',sans-serif;--fbody:'Geist',sans-serif;--fmono:'JetBrains Mono',monospace}
@font-face{font-family:'Space Grotesk';font-weight:400 700;font-display:swap;src:url('../fonts/space-grotesk.woff2') format('woff2')}
@font-face{font-family:'Geist';font-weight:400 700;font-display:swap;src:url('../fonts/geist.woff2') format('woff2')}
@font-face{font-family:'JetBrains Mono';font-weight:400 600;font-display:swap;src:url('../fonts/jetbrains-mono.woff2') format('woff2')}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--ink);color:var(--text);font-family:var(--fbody);line-height:1.65;-webkit-font-smoothing:antialiased}
body::before{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);background-size:64px 64px;opacity:.22;-webkit-mask-image:radial-gradient(ellipse at 50% 0%,#000,transparent 75%);mask-image:radial-gradient(ellipse at 50% 0%,#000,transparent 75%)}
main,header,footer{position:relative;z-index:1}
.wrap{max-width:820px;margin:0 auto;padding:0 clamp(20px,5vw,32px)}
header{position:sticky;top:0;z-index:50;background:rgba(14,15,18,.66);backdrop-filter:blur(18px) saturate(180%);-webkit-backdrop-filter:blur(18px) saturate(180%);border-bottom:1px solid var(--line);box-shadow:inset 0 1px 0 rgba(255,255,255,.045);padding:13px 0;margin-bottom:clamp(32px,6vw,56px)}
header .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;max-width:1280px}
nav{display:flex;align-items:center;gap:20px}
nav a{font-size:.84rem;color:var(--soft);text-decoration:none;transition:color .2s}
nav a:hover{color:var(--text)}
nav a.cta{font-family:var(--fhead);font-weight:600;font-size:.8rem;background:var(--orange);color:#fff;padding:8px 14px;border-radius:7px}
@media(max-width:780px){nav a:not(.cta){display:none}}
.nm{font-family:var(--fhead);font-weight:700;font-size:1rem}
.mk{font-family:var(--fmono);font-size:.6875rem;color:var(--muted)}.mk .d{color:var(--orange);font-weight:700}
.back{font-family:var(--fhead);font-weight:600;font-size:.875rem;color:var(--soft);text-decoration:none}
.back:hover{color:var(--orange)}
.kicker{font-family:var(--fmono);font-size:.6875rem;letter-spacing:.2em;text-transform:uppercase;color:var(--orange)}
h1{font-family:var(--fhead);font-weight:700;font-size:clamp(1.9rem,5vw,2.9rem);letter-spacing:-.02em;line-height:1.1;margin:12px 0 10px;text-wrap:balance}
.sub{color:var(--soft);font-size:1.05rem}
.impact{font-family:var(--fmono);font-size:.84rem;color:var(--orange);margin-top:16px;line-height:1.6}
.meta{font-family:var(--fmono);font-size:.72rem;color:var(--muted);margin-top:14px}
figure{margin:clamp(28px,5vw,40px) 0}
figure img{width:100%;border-radius:12px;border:1px solid var(--line);display:block}
h2{font-family:var(--fhead);font-weight:700;font-size:1.3rem;margin:clamp(30px,5vw,44px) 0 12px}
p{color:var(--soft);margin-bottom:14px}
ul{margin:0 0 14px 20px}li{color:var(--soft);margin-bottom:8px}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}
.chips span{font-family:var(--fmono);font-size:.72rem;color:var(--soft);background:var(--graphite);border:1px solid var(--line);padding:5px 10px;border-radius:999px}
.links{display:flex;flex-wrap:wrap;gap:12px;margin-top:20px}
.btn{display:inline-flex;align-items:center;gap:8px;font-family:var(--fhead);font-weight:600;font-size:.9rem;padding:11px 18px;border-radius:9px;text-decoration:none}
.btn.solid{background:var(--orange);color:var(--ink)}.btn.ghost{border:1.5px solid var(--line);color:var(--text)}
footer{border-top:1px solid var(--line);margin-top:clamp(48px,8vw,80px);padding:26px 0 44px;font-family:var(--fmono);font-size:.72rem;color:var(--muted)}
footer .wrap{display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;max-width:1280px}
footer .d{color:var(--orange)}
a{color:inherit}
@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}`;
fs.writeFileSync(path.join(OUT, 'project.css'), CSS);

const page = (pr) => {
  const url = `${SITE}p/${pr.id}.html`;
  const img = (pr.media || [])[0];
  const desc = (pr.description || pr.subtitle || '').slice(0, 300);
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork', '@id': url + '#work', name: pr.title, headline: pr.title,
        description: pr.description || undefined, abstract: pr.impact || undefined,
        keywords: (pr.tech || []).join(', ') || undefined, url,
        image: img ? abs(ver(img.src)) : undefined,
        creator: { '@type': 'Person', '@id': SITE + '#person', name: profile.name },
        about: (pr.tags || []).join(', ') || undefined
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Projects', item: SITE + '#projects' },
          { '@type': 'ListItem', position: 2, name: pr.title, item: url }
        ]
      }
    ]
  };
  const feats = (pr.features || []).map((x) => `<li>${esc(x)}</li>`).join('');
  const tech = (pr.tech || []).map((x) => `<span>${esc(x)}</span>`).join('');
  const links = (pr.links || []).filter((l) => /^https?:/.test(l.url || ''))
    .map((l) => `<a class="btn ghost" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label || 'View')} ↗</a>`).join('');
  const metaBits = [pr.role, pr.category, (pr.dates && pr.dates.start) ? pr.dates.start : null]
    .filter(Boolean).map(esc).join('  ·  ');
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(pr.title)} — ${esc(profile.name)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article"><meta property="og:title" content="${esc(pr.title)}">
<meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}">
${img ? `<meta property="og:image" content="${abs(ver(img.src))}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="project.css">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head><body>
<header><div class="wrap">
  <a href="../index.html" style="text-decoration:none"><div class="nm">${esc(profile.name)}</div><div class="mk">${esc(site.brand.descriptor).replace(/ · /g, ' <span class="d">·</span> ')}</div></a>
  <nav>
    <a href="../index.html#projects">Projects</a>
    <a href="../index.html#experience">Experience</a>
    <a href="../index.html#publications">Publications</a>
    <a href="../index.html#skills">Stack</a>
    <a href="../index.html#services">Services</a>
    <a class="cta" href="../index.html#contact">Contact</a>
  </nav>
</div></header>
<main class="wrap">
  <span class="kicker">${esc(pr.badge || pr.category || 'Project')}</span>
  <h1>${esc(pr.title)}</h1>
  ${pr.subtitle ? `<p class="sub">${esc(pr.subtitle)}</p>` : ''}
  ${pr.impact ? `<p class="impact">${esc(pr.impact)}</p>` : ''}
  ${metaBits ? `<p class="meta">${metaBits}</p>` : ''}
  ${img ? `<figure><img src="../${esc(ver(img.src))}" alt="${esc(img.alt || pr.title)}" loading="lazy"></figure>` : ''}
  <h2>Overview</h2>
  <p>${esc(pr.long_description || pr.description || '')}</p>
  ${feats ? `<h2>What it does</h2><ul>${feats}</ul>` : ''}
  ${tech ? `<h2>Tech</h2><div class="chips">${tech}</div>` : ''}
  <div class="links">${links}<a class="btn solid" href="../index.html#contact">Discuss a project →</a></div>
</main>
<footer><div class="wrap">
  <span>${esc(site.brand.footer).replace(/ · /g, ' <span class="d">·</span> ')}</span>
  <span><a href="../index.html#projects" style="text-decoration:none">← All projects</a></span>
  <span>${esc([profile.location?.city, profile.location?.country].filter(Boolean).join(', '))} <span class="d">·</span> ${new Date().getFullYear()}</span>
</div></footer>
</body></html>`;
};

featured.forEach((pr) => fs.writeFileSync(path.join(OUT, pr.id + '.html'), page(pr)));
console.log(`built ${featured.length} project pages -> p/`);
