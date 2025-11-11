import sharp from "sharp";
import { globSync } from "glob";
import path from "path";
import fs from "fs";

const images = globSync("public/assets/**/*.{png,jpg,jpeg}", { nocase: true });

console.log(`🧩 Found ${images.length} images to convert...`);

for (const file of images) {
  const ext = path.extname(file);
  const out = file.replace(ext, ".webp");

  try {
    const data = fs.readFileSync(file);
    await sharp(data).toFormat("webp", { quality: 80 }).toFile(out);
    console.log(`✔ Converted → ${out}`);
  } catch (err) {
    console.error(`❌ Failed: ${file}`, err.message);
  }
}

console.log("✅ All done!");
