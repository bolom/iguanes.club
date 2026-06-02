#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const MEDIA_ROOT = path.join(ROOT, 'public/images/final-candidates');
const WEB_DIR = path.join(MEDIA_ROOT, 'web');
const THUMBS_DIR = path.join(MEDIA_ROOT, 'thumbs');
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

function extname(file) {
  return path.extname(file).toLowerCase();
}

function stem(file) {
  return path.basename(file, path.extname(file));
}

function slugify(file) {
  return stem(file)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function listOriginals() {
  const entries = await fs.readdir(MEDIA_ROOT, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && IMAGE_EXTS.has(extname(entry.name)))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
}

async function ensureCleanDir(dir) {
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
}

function runMagick(args) {
  execFileSync('magick', args, { stdio: 'inherit' });
}

async function main() {
  const originals = await listOriginals();

  if (!originals.length) {
    throw new Error(`No original images found in ${MEDIA_ROOT}`);
  }

  await ensureCleanDir(WEB_DIR);
  await ensureCleanDir(THUMBS_DIR);

  for (const original of originals) {
    const input = path.join(MEDIA_ROOT, original);
    const slug = slugify(original);
    const webOutput = path.join(WEB_DIR, `${slug}.webp`);
    const thumbOutput = path.join(THUMBS_DIR, `${slug}.webp`);

    runMagick([
      input,
      '-auto-orient',
      '-strip',
      '-resize',
      '1800x1800>',
      '-quality',
      '82',
      webOutput,
    ]);

    runMagick([
      input,
      '-auto-orient',
      '-strip',
      '-resize',
      '720x720^',
      '-gravity',
      'center',
      '-extent',
      '720x720',
      '-quality',
      '78',
      thumbOutput,
    ]);
  }

  console.log(`Built ${originals.length} web image(s) and ${originals.length} thumbnail(s).`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
