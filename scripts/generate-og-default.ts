/**
 * One-off / CI: writes `public/og-default.png` (1200×630) for Open Graph and Twitter cards.
 * Run: `npx tsx scripts/generate-og-default.ts`
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const OUT = path.resolve('public/og-default.png');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1528"/>
      <stop offset="100%" style="stop-color:#2d2640"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <text x="600" y="270" text-anchor="middle" font-family="system-ui,sans-serif" font-size="56" font-weight="600" fill="#f4f0ff">The Nimblenomicon</text>
  <text x="600" y="340" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" fill="#b8b0c8">Nimble tabletop RPG — rules, heroes, spells &amp; tools</text>
</svg>`;

const png = await sharp(Buffer.from(svg)).png().toBuffer();
await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, png);
console.log(`Wrote ${OUT}`);
