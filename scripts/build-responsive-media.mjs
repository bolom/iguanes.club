#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const TMP_SOURCE = '/private/tmp/iguanes-club-media-source';
const ARCHIVE_ROOT = path.join(TMP_SOURCE, 'archives');
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.heic', '.tif', '.tiff']);
const TARGET_DIRS = ['assets-mobile', 'assets-web'];

const SIZES = {
  'assets-mobile': { maxDim: 900, quality: 74 },
  'assets-tablet': { maxDim: 1320, quality: 78 },
  'assets-web': { maxDim: 1800, quality: 82 },
};

async function walk(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...await walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

function stem(file) {
  return path.basename(file).replace(/\.[^.]+$/, '');
}

function ext(file) {
  return path.extname(file).toLowerCase();
}

async function removeAndMkdir(dir) {
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
}

function runUnzip(zipFile, outDir) {
  execFileSync('bsdtar', ['-xf', zipFile, '-C', outDir], { stdio: 'inherit' });
}

function runMagick(input, output, maxDim, quality) {
  const resize = `${maxDim}x${maxDim}>`;
  execFileSync('magick', [
    input,
    '-auto-orient',
    '-strip',
    '-resize',
    resize,
    '-quality',
    String(quality),
    output,
  ], { stdio: 'inherit' });
}

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function main() {
  const archives = (await fs.readdir(ROOT))
    .filter((name) => name.toLowerCase().endsWith('.zip'))
    .sort();

  if (!archives.length) {
    console.error('No zip archives found at repository root.');
    process.exit(1);
  }

  await removeAndMkdir(TMP_SOURCE);
  await fs.mkdir(ARCHIVE_ROOT, { recursive: true });

  console.log(`Extracting ${archives.length} archive(s) to ${TMP_SOURCE}`);
  for (const archive of archives) {
    const outDir = path.join(ARCHIVE_ROOT, archive.replace(/\.zip$/i, ''));
    await fs.mkdir(outDir, { recursive: true });
    runUnzip(path.join(ROOT, archive), outDir);
  }

  const sourceFiles = (await walk(TMP_SOURCE)).filter((file) => IMAGE_EXTS.has(ext(file)));
  const sourceByStem = new Map();
  for (const file of sourceFiles) {
    const key = stem(file).toLowerCase();
    const size = (await fs.stat(file)).size;
    const current = sourceByStem.get(key);
    if (!current || size > current.size) {
      sourceByStem.set(key, { file, size });
    }
  }

  const targetFiles = [];
  for (const dir of TARGET_DIRS) {
    try {
      for (const file of await walk(path.join(ROOT, dir))) {
        if (IMAGE_EXTS.has(ext(file))) targetFiles.push(file);
      }
    } catch {
      // Directory may be absent if a variant has not been built yet.
    }
  }

  const uniqueTargets = [...new Set(targetFiles.map((file) => path.relative(ROOT, file).replace(/^assets-(mobile|web)\//, '')))].sort();
  console.log(`Building ${uniqueTargets.length} responsive image(s)`);

  for (const subpath of uniqueTargets) {
    const base = path.basename(subpath);
    const targetStem = stem(base).toLowerCase();
    const source = sourceByStem.get(targetStem)?.file
      || (await fs.access(path.join(ROOT, 'assets-web', subpath)).then(() => path.join(ROOT, 'assets-web', subpath)).catch(() => null))
      || (await fs.access(path.join(ROOT, 'assets-mobile', subpath)).then(() => path.join(ROOT, 'assets-mobile', subpath)).catch(() => null));

    if (!source) {
      throw new Error(`No source file found for ${subpath}`);
    }

    for (const variant of ['assets-mobile', 'assets-tablet', 'assets-web']) {
      const { maxDim, quality } = SIZES[variant];
      const outPath = path.join(ROOT, variant, subpath);
      await ensureDir(outPath);

      try {
        runMagick(source, outPath, maxDim, quality);
      } catch (err) {
        throw new Error(`Failed to build ${path.join(variant, subpath)} from ${path.relative(ROOT, source)}: ${err.message}`);
      }
    }
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
