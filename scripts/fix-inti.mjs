/**
 * fix-inti.mjs
 * Convierte las imágenes de Inti desde /Imagenes/Departamento Inti/ a WebP.
 * Se ejecuta después de convert-images.mjs porque ese script las eliminó de /public/ antes de convertir.
 *
 * Uso: node scripts/fix-inti.mjs
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const WEBP_QUALITY = 82;

const intiFiles = [
  "08f73093-391e-414a-b2d2-2872578ee18f.jpg",
  "0be7a03f-b150-4f83-9e31-d7f5e7888785.jpg",
  "3ba5c364-6dbe-4e39-b62c-cc9bfb3adadf.jpg",
  "76b0229f-0ff5-4850-a0d6-12ddb83313f9.jpg",
  "8dcab57f-c975-4de5-b0ad-3c984193d4f9.jpg",
  "a58d1b06-5903-45c4-a907-88c3bcc5671e.jpg",
  "bf9fe8d2-9a4e-4266-9df2-7f72980c6183.jpg",
  "c0404adf-7d0a-49f8-9d6a-18395d1f77b5.jpg",
  "ea77968f-ef91-42ad-b051-3bcccf1f2e2f.jpg",
  "Portada.jpeg",
];

async function main() {
  const srcDir = path.join(ROOT, "Imagenes/Departamento Inti");
  const destDir = path.join(ROOT, "public/images/inti");
  fs.mkdirSync(destDir, { recursive: true });

  console.log("🖼️  Convirtiendo imágenes de Inti...\n");
  for (let i = 0; i < intiFiles.length; i++) {
    const filename = intiFiles[i];
    const src = path.join(srcDir, filename);
    const dest = path.join(destDir, `inti-${String(i + 1).padStart(2, "0")}.webp`);

    if (!fs.existsSync(src)) {
      console.warn(`⚠️  No encontrado: ${src}`);
      continue;
    }

    await sharp(src).webp({ quality: WEBP_QUALITY }).toFile(dest);
    const srcKB = Math.round(fs.statSync(src).size / 1024);
    const destKB = Math.round(fs.statSync(dest).size / 1024);
    const savings = Math.round((1 - destKB / srcKB) * 100);
    console.log(`✅  ${filename.padEnd(50)} → inti-${String(i + 1).padStart(2, "0")}.webp (${srcKB}KB → ${destKB}KB, -${savings}%)`);
  }

  console.log("\n✨ Inti completado.");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
