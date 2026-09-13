import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const WEBP_QUALITY = 78;
const MAX_WIDTH = 1920;

const OPT_DIR = path.join(ROOT, "public/images/_optimized");

async function reoptimize(filePath, relName) {
  if (!fs.existsSync(filePath)) return;
  const beforeKB = Math.round(fs.statSync(filePath).size / 1024);
  const destPath = path.join(OPT_DIR, relName);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });

  await sharp(filePath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(destPath);

  const afterKB = Math.round(fs.statSync(destPath).size / 1024);
  const savings = Math.round((1 - afterKB / beforeKB) * 100);
  console.log(path.basename(filePath).padEnd(32) + " " + beforeKB + "KB -> " + afterKB + "KB (-" + savings + "%)");
}

async function convert(src, relName) {
  if (!fs.existsSync(src)) {
    console.warn("Fuente no encontrada: " + src);
    return;
  }
  const destPath = path.join(OPT_DIR, relName);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  const beforeKB = Math.round(fs.statSync(src).size / 1024);

  await sharp(src)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(destPath);

  const afterKB = Math.round(fs.statSync(destPath).size / 1024);
  const savings = Math.round((1 - afterKB / beforeKB) * 100);
  console.log("NUEVO " + path.basename(src).padEnd(26) + " -> " + relName.padEnd(30) + " (" + beforeKB + "KB -> " + afterKB + "KB, -" + savings + "%)");
}

async function main() {
  // Limpiar carpeta de optimizados si existe
  if (fs.existsSync(OPT_DIR)) {
    fs.rmSync(OPT_DIR, { recursive: true });
  }
  fs.mkdirSync(OPT_DIR, { recursive: true });

  console.log("Reoptimizando imagenes WebP a carpeta temporal...\n");

  const dirs = ["inti", "killa", "exterior", "quincho", "vistas", "deptos"];
  for (const sub of dirs) {
    const dir = path.join(ROOT, "public/images", sub);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".webp"));
    for (const file of files) {
      await reoptimize(path.join(dir, file), sub + "/" + file);
    }
  }

  // logo
  await reoptimize(path.join(ROOT, "public/images/logo.webp"), "logo.webp");

  // Nueva imagen hero
  console.log("\nConvirtiendo kuki home.jpeg como hero.webp...");
  await convert(path.join(ROOT, "Imagenes/kuki home.jpeg"), "hero.webp");

  console.log("\nListo! Archivos optimizados en: " + OPT_DIR);
  console.log("Ahora correr el script de reemplazo en PowerShell.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
