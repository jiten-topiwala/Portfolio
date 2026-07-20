/**
 * content-loader.js
 *
 * Single source of truth loader for all portfolio content.
 *
 * Usage from any design's HTML:
 *
 *   <script type="module">
 *     import { loadContent } from '../shared/content-loader.js';
 *     const data = await loadContent();
 *     // data.profile, data.experience, data.projects, data.publications,
 *     // data.awards, data.patents, data.skills, data.leadership,
 *     // data.certifications, data.memberships, data.services, data.education
 *   </script>
 *
 * If a design lives at the project root (e.g. /index.html), pass basePath as './'.
 * If it lives at /design-options/option-1.html, pass basePath as '../'.
 */

const FILES = [
  'site',
  'profile',
  'contact',
  'experience',
  'education',
  'projects',
  'publications',
  'awards',
  'patents',
  'skills',
  'leadership',
  'certifications',
  'memberships',
  'services'
];

/**
 * Load all content JSON files in parallel.
 * @param {string} basePath - path to project root from the calling page (default './')
 * @returns {Promise<Object>} object keyed by file name (e.g. data.profile)
 */
export async function loadContent(basePath = './') {
  const root = basePath.endsWith('/') ? basePath : basePath + '/';
  const entries = await Promise.all(
    FILES.map(async (name) => {
      const url = `${root}content/${name}.json`;
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) {
        throw new Error(`Failed to load ${url}: ${res.status} ${res.statusText}`);
      }
      const json = await res.json();
      return [name, json];
    })
  );
  return Object.fromEntries(entries);
}

/**
 * Load a single content file.
 * @param {string} name - one of FILES (e.g. 'projects')
 * @param {string} basePath - path to project root from the calling page
 */
export async function loadOne(name, basePath = './') {
  const root = basePath.endsWith('/') ? basePath : basePath + '/';
  const res = await fetch(`${root}content/${name}.json`, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Failed to load ${name}.json`);
  return res.json();
}

// ---------- Helpers used across designs ----------

/** Sort by `order` ascending, falling back to original index. */
export function byOrder(items = []) {
  return [...items].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

/** Filter to items marked featured: true. */
export function onlyFeatured(items = []) {
  return items.filter((i) => i.featured === true);
}

/** Filter projects (or any items with `category`) by category id. 'all' returns everything. */
export function byCategory(items = [], categoryId = 'all') {
  if (!categoryId || categoryId === 'all') return items;
  return items.filter((i) => i.category === categoryId);
}

/** Find an award by id. */
export function findById(items = [], id) {
  return items.find((i) => i.id === id) || null;
}

/** Resolve award objects from a list of award ids on a project. */
export function awardsForProject(project, allAwards) {
  if (!project?.award_ids?.length) return [];
  return project.award_ids
    .map((id) => findById(allAwards, id))
    .filter(Boolean);
}

/** Resolve publication objects from a list of publication ids on a project. */
export function publicationsForProject(project, allPublications) {
  if (!project?.publication_ids?.length) return [];
  return project.publication_ids
    .map((id) => findById(allPublications, id))
    .filter(Boolean);
}

/** Resolve patent for a project, if any. */
export function patentForProject(project, allPatents) {
  if (!project?.patent_id) return null;
  return findById(allPatents, project.patent_id);
}

/**
 * Format a date range like "Jul 2025 – Present" from start_date/end_date strings ("YYYY-MM").
 * Returns plain strings — designs can restyle.
 */
export function formatDateRange(start, end, current = false) {
  const fmt = (ym) => {
    if (!ym) return '';
    const [y, m] = ym.split('-').map(Number);
    if (!m) return String(y);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[m - 1]} ${y}`;
  };
  const s = fmt(start);
  const e = current || !end ? 'Present' : fmt(end);
  if (!s && !e) return '';
  if (!s) return e;
  return `${s} – ${e}`;
}

/**
 * Convenience: HTML-escape a string for safe innerHTML insertion.
 */
export function escapeHTML(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Look up a social entry from profile.json by platform id (e.g. "linkedin").
 */
export function findSocial(profile, platform) {
  if (!profile?.social) return null;
  return profile.social.find((s) => s.platform === platform) || null;
}

/**
 * Resolve every contact method's URL/handle by referencing profile.social.
 * Returns the method array with `url`, `handle`, and `rating` filled in.
 * Use this to render the contact cards without duplicating URLs.
 */
export function resolveContactMethods(contact, profile) {
  if (!contact?.methods) return [];
  return byOrder(contact.methods).map((m) => {
    const social = findSocial(profile, m.ref_social_platform);
    return {
      ...m,
      url: social?.url ?? null,
      handle: social?.handle ?? null,
      rating: social?.rating ?? null
    };
  });
}
