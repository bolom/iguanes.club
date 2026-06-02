#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_URL = process.argv[2];
const OUT_DIR = process.argv[3] || 'downloads';

if (!DEFAULT_URL) {
  console.error('Usage: node download-pictime-gallery.mjs <gallery-url> [output-dir]');
  process.exit(1);
}

function parseSrcset(srcset) {
  if (!srcset) return [];
  return srcset
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [url, descriptor] = part.split(/\s+/, 2);
      const w = descriptor && descriptor.endsWith('w') ? Number.parseInt(descriptor, 10) : 0;
      const x = descriptor && descriptor.endsWith('x') ? Number.parseFloat(descriptor, 10) : 0;
      return { url, score: w || Math.round(x * 1000) || 0 };
    })
    .filter((entry) => entry.url);
}

function bestUrlFromElement(el) {
  const candidates = [];
  const src = el.getAttribute('src');
  if (src) candidates.push({ url: src, score: 1 });
  const dataSrc = el.getAttribute('data-src');
  if (dataSrc) candidates.push({ url: dataSrc, score: 2 });
  const srcset = el.getAttribute('srcset');
  if (srcset) candidates.push(...parseSrcset(srcset));
  const sizes = el.getAttribute('data-srcset');
  if (sizes) candidates.push(...parseSrcset(sizes));

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.url || null;
}

function normalizeUrl(raw, base) {
  try {
    return new URL(raw, base).href;
  } catch {
    return null;
  }
}

function filenameFromUrl(url, index) {
  try {
    const u = new URL(url);
    const base = path.basename(u.pathname).split('?')[0] || `image-${String(index + 1).padStart(4, '0')}.jpg`;
    return base.includes('.') ? base : `${base}.jpg`;
  } catch {
    return `image-${String(index + 1).padStart(4, '0')}.jpg`;
  }
}

async function main() {
  const { chromium } = await import('playwright');

  await fs.mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    acceptDownloads: false,
  });
  const page = await context.newPage();

  console.log(`Opening ${DEFAULT_URL}`);
  await page.goto(DEFAULT_URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForLoadState('networkidle', { timeout: 120000 }).catch(() => {});
  await page.waitForTimeout(3000);

  // Scroll the gallery to force lazy-loaded thumbnails to appear.
  let lastCount = 0;
  for (let i = 0; i < 40; i += 1) {
    const count = await page.locator('img').count().catch(() => 0);
    if (count === lastCount && i > 4) break;
    lastCount = count;
    await page.mouse.wheel(0, 1800);
    await page.waitForTimeout(1200);
  }

  const urls = await page.evaluate(() => {
    const out = new Set();
    const add = (raw) => {
      if (!raw) return;
      try {
        out.add(new URL(raw, location.href).href);
      } catch {
        // ignore
      }
    };

    const isProbablyImage = (u) => {
      try {
        const url = new URL(u);
        return /\.(jpe?g|png|webp|avif|gif)(\?|$)/i.test(url.pathname + url.search) ||
          url.hostname.includes('pic-time') ||
          url.hostname.includes('cloudfront') ||
          url.hostname.includes('amazonaws');
      } catch {
        return false;
      }
    };

    const pickBest = (srcset) => {
      if (!srcset) return null;
      let best = null;
      for (const part of srcset.split(',')) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        const [u, d] = trimmed.split(/\s+/, 2);
        let score = 0;
        if (d?.endsWith('w')) score = Number.parseInt(d, 10) || 0;
        else if (d?.endsWith('x')) score = Math.round((Number.parseFloat(d) || 0) * 1000);
        if (!best || score > best.score) best = { u, score };
      }
      return best?.u || null;
    };

    for (const el of document.querySelectorAll('img, source')) {
      add(el.getAttribute('src'));
      add(el.getAttribute('data-src'));
      add(el.getAttribute('data-lazy-src'));
      add(pickBest(el.getAttribute('srcset')));
      add(pickBest(el.getAttribute('data-srcset')));
    }

    for (const el of document.querySelectorAll('[style]')) {
      const bg = el.getAttribute('style') || '';
      const m = bg.match(/url\(["']?([^"')]+)["']?\)/i);
      if (m) add(m[1]);
    }

    return [...out].filter(isProbablyImage);
  });

  const unique = [...new Set(urls.map((u) => normalizeUrl(u, DEFAULT_URL)).filter(Boolean))];
  unique.sort((a, b) => a.localeCompare(b));

  console.log(`Found ${unique.length} candidate images`);
  if (!unique.length) {
    console.error('No image URLs found. The gallery may require a different extraction strategy.');
    await browser.close();
    process.exit(2);
  }

  const cookieHeader = (await context.cookies()).map((c) => `${c.name}=${c.value}`).join('; ');
  const userAgent = await page.evaluate(() => navigator.userAgent);

  let saved = 0;
  for (let i = 0; i < unique.length; i += 1) {
    const url = unique[i];
    const filename = filenameFromUrl(url, i);
    const outfile = path.join(OUT_DIR, filename);

    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': userAgent,
          cookie: cookieHeader,
          referer: DEFAULT_URL,
        },
      });
      if (!response.ok) {
        console.warn(`Skip ${url} -> HTTP ${response.status}`);
        continue;
      }
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.startsWith('image/')) {
        console.warn(`Skip ${url} -> ${contentType || 'non-image response'}`);
        continue;
      }
      const buf = Buffer.from(await response.arrayBuffer());
      await fs.writeFile(outfile, buf);
      saved += 1;
      console.log(`[${saved}/${unique.length}] ${path.basename(outfile)}`);
    } catch (err) {
      console.warn(`Skip ${url} -> ${err.message}`);
    }
  }

  await browser.close();
  console.log(`Done. Saved ${saved} file(s) to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
