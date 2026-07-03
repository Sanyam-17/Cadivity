#!/usr/bin/env node

/**
 * scripts/convert-images.mjs
 *
 * Converts the hero background PNGs to WebP at quality 82,
 * resized to max 1920 px width.
 *
 * Usage:
 *   npx sharp-cli  # (not needed — we use the sharp API directly)
 *   node scripts/convert-images.mjs
 *
 * Prerequisites:
 *   pnpm add -D sharp
 */

import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import { join, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const INPUT_DIR = join(__dirname, "..", "public", "generated_images");
const MAX_WIDTH = 1920;
const WEBP_QUALITY = 82;

async function convertImage(filename) {
  const inputPath = join(INPUT_DIR, filename);
  const outputName = basename(filename, extname(filename)) + ".webp";
  const outputPath = join(INPUT_DIR, outputName);

  const inputStat = await stat(inputPath);
  const inputSizeKB = (inputStat.size / 1024).toFixed(1);

  await sharp(inputPath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(outputPath);

  const outputStat = await stat(outputPath);
  const outputSizeKB = (outputStat.size / 1024).toFixed(1);
  const saving = (((inputStat.size - outputStat.size) / inputStat.size) * 100).toFixed(1);

  console.log(
    `✅ ${filename} (${inputSizeKB} KB) → ${outputName} (${outputSizeKB} KB)  — ${saving}% smaller`
  );
}

async function main() {
  console.log(`\n🖼  Converting hero images to WebP (quality ${WEBP_QUALITY}, max ${MAX_WIDTH}px)\n`);

  const files = await readdir(INPUT_DIR);
  const pngFiles = files.filter(
    (f) => extname(f).toLowerCase() === ".png" && f.startsWith("Background_img")
  );

  if (pngFiles.length === 0) {
    console.error("❌ No Background_img*.png files found in", INPUT_DIR);
    process.exit(1);
  }

  for (const file of pngFiles) {
    await convertImage(file);
  }

  console.log("\n🎉 Done! WebP files written to public/generated_images/\n");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
