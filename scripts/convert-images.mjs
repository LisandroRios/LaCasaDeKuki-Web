/**
 * convert-images.mjs
 * Convierte todas las imágenes de /Imagenes/ a WebP optimizado
 * y las guarda en /public/images/ con nombres descriptivos.
 *
 * Uso: node scripts/convert-images.mjs
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const WEBP_QUALITY = 82;

/**
 * Mapeo: origen -> destino
 * Cada entrada define qué archivos fuente mapean a qué nombre WebP de salida.
 */
const conversions = [
  // ── HERO ────────────────────────────────────────────────────────────────
  {
    src: path.join(ROOT, "public/images/hero.png"),
    dest: path.join(ROOT, "public/images/hero.webp"),
  },
  // ── LOGO ────────────────────────────────────────────────────────────────
  {
    src: path.join(ROOT, "public/images/logo.png"),
    dest: path.join(ROOT, "public/images/logo.webp"),
  },
  // ── INTI (10 imágenes PNG desde /public/images/inti/) ───────────────────
  ...["IMG_3150","IMG_3151","IMG_3152","IMG_3153","IMG_3154",
      "IMG_3155","IMG_3156","IMG_3157","IMG_3158","IMG_3159"].map((name, i) => ({
    src: path.join(ROOT, `public/images/inti/${name}.PNG`),
    dest: path.join(ROOT, `public/images/inti/inti-${String(i + 1).padStart(2, "0")}.webp`),
  })),
  // ── KILLA (10 imágenes JPEG desde /Imagenes/Departamento Killa/) ─────────
  ...["IMG_3387","IMG_3399","IMG_3402","IMG_3406","IMG_3407",
      "IMG_3420","IMG_3433","IMG_3436","IMG_3441","IMG_3442"].map((name, i) => ({
    src: path.join(ROOT, `Imagenes/Departamento Killa/${name}.jpeg`),
    dest: path.join(ROOT, `public/images/killa/killa-${String(i + 1).padStart(2, "0")}.webp`),
  })),
  // ── EXTERIOR (6 imágenes JPEG desde /Imagenes/Exterior/) ─────────────────
  ...["1000472082","IMG_3442","IMG_3466","IMG_3468","IMG_3496","IMG_3499"].map((name, i) => ({
    src: path.join(ROOT, `Imagenes/Exterior/${name}${name === "1000472082" ? ".JPG" : ".jpeg"}`),
    dest: path.join(ROOT, `public/images/exterior/exterior-${String(i + 1).padStart(2, "0")}.webp`),
  })),
  // ── QUINCHO (4 imágenes JPEG desde /Imagenes/Quincho/) ───────────────────
  ...["IMG_3474","IMG_3478","IMG_3479","IMG_3497"].map((name, i) => ({
    src: path.join(ROOT, `Imagenes/Quincho/${name}.jpeg`),
    dest: path.join(ROOT, `public/images/quincho/quincho-${String(i + 1).padStart(2, "0")}.webp`),
  })),
];

async function convert({ src, dest }) {
  if (!fs.existsSync(src)) {
    console.warn(`⚠️  Fuente no encontrada, omitiendo: ${src}`);
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(src).webp({ quality: WEBP_QUALITY }).toFile(dest);
  const srcKB = Math.round(fs.statSync(src).size / 1024);
  const destKB = Math.round(fs.statSync(dest).size / 1024);
  const savings = Math.round((1 - destKB / srcKB) * 100);
  console.log(`✅  ${path.basename(src).padEnd(30)} → ${path.basename(dest).padEnd(25)} (${srcKB}KB → ${destKB}KB, -${savings}%)`);
}

/**
 * Elimina los archivos PNG/JPG viejos de /public/images/inti/ y /public/images/killa/
 * ahora que serán reemplazados por WebP.
 */
function cleanOldFiles() {
  const toClean = [
    path.join(ROOT, "public/images/inti"),
    path.join(ROOT, "public/images/killa"),
    path.join(ROOT, "public/images/exterior"),
  ];
  const extensions = [".PNG", ".JPG", ".JPEG", ".jpeg", ".jpg", ".png"];
  for (const dir of toClean) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (extensions.includes(path.extname(file))) {
        fs.unlinkSync(path.join(dir, file));
        console.log(`🗑️   Eliminado: ${path.join(dir, file)}`);
      }
    }
  }
}

async function main() {
  console.log("🖼️  Iniciando conversión a WebP...\n");
  cleanOldFiles();
  for (const conversion of conversions) {
    await convert(conversion);
  }
  console.log("\n✨ Conversión completada.");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
