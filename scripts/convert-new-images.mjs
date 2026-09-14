import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const WEBP_QUALITY = 78;
const MAX_WIDTH = 1920;

async function convert(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn("No encontrado: " + src);
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const beforeKB = Math.round(fs.statSync(src).size / 1024);
  const buf = await sharp(src)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
  fs.writeFileSync(dest, buf);
  const afterKB = Math.round(fs.statSync(dest).size / 1024);
  const savings = Math.round((1 - afterKB / beforeKB) * 100);
  console.log(path.basename(src).padEnd(40) + " -> " + path.basename(dest).padEnd(25) + " (" + beforeKB + "KB -> " + afterKB + "KB, -" + savings + "%)");
}

const conversions = [
  // nosotros.jpeg -> nosotros.webp
  {
    src: path.join(ROOT, "Imagenes/nosotros.jpeg"),
    dest: path.join(ROOT, "public/images/nosotros.webp"),
  },
  // Portada del Inti -> inti-00.webp (portada especial)
  {
    src: path.join(ROOT, "Imagenes/Departamento Inti/Portada.jpeg"),
    dest: path.join(ROOT, "public/images/inti/inti-00.webp"),
  },
  // 10 imagenes con UUID del Inti -> inti-11 a inti-20
  ...[
    "08f73093-391e-414a-b2d2-2872578ee18f",
    "0be7a03f-b150-4f83-9e31-d7f5e7888785",
    "3ba5c364-6dbe-4e39-b62c-cc9bfb3adadf",
    "76b0229f-0ff5-4850-a0d6-12ddb83313f9",
    "8dcab57f-c975-4de5-b0ad-3c984193d4f9",
    "a58d1b06-5903-45c4-a907-88c3bcc5671e",
    "bf9fe8d2-9a4e-4266-9df2-7f72980c6183",
    "c0404adf-7d0a-49f8-9d6a-18395d1f77b5",
    "ea77968f-ef91-42ad-b051-3bcccf1f2e2f",
  ].map((name, i) => ({
    src: path.join(ROOT, `Imagenes/Departamento Inti/${name}.jpg`),
    dest: path.join(ROOT, `public/images/inti/inti-${String(i + 11).padStart(2, "0")}.webp`),
  })),
  // 2 nuevas imagenes de Exterior -> exterior-06, exterior-07
  {
    src: path.join(ROOT, "Imagenes/Exterior/IMG_2166.jpeg"),
    dest: path.join(ROOT, "public/images/exterior/exterior-06.webp"),
  },
  {
    src: path.join(ROOT, "Imagenes/Exterior/IMG_2168.jpeg"),
    dest: path.join(ROOT, "public/images/exterior/exterior-07.webp"),
  },
];

async function main() {
  console.log("Convirtiendo imagenes nuevas...\n");
  for (const c of conversions) {
    await convert(c.src, c.dest);
  }
  console.log("\nConversion completada!");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
