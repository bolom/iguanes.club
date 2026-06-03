# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static single-page site for **Les Iguanes**, a flag football club in Schœlcher, Martinique. Deployed via GitHub Pages directly from the repository root. No build step — the repo root is the webroot.

## Core files

| File | Purpose |
|------|---------|
| `index.html` | The entire site — one page, anchor-based navigation |
| `iguanes-v3.css` | All styles (no preprocessor) |
| `iguanes-v3.js` | Vanilla JS: scroll reveal, burger, stat counters, parallax, gallery tabs, lightbox |
| `image-slot.js` | Standalone image slot helper |
| `mentions-legales.html` | Legal notices page |

## Serving locally

Any static server works:

```bash
python3 -m http.server 8080
# or
npx serve .
```

## Smoke tests

```bash
bash tests/github-pages-smoke.sh   # checks assets, references, fixtures, standings
bash tests/history-gallery-smoke.sh  # checks gallery/history markup counts and asset integrity
```

`ripgrep` (`rg`) must be installed for the smoke tests.

## Image pipeline

All displayed images live in three responsive variants:

| Directory | Max dimension | Quality |
|-----------|--------------|---------|
| `assets-mobile/` | 900 px | 74 |
| `assets-tablet/` | 1320 px | 78 |
| `assets-web/` | 1800 px | 82 |

`<picture>` elements in `index.html` reference all three with `<source media="...">` breakpoints.

**To rebuild responsive images from ZIP source archives** (ImageMagick + bsdtar required):

```bash
# Place *.zip archives at the repo root, then:
node scripts/build-responsive-media.mjs
```

The script reads ZIPs → extracts to `/private/tmp/iguanes-club-media-source/` → re-renders all images already referenced in `assets-mobile/` and `assets-web/` at every variant size.

Other scripts in `scripts/` (`build-media-from-source.mjs`, `build-final-candidates-media.mjs`) are intermediate/one-off tools used during photo selection; they are not part of the normal workflow.

## Asset organisation

```
assets-{mobile,tablet,web}/
  01-details/          # detail/prop shots
  03-groupe/           # group/team shots
  04-action/           # action shots
  05-nuit/             # night shots
  camp-feminin-2026/   # women's camp, 8 March 2026
  sinobowl-2024/       # SINOBOWL 2024 tournament
  portraits-by-jersey/ # player portraits, named <number>-<name>/
  finale/              # finals shots
public/images/         # miscellaneous static assets (logo, hero, gallery extras)
```

## Site sections

The page is structured as anchor-linked sections in this order: `#club` → `#histoire` → `#effectif` → `#galerie` → `#calendrier` → `#resultats` → `#rejoindre` → `#contact`.

**Gallery tabs** (`data-tab` attribute on `.gcell` buttons) filter the gallery grid client-side. Tabs: `all`, `seance-mai`, `sinobowl-2024`, `camp-feminin`, `club`.

**Lightbox** (`#history-lightbox`) is triggered by any `button.media-launch`; it reads `data-full` (full-res path) and `data-caption`.

**Contact form** posts to Formspree (`https://formspree.io/f/xpwzgqkb`).

## Deployment

Push to `main` — GitHub Pages serves from the repository root automatically. The `.nojekyll` file disables Jekyll processing.

## Photo credits

All photos from the 30 May 2026 session and SINOBOWL 2024 are credited **© JPK Visual** (`@jpk.visual`). Always preserve attribution in captions and footer notes when adding or moving images.
