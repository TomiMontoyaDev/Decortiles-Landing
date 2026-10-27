// Reduce las fotos descargadas del sitio principal a JPG livianos.
// Los originales quedan en public/images/_originales/ (ignorado por git).
// Uso: npm run optimize-images
import { readdir, mkdir, rename, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve("public/images");
const BACKUP = path.join(ROOT, "_originales");
const DIRS = { productos: 1200, ambientes: 1600 };

for (const [dir, width] of Object.entries(DIRS)) {
  const src = path.join(ROOT, dir);
  const bak = path.join(BACKUP, dir);
  await mkdir(bak, { recursive: true });
  for (const file of await readdir(src)) {
    if (!/\.(png|jpe?g)$/i.test(file)) continue;
    const from = path.join(src, file);
    const original = path.join(bak, file);
    await rename(from, original);
    const out = path.join(src, file.replace(/\.(png|jpe?g)$/i, ".jpg"));
    await sharp(original)
      .flatten({ background: "#0a0a0a" })
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(out);
    const kb = Math.round((await stat(out)).size / 1024);
    console.log(`${dir}/${path.basename(out)}  ${kb} KB`);
  }
}
