#!/usr/bin/env node
/**
 * indexnow.js — tell IndexNow (Bing, Yandex, Seznam) which URLs changed.
 *
 * Google does not support IndexNow and retired its sitemap ping in 2023 — for Google the
 * sitemap's <lastmod> is the signal, so there is nothing to automate there.
 *
 * The key lives in content/site.json; seo-build.js publishes it as <key>.txt at the site root,
 * which is how IndexNow verifies ownership. Run after the site is live.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'site.json'), 'utf8'));
const key = site.meta.indexnow_key;
const SITE = site.meta.canonical_url;
const host = new URL(SITE).host;

const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!key || !urlList.length) { console.error('indexnow: missing key or urls'); process.exit(1); }

const body = { host, key, keyLocation: `${SITE}${key}.txt`, urlList };

fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body)
}).then((r) => {
  // 200 accepted · 202 accepted, key validation pending · 4xx = a real problem
  console.log(`indexnow: HTTP ${r.status} for ${urlList.length} urls`);
  if (r.status >= 400) process.exit(1);
}).catch((e) => { console.error('indexnow failed:', e.message); process.exit(1); });
