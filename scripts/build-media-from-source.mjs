#!/usr/bin/env node
/**
 * Build responsive webp assets from media/ source photos.
 *
 * For each source mapping defined in SOURCES, copies the selected photos into
 * the three assets-* trees (assets-web, assets-tablet, assets-mobile) at the
 * correct breakpoint sizes, preserving the category subfolder structure that
 * already exists for 01-details, 03-groupe, 04-action, 05-nuit, finale,
 * portraits-by-jersey — and adding new categories as the club grows.
 *
 * Usage:
 *   node scripts/build-media-from-source.mjs
 *   node scripts/build-media-from-source.mjs --dry-run   # preview only, no writes
 *   node scripts/build-media-from-source.mjs --force     # rebuild even if output exists
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const DRY = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');

// Breakpoint definitions — same as build-responsive-media.mjs for consistency
const BREAKPOINTS = {
  'assets-web':    { maxDim: 1800, quality: 82 },
  'assets-tablet': { maxDim: 1320, quality: 78 },
  'assets-mobile': { maxDim: 900,  quality: 74 },
};

// SOURCES: maps each photo to its target category + output slug.
// category -> subfolder in assets-web, assets-tablet, assets-mobile (consistent across all three)
// slug     -> output filename without extension (becomes slug.webp)
// src      -> absolute path to source JPG/HEIC/PNG inside media/
//
// To add photos: append entries, run the script.
// To remove: delete the entry, delete the generated files.
const MEDIA = path.join(ROOT, 'media');
const SB24 = path.join(MEDIA, 'SINOBOWL 2024-20260602T191907Z-3-001', 'SINOBOWL 2024', 'Sinobowl', 'PHOTOSTJO');
const SB24B = path.join(MEDIA, 'SINOBOWL 2024-20260602T191907Z-3-002', 'SINOBOWL 2024', 'Sinobowl', 'PHOTOSTJO');
const CAMP26 = path.join(MEDIA, 'Camp féminin 8 mars 2026-20260602T191904Z-3-001', 'Camp féminin 8 mars 2026');

const SOURCES = [
  // ─── SINOBOWL 2024 — Warmup ───────────────────────────────────────────────
  { category: 'sinobowl-2024', slug: 'sb24-warmup-02',   src: path.join(SB24B, 'Warmup', 'Finale SINO BOWL-2.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-warmup-17',   src: path.join(SB24B, 'Warmup', 'Finale SINO BOWL-17.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-warmup-22',   src: path.join(SB24B, 'Warmup', 'Finale SINO BOWL-22.jpg') },

  // ─── SINOBOWL 2024 — Appel / avant-match ─────────────────────────────────
  { category: 'sinobowl-2024', slug: 'sb24-appel-25',    src: path.join(SB24B, 'Appel', 'Finale SINO BOWL-25.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-appel-31',    src: path.join(SB24B, 'Appel', 'Finale SINO BOWL-31.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-appel-42',    src: path.join(SB24B, 'Appel', 'Finale SINO BOWL-42.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-appel-52',    src: path.join(SB24B, 'Appel', 'Finale SINO BOWL-52.jpg') },

  // ─── SINOBOWL 2024 — Action Offense ──────────────────────────────────────
  { category: 'sinobowl-2024', slug: 'sb24-offense-100', src: path.join(SB24B, 'Offense', 'Finale SINO BOWL-100.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-offense-107', src: path.join(SB24B, 'Offense', 'Finale SINO BOWL-107.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-offense-110', src: path.join(SB24B, 'Offense', 'Finale SINO BOWL-110.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-offense-141', src: path.join(SB24B, 'Offense', 'Finale SINO BOWL-141.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-offense-149', src: path.join(SB24B, 'Offense', 'Finale SINO BOWL-149.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-offense-159', src: path.join(SB24B, 'Offense', 'Finale SINO BOWL-159.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-offense-172', src: path.join(SB24B, 'Offense', 'Finale SINO BOWL-172.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-offense-176', src: path.join(SB24B, 'Offense', 'Finale SINO BOWL-176.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-offense-220', src: path.join(SB24B, 'Offense', 'Finale SINO BOWL-220.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-offense-249', src: path.join(SB24B, 'Offense', 'Finale SINO BOWL-249.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-offense-263', src: path.join(SB24B, 'Offense', 'Finale SINO BOWL-263.jpg') },

  // ─── SINOBOWL 2024 — Action Défense ──────────────────────────────────────
  { category: 'sinobowl-2024', slug: 'sb24-defense-123', src: path.join(SB24B, 'Defense', 'Finale SINO BOWL-123.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-defense-223', src: path.join(SB24B, 'Defense', 'Finale SINO BOWL-223.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-defense-269', src: path.join(SB24B, 'Defense', 'Finale SINO BOWL-269.jpg') },

  // ─── SINOBOWL 2024 — Sideline / Atmosphère ───────────────────────────────
  { category: 'sinobowl-2024', slug: 'sb24-sideline-91',  src: path.join(SB24, 'Sideline', 'Finale SINO BOWL-91.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-sideline-106', src: path.join(SB24, 'Sideline', 'Finale SINO BOWL-106.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-sideline-120', src: path.join(SB24, 'Sideline', 'Finale SINO BOWL-120.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-sideline-134', src: path.join(SB24, 'Sideline', 'Finale SINO BOWL-134.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-sideline-171', src: path.join(SB24, 'Sideline', 'Finale SINO BOWL-171.jpg') },

  // ─── SINOBOWL 2024 — Célébrations ────────────────────────────────────────
  { category: 'sinobowl-2024', slug: 'sb24-celebration-270', src: path.join(SB24, 'Celebrations', 'Finale SINO BOWL-270.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-celebration-271', src: path.join(SB24, 'Celebrations', 'Finale SINO BOWL-271.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-celebration-272', src: path.join(SB24, 'Celebrations', 'Finale SINO BOWL-272.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-celebration-274', src: path.join(SB24, 'Celebrations', 'Finale SINO BOWL-274.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-celebration-278', src: path.join(SB24, 'Celebrations', 'Finale SINO BOWL-278.jpg') },

  // ─── SINOBOWL 2024 — Cérémonie / Médailles ───────────────────────────────
  { category: 'sinobowl-2024', slug: 'sb24-ceremonie-291', src: path.join(SB24, 'Cérémonie', 'Finale SINO BOWL-291.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-ceremonie-299', src: path.join(SB24, 'Cérémonie', 'Finale SINO BOWL-299.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-ceremonie-301', src: path.join(SB24, 'Cérémonie', 'Finale SINO BOWL-301.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-ceremonie-302', src: path.join(SB24, 'Cérémonie', 'Finale SINO BOWL-302.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-ceremonie-310', src: path.join(SB24, 'Cérémonie', 'Finale SINO BOWL-310.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-ceremonie-311', src: path.join(SB24, 'Cérémonie', 'Finale SINO BOWL-311.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-ceremonie-312', src: path.join(SB24B, 'Cérémonie', 'Finale SINO BOWL-312.jpg') },
  { category: 'sinobowl-2024', slug: 'sb24-ceremonie-313', src: path.join(SB24B, 'Cérémonie', 'Finale SINO BOWL-313.jpg') },

  // ─── CAMP FÉMININ 8 mars 2026 ─────────────────────────────────────────────
  { category: 'camp-feminin-2026', slug: 'camp26-01', src: path.join(CAMP26, 'IMG_20260308_165734.jpg') },
  { category: 'camp-feminin-2026', slug: 'camp26-02', src: path.join(CAMP26, 'IMG_20260308_165735.jpg') },
  { category: 'camp-feminin-2026', slug: 'camp26-03', src: path.join(CAMP26, 'IMG_20260308_165738.jpg') },
  { category: 'camp-feminin-2026', slug: 'camp26-04', src: path.join(CAMP26, 'IMG_20260308_171744.jpg') },
  { category: 'camp-feminin-2026', slug: 'camp26-05', src: path.join(CAMP26, 'IMG_20260308_171813.jpg') },
  { category: 'camp-feminin-2026', slug: 'camp26-06', src: path.join(CAMP26, 'IMG_20260308_171815.jpg') },
  { category: 'camp-feminin-2026', slug: 'camp26-07', src: path.join(CAMP26, 'IMG_20260308_172310.jpg') },
  { category: 'camp-feminin-2026', slug: 'camp26-08', src: path.join(CAMP26, 'IMG_20260308_172311.jpg') },
  { category: 'camp-feminin-2026', slug: 'camp26-09', src: path.join(CAMP26, 'IMG_20260308_172314.jpg') },
  { category: 'camp-feminin-2026', slug: 'camp26-10', src: path.join(CAMP26, 'IMG_20260308_172320.jpg') },
  { category: 'camp-feminin-2026', slug: 'camp26-11', src: path.join(CAMP26, 'IMG_20260308_172321.jpg') },
  { category: 'camp-feminin-2026', slug: 'camp26-12', src: path.join(CAMP26, 'IMG_20260308_185125.jpg') },
  { category: 'camp-feminin-2026', slug: 'camp26-13', src: path.join(CAMP26, 'IMG_20260308_185128.jpg') },
];

async function fileExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

function convert(src, dest, maxDim, quality) {
  execFileSync('magick', [
    src,
    '-auto-orient',
    '-strip',
    '-resize', `${maxDim}x${maxDim}>`,
    '-quality', String(quality),
    dest,
  ], { stdio: 'pipe' });
}

async function main() {
  let built = 0;
  let skipped = 0;
  let missing = 0;

  for (const { category, slug, src } of SOURCES) {
    if (!await fileExists(src)) {
      console.warn(`  MISSING source: ${path.relative(ROOT, src)}`);
      missing++;
      continue;
    }

    for (const [variant, { maxDim, quality }] of Object.entries(BREAKPOINTS)) {
      const dest = path.join(ROOT, variant, category, `${slug}.webp`);

      if (!FORCE && await fileExists(dest)) {
        skipped++;
        continue;
      }

      if (DRY) {
        console.log(`  [dry] ${path.relative(ROOT, dest)} ← ${path.relative(ROOT, src)}`);
        built++;
        continue;
      }

      await fs.mkdir(path.dirname(dest), { recursive: true });
      try {
        convert(src, dest, maxDim, quality);
        console.log(`  ✓ ${path.relative(ROOT, dest)}`);
        built++;
      } catch (err) {
        console.error(`  ✗ ${path.relative(ROOT, dest)}: ${err.message}`);
      }
    }
  }

  console.log(`\nDone. Built: ${built}  Skipped (exists): ${skipped}  Missing source: ${missing}`);
  if (missing > 0) {
    console.log('Run with --force to rebuild all existing outputs.');
  }
}

main().catch(err => { console.error(err.message); process.exit(1); });
