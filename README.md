# MoveDeal Brand Kit

Official brand assets for **MoveDeal** (movedeal.app) — the European moving marketplace.

**MVP freeze:** `v1.0.0-mvp`

## Branch model

- `main` — production snapshot
- `develop` — integration
- Short-lived `feat/*` / `fix/*` → PR into `develop` → release PR into `main`

## Trademark

The MoveDeal name, logos, marks, and wordmarks are trademarks of MoveDeal. The MIT license covers the scripts and kit tooling in this repository; it does **not** grant trademark rights. Do not use the marks in a way that implies endorsement without permission.

Vector masters follow the MD monogram identity sheet: geometric **M + D** mark with cyan anchor, **MoveDeal** wordmark. Production SVGs use stroke-based mark geometry and **outlined Inter Bold** wordmark — no live `<text>`.

## View locally

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Regenerate assets

```bash
npm install
node scripts/generate-assets.mjs
```

## Identity

- **Mark:** Geometric MD monogram + cyan accent dot
- **Lockup:** 32px mark · 8px gap · 24px Inter Bold wordmark
- **Colors:** Brand `#5B4BFF` · Cyan `#19D3FF` · Ink `#0A0F14` · White `#FFFFFF`
- **Type:** Inter Bold for the wordmark; Inter / Manrope for product UI

## GitHub Pages

**Live site:** https://movedeal.github.io/movedeal-brand/

Intended host: `https://movedeal.github.io/movedeal-brand/` (MoveDeal org). Pages builds from `main` (site root).

### Discovery / SEO

- On-page meta, Open Graph, JSON-LD, `robots.txt`, and `sitemap.xml` ship with the kit.
- Google may take days–weeks to show the page for brand queries; help it with:
  1. [Google Search Console](https://search.google.com/search-console) → add URL prefix `https://movedeal.github.io/movedeal-brand/` (or the `movedeal.github.io` property)
  2. Submit `https://movedeal.github.io/movedeal-brand/sitemap.xml`
  3. URL Inspection → **Request indexing** for the homepage
- A link from [movedeal.app](https://movedeal.app/) (footer) also helps crawlers find the kit.
