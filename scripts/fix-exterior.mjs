/**
 * fix-exterior.mjs
 * Convierte las imágenes del Exterior a WebP.
 * Nota: "1000472082.JPG" es un archivo HEIC con extensión .JPG incorrecta y está corrupto.
 * Se excluye y se usan los 5 JPEG válidos de /Imagenes/Exterior/.
 *
 * Uso: node scripts/fix-exterior.mjs
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const WEBP_QUALITY = 82;

// "1000472082.JPG" omitido — HEIC disfrazado de JPG, corrupto para Sharp
const exteriorFiles = [
  "IMG_3442.jpeg",
  "IMG_3466.jpeg",
  "IMG_3468.jpeg",
  "IMG_3496.jpeg",
  "IMG_3499.jpeg",
];

async function main() {
  const srcDir = path.join(ROOT, "Imagenes/Exterior");
  const destDir = path.join(ROOT, "public/images/exterior");
  fs.mkdirSync(destDir, { recursive: true });

  // Limpiar cualquier JPG/JPEG viejo que quedó
  if (fs.existsSync(destDir)) {
    for (const file of fs.readdirSync(destDir)) {
      if (/\.(jpe?g|jpg|png)$/i.test(file)) {
        fs.unlinkSync(path.join(destDir, file));
        console.log(`🗑️   Eliminado: ${file}`);
      }
    }
  }

  console.log("🖼️  Convirtiendo imágenes de Exterior...\n");
  for (let i = 0; i < exteriorFiles.length; i++) {
    const filename = exteriorFiles[i];
    const src = path.join(srcDir, filename);
    const dest = path.join(destDir, `exterior-${String(i + 1).padStart(2, "0")}.webp`);

    if (!fs.existsSync(src)) {
      console.warn(`⚠️  No encontrado: ${src}`);
      continue;
    }

    await sharp(src).webp({ quality: WEBP_QUALITY }).toFile(dest);
    const srcKB = Math.round(fs.statSync(src).size / 1024);
    const destKB = Math.round(fs.statSync(dest).size / 1024);
    const savings = Math.round((1 - destKB / srcKB) * 100);
    console.log(`✅  ${filename.padEnd(30)} → exterior-${String(i + 1).padStart(2, "0")}.webp (${srcKB}KB → ${destKB}KB, -${savings}%)`);
  }

  console.log("\n✨ Exterior completado.");
  console.log("\n⚠️  NOTA: '1000472082.JPG' fue excluida — es un archivo HEIC disfrazado de JPG.");
  console.log("   Si querés incluirla, abrila en el teléfono y guardala como JPEG real.");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
