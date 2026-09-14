// Image optimization for bundled assets. Run: node scripts/optimize-images.mjs
//
//  - exec-*.png        → same-resolution WebP (quality 92, visually lossless):
//                        the board photos keep full quality but lose ~85% weight.
//  - hero-bg.jpg       → capped at 1920px wide, JPEG q82
//  - newsletter-bg.jpg → capped at 1600px wide, JPEG q80
//  - gallery/*.jpg, about-*.jpg → recompressed q82 (dimensions unchanged)
//  - partners/*.png, mesa-logo.png → palette PNG (logos keep transparency)
//
// After running, update any imports that pointed at converted exec PNGs
// (executivePhotos.ts uses .webp). Re-runnable: files are converted in place.

import sharp from "sharp";
import { readdirSync, statSync, renameSync, unlinkSync } from "node:fs";
import { join, extname } from "node:path";

const ASSETS = new URL("../src/assets/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const kb = (p) => (statSync(p).size / 1024).toFixed(0);

async function convert(file, pipeline, outPath = file) {
  const before = kb(file);
  // sharp refuses to write over its own input — go through a temp file
  const tmp = `${outPath}.tmp`;
  await pipeline.toFile(tmp);
  if (outPath === file) unlinkSync(file);
  renameSync(tmp, outPath);
  const after = kb(outPath);
  const label = outPath === file ? file : `${file} → ${outPath}`;
  console.log(`${before.padStart(6)} KB → ${after.padStart(6)} KB  ${label}`);
}

async function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

let totalBefore = 0;
let totalAfter = 0;

// Unused files (not imported anywhere) are skipped — they don't ship in the
// production bundle. Root-level gallery-*.jpg duplicates the gallery/ folder.
const isUnused = (file, name) => {
  const inGalleryFolder = /[\\/]gallery[\\/]/.test(file);
  if (!inGalleryFolder && /^gallery-\d+\.jpg$/.test(name)) return true;
  if (/^event-(arts|cultural|movie)\.jpg$/.test(name)) return true;
  if (/^merch-(black|white)\.jpg$/.test(name)) return true;
  if (/^exec-(chairman|secretary|treasurer|vice-chair)\.jpg$/.test(name)) return true;
  return false;
};

for await (const file of walk(ASSETS)) {
  const ext = extname(file).toLowerCase();
  const name = file.split(/[\\/]/).pop();
  if (![".png", ".jpg", ".jpeg"].includes(ext)) continue;
  if (isUnused(file, name)) continue;

  if (name.startsWith("exec-") && ext === ".png") {
    // Board photos: full resolution, visually lossless WebP
    const out = file.replace(/\.png$/, ".webp");
    await convert(file, sharp(file).webp({ quality: 92, effort: 6 }), out);
    totalBefore += +kb(file);
    totalAfter += +kb(out);
  } else if (name === "hero-bg.jpg") {
    await convert(file, sharp(file).resize({ width: 1920, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }));
  } else if (name === "newsletter-bg.jpg") {
    await convert(file, sharp(file).resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }));
  } else if (ext === ".jpg" || ext === ".jpeg") {
    await convert(file, sharp(file).jpeg({ quality: 82, mozjpeg: true }));
  } else if (ext === ".png") {
    // Logos with transparency: palette PNG
    await convert(file, sharp(file).png({ palette: true, quality: 90, compressionLevel: 9 }));
  }
}

// second pass to total only files that still exist (exec pngs are superseded by webp)
console.log("\nDone. Review the changes, delete superseded originals, then update imports.");
