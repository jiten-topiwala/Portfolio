#!/usr/bin/env node
/**
 * seo-build.js — bake SEO into index.html from content/*.json (single source of truth).
 *
 * Run after editing content or the design:   node scripts/seo-build.js
 *
 * Generates, from the same JSON the live site renders:
 *   - <head>: description, keywords, canonical, Open Graph, Twitter card, JSON-LD (Person + projects + publications)
 *   - <body>: a crawler-only static content block (#seo-prerender) — read by AI bots that don't run JS,
 *             removed at runtime once JS loads (so humans never see it).
 *   - llms.txt        — plain-language summary for AI crawlers
 *   - robots.txt      — allows all crawlers, points at the sitemap
 *   - sitemap.xml     — with today's lastmod
 *
 * The site itself stays data-driven; this only writes static mirrors of that data so
 * search engines and AI can read it without executing JavaScript. Injection is idempotent
 * (content sits between <!--SEO:*:START--> / <!--SEO:*:END--> markers), so re-running is safe.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://jiten-topiwala.github.io/Portfolio/';
const OG_IMAGE = 'Images/trackbeltmode.webp'; // personal project (surveillance robot) — safe share image

const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'content', f), 'utf8'));
const profile = read('profile.json');
const skills = read('skills.json');
const projects = read('projects.json');
const pubs = read('publications.json');
const exp = read('experience.json');
const services = read('services.json');
const awards = read('awards.json');
const education = read('education.json');

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (p) => (p ? SITE + String(p).replace(/^\.?\//, '') : '');
const byOrder = (a) => [...a].sort((x, y) => (x.order ?? 999) - (y.order ?? 999));
const stripStars = (s) => String(s || '').replace(/\*/g, '');

const featured = byOrder((projects.projects || []).filter((p) => p.featured === true));
const allSkills = [...new Set((skills.categories || []).flatMap((c) => c.skills || []))];
const desc = profile.short_bio || profile.long_bio || '';
const role = profile.current_role?.title || profile.headline || 'Robotics Engineer';
const title = `${profile.name} — ${role}`;
const sameAs = (profile.social || []).map((s) => s.url).filter((u) => u && /^https?:/.test(u));

// ---------- JSON-LD (@graph: Person + WebSite + project ItemList + publications) ----------
const graph = [
  {
    '@type': 'Person', '@id': SITE + '#person', name: profile.name, jobTitle: role,
    description: desc, url: SITE, image: abs(profile.photo), email: profile.contact?.email || undefined,
    worksFor: profile.current_role?.company ? { '@type': 'Organization', name: profile.current_role.company } : undefined,
    address: {
      '@type': 'PostalAddress', addressLocality: profile.location?.city,
      addressRegion: profile.location?.state, addressCountry: profile.location?.country
    },
    sameAs, knowsAbout: allSkills,
    hasOccupation: { '@type': 'Occupation', name: role },
    alumniOf: byOrder(education.education || []).map((e) => ({ '@type': 'CollegeOrUniversity', name: e.institution })),
    award: byOrder((awards.awards || []).filter((a) => a.featured !== false)).map((a) => a.title),
    makesOffer: byOrder(services.services || []).map((s) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: s.title, description: s.description || '', serviceType: s.title, provider: { '@id': SITE + '#person' }, areaServed: 'Worldwide' }
    }))
  },
  { '@type': 'WebSite', '@id': SITE + '#website', url: SITE, name: title, description: desc, author: { '@id': SITE + '#person' } },
  {
    '@type': 'ItemList', name: 'Projects', itemListElement: featured.map((p, i) => ({
      '@type': 'ListItem', position: i + 1, item: {
        '@type': 'CreativeWork', name: p.title, description: p.description || p.subtitle || '',
        keywords: (p.tech || []).join(', ') || undefined,
        url: (p.links && p.links[0] && /^https?:/.test(p.links[0].url)) ? p.links[0].url : undefined
      }
    }))
  }
];
(pubs.publications || []).forEach((pb) => graph.push({
  '@type': 'ScholarlyArticle', headline: pb.title, name: pb.title, abstract: pb.abstract || undefined,
  publisher: pb.venue || undefined, url: pb.url || undefined, author: { '@id': SITE + '#person' }
}));
const ld = { '@context': 'https://schema.org', '@graph': graph };

// ---------- <head> block ----------
const head = [
  `<meta name="google-site-verification" content="37MTHAONhGKmH8Ze8dDyFiRhaO-V2WGtgDwmf_oLFLc">`,
  `<meta name="msvalidate.01" content="008A37F5FF9B150AD1476F6AAB46A602">`,
  `<meta name="description" content="${esc(desc)}">`,
  `<meta name="keywords" content="${esc(allSkills.slice(0, 25).join(', '))}">`,
  `<meta name="author" content="${esc(profile.name)}">`,
  `<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">`,
  `<link rel="canonical" href="${SITE}">`,
  `<meta name="theme-color" content="#0E0F12">`,
  `<meta property="og:type" content="website">`,
  `<meta property="og:site_name" content="${esc(profile.name)}">`,
  `<meta property="og:title" content="${esc(title)}">`,
  `<meta property="og:description" content="${esc(desc)}">`,
  `<meta property="og:url" content="${SITE}">`,
  `<meta property="og:image" content="${abs(OG_IMAGE)}">`,
  `<meta name="twitter:card" content="summary_large_image">`,
  `<meta name="twitter:title" content="${esc(title)}">`,
  `<meta name="twitter:description" content="${esc(desc)}">`,
  `<meta name="twitter:image" content="${abs(OG_IMAGE)}">`,
  `<style>#seo-prerender{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}</style>`,
  `<script type="application/ld+json">${JSON.stringify(ld)}</script>`
].join('\n');

// ---------- <body> crawler block ----------
const ul = (items) => `<ul>${items.map((x) => `<li>${x}</li>`).join('')}</ul>`;
const body = `<section id="seo-prerender">
<h1>${esc(profile.name)} — ${esc(profile.headline || role)}</h1>
<p>${esc(profile.long_bio || desc)}</p>
<h2>Skills</h2>${ul((skills.categories || []).map((c) => `<strong>${esc(c.label)}:</strong> ${esc((c.skills || []).join(', '))}`))}
<h2>Featured Projects</h2>${ul(featured.map((p) => `<strong>${esc(p.title)}</strong>${p.subtitle ? ` — ${esc(p.subtitle)}` : ''}: ${esc(p.description || '')}${(p.tech || []).length ? ` [${esc((p.tech || []).join(', '))}]` : ''}`))}
<h2>Experience</h2>${ul(byOrder(exp.experience || []).map((x) => `<strong>${esc(x.role || '')}</strong> @ ${esc(x.company || '')}: ${esc(x.summary || '')}`))}
<h2>Publications</h2>${ul((pubs.publications || []).map((pb) => `<strong>${esc(pb.title)}</strong> (${esc(pb.venue || '')}): ${esc(pb.abstract || '')}`))}
<h2>Services</h2>${ul((services.services || []).map((s) => `<strong>${esc(s.title)}:</strong> ${esc(s.description || '')}`))}
<h2>Contact</h2><p>Email: ${esc(profile.contact?.email || '')}. ${(profile.social || []).map((s) => `${esc(s.label)}: ${esc(s.url)}`).join(' · ')}</p>
</section>`;

// ---------- inject into index.html (idempotent, between markers) ----------
const indexPath = path.join(ROOT, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
if (!html.includes('<!--SEO:HEAD:START-->') || !html.includes('<!--SEO:BODY:START-->')) {
  console.error('ERROR: index.html is missing SEO markers. Re-copy it from design-options/option-10-machined-graphite.html first.');
  process.exit(1);
}
html = html.replace(/<!--SEO:HEAD:START-->[\s\S]*?<!--SEO:HEAD:END-->/, `<!--SEO:HEAD:START-->\n${head}\n<!--SEO:HEAD:END-->`);
html = html.replace(/<!--SEO:BODY:START-->[\s\S]*?<!--SEO:BODY:END-->/, `<!--SEO:BODY:START-->${body}<!--SEO:BODY:END-->`);
fs.writeFileSync(indexPath, html);

// ---------- llms.txt ----------
const llms = `# ${profile.name}
> ${stripStars(profile.headline || role)} — ${desc}

${profile.long_bio || ''}

## Skills
${(skills.categories || []).map((c) => `- **${c.label}:** ${(c.skills || []).join(', ')}`).join('\n')}

## Featured Projects
${featured.map((p) => `- **${p.title}**${p.subtitle ? ` (${p.subtitle})` : ''}: ${p.description || ''}${p.links && p.links[0] ? ` — ${p.links[0].url}` : ''}`).join('\n')}

## Experience
${byOrder(exp.experience || []).map((x) => `- **${x.role}** @ ${x.company}: ${x.summary || ''}`).join('\n')}

## Publications
${(pubs.publications || []).map((pb) => `- **${pb.title}** (${pb.venue || ''})${pb.url ? ` — ${pb.url}` : ''}`).join('\n')}

## Services
${(services.services || []).map((s) => `- **${s.title}:** ${s.description || ''}`).join('\n')}

## Contact
- Email: ${profile.contact?.email || ''}
${(profile.social || []).map((s) => `- ${s.label}: ${s.url}`).join('\n')}
`;
fs.writeFileSync(path.join(ROOT, 'llms.txt'), llms);

// ---------- robots.txt (all crawlers allowed) ----------
const robots = `User-agent: *
Allow: /

Sitemap: ${SITE}sitemap.xml
`;
fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots);

// ---------- sitemap.xml ----------
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>1.0</priority></url>
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);

console.log(`SEO baked:
  index.html   head meta + Open Graph + Twitter + JSON-LD (${graph.length} nodes), crawler block (${featured.length} projects)
  llms.txt     ${llms.length} bytes
  robots.txt   all crawlers allowed
  sitemap.xml  lastmod ${today}`);
