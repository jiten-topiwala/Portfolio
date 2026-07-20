# Portfolio Content Schema

This is the **single source of truth** for all content shown across every portfolio design (`/index.html` and `/design-options/*.html`). When you want to update a project, add an experience, or fix a typo — you edit a JSON file in [`/content/`](../content/), and every design that uses the loader picks it up automatically.

The folder layout is:

```
Portfolio/
├── content/
│   ├── site.json            # meta tags, nav, footer, fonts, theme, SEO
│   ├── profile.json         # you, contact, social, stats
│   ├── contact.json         # form config, contact methods, CTAs, messages
│   ├── experience.json      # jobs + internships + research
│   ├── education.json
│   ├── projects.json        # everything you've built
│   ├── publications.json    # IEEE / IJIRT papers
│   ├── awards.json          # prizes & rankings
│   ├── patents.json
│   ├── skills.json          # categorized skill list
│   ├── leadership.json      # class rep, T&P, event-head, etc.
│   ├── certifications.json
│   ├── memberships.json
│   └── services.json        # "hire me" offerings + process
├── shared/
│   ├── content-loader.js    # fetch + render helpers used by every design
│   └── schema.md            # this file
└── Images/                  # referenced from JSON via relative paths
```

## Conventions used everywhere

These fields appear on many items. Knowing them once saves repetition:

| Field | Purpose |
|---|---|
| `id` | Stable, kebab-case identifier — used for cross-references between files. **Never reuse or rename**, or links break. |
| `order` | Sort key (lower numbers appear first). Designs sort by this. |
| `featured` | `true` to surface on highlight reels / featured sections; `false` to keep in full lists only. |
| `start_date` / `end_date` | Format: `"YYYY-MM"` (or `"YYYY"` if month unknown). `null` if ongoing. |
| `current` | `true` if still ongoing — designs render "Present" instead of an end date. |
| `image` / `media` | Always relative paths from project root (e.g. `"Images/foo.webp"`). |
| `tags` | Free-form labels for filtering / search. |
| `category` | Restricted vocabulary used by filter UIs (e.g. `"robotics"`, `"industrial"`, `"research"`, `"competition"`, `"freelance"`). |

## Cross-references

Some items reference each other by `id`. This lets a design show, for example, "Robocon 2024" together with all 4 of its awards — without duplicating data.

| From | Field | Points to |
|---|---|---|
| `projects[].award_ids` | array of `id` | `awards[].id` |
| `projects[].publication_ids` | array of `id` | `publications[].id` |
| `projects[].patent_id` | single `id` | `patents[].id` |
| `awards[].project_id` | single `id` | `projects[].id` |
| `publications[].project_id` | single `id` | `projects[].id` |
| `patents[].project_id` | single `id` | `projects[].id` |
| `contact.methods[].ref_social_platform` | platform string | `profile.social[].platform` |

Helpers in `content-loader.js` resolve these for you (`awardsForProject`, `publicationsForProject`, `patentForProject`, `findSocial`, `resolveContactMethods`).

---

## File-by-file shape

### `site.json`

Top-level object. Site-wide config that every design uses but rarely shows as content. Edit once; every design picks it up.

Sections:
- `meta` — `{ title, description, keywords, author, canonical_url, language, google_site_verification, og: {...}, twitter: {...} }`. Used to populate `<head>` tags.
- `favicon` — `{ type, inline_svg }`. Inline SVG keeps the favicon in one place; designs render it as a data-URL.
- `structured_data` — JSON-LD `Person` schema for SEO. Designs serialise this verbatim into a `<script type="application/ld+json">`.
- `fonts` — array of `{ family, weights[], source }`. The loader can emit a Google Fonts URL or designs can ignore and use their own fonts.
- `icon_libraries` — array of `{ name, version, url }` (Font Awesome by default).
- `theme` — `{ color_primary, color_secondary, color_bg, gradient_accent }`. Designs can read these as CSS variables for quick reskinning.
- `nav` — `{ logo_text, items: [{ label, href, external }] }`. The single source of truth for menu structure across designs.
- `footer` — `{ brand_text, tagline, copyright_owner, copyright_suffix, version, links: [...], show_social }`.
- `ui` — short strings used across designs (preloader text, scroll indicator, hero badge, floating-contact label).

### `contact.json`

Top-level object. Owns the contact section, the form, the CTA buttons, and the contact-method cards.

Sections:
- `section` — `{ tag, title, title_highlight, subtitle, availability_line }`. Section headings and one-liners.
- `methods[]` — contact-card definitions. Each `{ id, order, label, icon, icon_lib, ref_social_platform, card_subtext, show_rating }`. The URL and handle are NOT stored here — `ref_social_platform` points to a `profile.social[].platform` so there's only one URL per channel. Use `resolveContactMethods(contact, profile)` from the loader to get methods with `url`/`handle`/`rating` filled in.
- `form` — `{ enabled, provider, action_url, method, recipient, hidden_fields[], fields[], submit_button }`. Per-field shape: `{ name, label, type, required, placeholder, autocomplete }` (textarea adds `rows`). Switch providers by editing `provider` + `action_url` + `hidden_fields`.
- `messages` — `{ success, error, validation: {...} }`. Strings shown on submit success/failure and per-field validation errors.
- `cta_buttons[]` — buttons for the services/contact CTA strip (`{ id, label, url, primary, external, icon }`).
- `hero_ctas[]` — buttons for the hero section ("Hire Me" / "View Projects").

### `profile.json`

Top-level object (not an array). Used by the hero, about, footer, and contact sections.

Key fields:
- `name`, `first_name`, `last_name`
- `headline` — one-liner under the name (e.g. "Robotics Engineer & Innovator")
- `roles` — array of strings used by typewriters / role rotators
- `tagline` — short footer-style phrase
- `short_bio`, `long_bio` — pick whichever fits the design's space
- `current_role` — `{ title, company, since }`
- `availability` — `{ status, for, response_time }`
- `location` — `{ city, state, country }`
- `photo` — relative image path
- `logo_text` — short brand mark (e.g. "G10")
- `contact` — `{ email, phone }`
- `social` — array of `{ platform, label, url, handle }` (and optional `rating` for Fiverr)
- `stats` — array of `{ label, value, suffix }` for the about-section counters

### `experience.json`

`{ experience: [ ... ] }` — array of roles in reverse-chronological order via `order`.

Per item: `id`, `order`, `featured`, `role`, `company`, `type` (`"full-time"` | `"internship"` | `"research"`), `location`, `start_date`, `end_date`, `current`, `summary`, `highlights[]`, `tech[]`, `image`, `links[]`, optional `supervisor`.

### `education.json`

`{ education: [ ... ] }`. Fields: `id`, `order`, `degree`, `institution`, `location`, `start_date`, `end_date`, `batch`, `summary`, `highlights[]`, `gpa`.

### `projects.json`

`{ categories: [...], projects: [...] }`.

`categories` drives filter buttons. Each: `{ id, label }`. The `id` matches `projects[].category`.

`projects[]` per item:
- Identity: `id`, `order`, `featured`, `title`, `subtitle`
- Classification: `category`, `tags[]`, `badge` (small label like "Award Winning")
- Pitch: `impact` (one-line outcome), `description` (1–2 sentence card blurb), `long_description` (modal/detail body)
- Detail: `features[]`, `tech[]`, `role`, `team_size`, `dates: { start, end }`
- Media: `media[]` of `{ type: "image" | "video", src, thumb, alt }`
- External: `links[]` of `{ label, url, type }`
- Cross-refs: `award_ids[]`, `publication_ids[]`, `patent_id`

### `publications.json`

`{ publications: [...] }`. Fields: `id`, `order`, `featured`, `ref_code` (e.g. `"C.1"`, `"J.1"`), `type` (`"conference"` | `"journal"`), `venue`, `venue_full`, `publisher`, `title`, `authors[]`, `year`, `month`, `volume`, `issue`, `pages`, `paper_id`, `doi`, `url`, `abstract`, `citation` (full pre-formatted), `project_id`, optional `location` for conferences.

### `awards.json`

`{ awards: [...] }`. Fields: `id`, `order`, `featured`, `title`, `issuer`, `year`, `month`, `rank` (e.g. `"1st"`, `"Winner"`, `"5th"`, `"Awarded"`), `prize_inr`, `category` (`"academic"` | `"competition"` | `"entrepreneurship"` | `"ideathon"` | …), `description`, `project_id`, `image`.

### `patents.json`

`{ patents: [...] }`. Fields: `id`, `order`, `featured`, `title`, `status` (e.g. `"approved-for-filing"`, `"filed"`, `"granted"`), `filed_through`, `filing_year`, `patent_number`, `inventors[]`, `abstract`, `project_id`.

### `skills.json`

`{ categories: [...] }` — array of skill groups. Per group: `id`, `order`, `label`, `icon` (Font Awesome class without `fa-` prefix), `skills[]` (plain strings).

### `leadership.json`

`{ leadership: [...] }`. Fields: `id`, `order`, `featured`, `title`, `organization`, `start_date`, `end_date`, `current`, `summary`.

### `certifications.json`

`{ certifications: [...] }`. Fields: `id`, `order`, `title`, `issuer`, `year`, `category`, `url`.

### `memberships.json`

`{ memberships: [...] }`. Fields: `id`, `order`, `featured`, `organization`, `role`, `since`, `until`, `current`, `summary`.

### `services.json`

Top-level object. Fields: `intro`, `services[]`, `process[]`, `cta[]`.
- `services[]`: `{ id, order, title, icon, description, deliverables[] }`
- `process[]`: `{ step, title, icon, description }`
- `cta[]`: `{ label, url, primary, external }`

---

## How to add or change something

| You want to… | Edit |
|---|---|
| Add a new project | `content/projects.json` → append to `projects[]` |
| Add an award to an existing project | `content/awards.json` (new entry) **and** add the new award `id` to the project's `award_ids[]` in `projects.json` |
| Add a new job | `content/experience.json` → append to `experience[]` |
| Add a new skill | `content/skills.json` → append to the right `categories[].skills[]` |
| Change your tagline / hero copy | `content/profile.json` |
| Change a photo | drop the new image into `Images/`, update the `src` in the relevant JSON |
| Add a nav menu item | `content/site.json` → `nav.items[]` |
| Change SEO title / OG image | `content/site.json` → `meta` |
| Switch contact-form provider | `content/contact.json` → `form.provider` + `action_url` + `hidden_fields` |
| Rename a form field label | `content/contact.json` → `form.fields[]` |
| Update a contact card's URL | `content/profile.json` → `social[]` (NOT contact.json — single source of truth) |
| Add a new top-level section type | new `content/<name>.json` + add `<name>` to the `FILES` list at the top of `shared/content-loader.js` |

After editing JSON, hard-refresh the page (the loader uses `cache: 'no-cache'` but browsers can still cache the page itself).

## How a design wires this in

Sketch (any design's HTML can do this):

```html
<script type="module">
  import { loadContent, byOrder, onlyFeatured, awardsForProject } from '../shared/content-loader.js';

  const data = await loadContent('../');   // '../' because we're in /design-options/

  // Hero
  document.querySelector('#name').textContent = data.profile.name;
  document.querySelector('#tagline').textContent = data.profile.tagline;

  // Featured projects
  const featured = onlyFeatured(byOrder(data.projects.projects));
  for (const p of featured) {
    // build a card from p.title / p.impact / p.media[0] / p.tech / etc.
    const projectAwards = awardsForProject(p, data.awards.awards);
    // ... show award badges if any
  }
</script>
```

The HTML stays a template; the JSON is the data. Different designs can show the same data in completely different layouts.

## Rules of thumb

1. **Never duplicate.** If the same fact lives in two files, they will eventually disagree. Use cross-reference `id`s instead.
2. **Never reuse an `id`.** Once written, an `id` is part of the public contract between files.
3. **Always use relative paths from project root** for image / media `src`. The loader normalises base paths; image paths should not.
4. **Sort with `order`, not file position.** Designs read in any order — `order` is the source of truth for display sequence.
5. **`featured: true` is for highlight reels.** Don't mark everything featured; the point is curation.
