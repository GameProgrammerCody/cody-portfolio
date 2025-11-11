import sharp from "sharp";
import { globSync } from "glob";
import path from "path";
import fs from "fs";

const images = globSync("public/assets/**/*.{png,jpg,jpeg}", { nocase: true });

console.log(`🧠 Found ${images.length} source images...`);

for (const file of images) {
    const ext = path.extname(file);
    const base = file.slice(0, -ext.length);

    const webpPath = `${base}.webp`;
    const avifPath = `${base}.avif`;

    try {
        // Skip if WebP already exists
        if (!fs.existsSync(webpPath)) {
            await sharp(file)
                .toFormat("webp", { quality: 80 })
                .toFile(webpPath);
            console.log(`✅ Created WebP → ${path.basename(webpPath)}`);
        } else {
            console.log(`⚡ Skipped (already exists) → ${path.basename(webpPath)}`);
        }

        // Skip if AVIF already exists
        if (!fs.existsSync(avifPath)) {
            await sharp(file)
                .toFormat("avif", { quality: 70 })
                .toFile(avifPath);
            console.log(`✅ Created AVIF → ${path.basename(avifPath)}`);
        } else {
            console.log(`⚡ Skipped (already exists) → ${path.basename(avifPath)}`);
        }
    } catch (err) {
        console.error(`❌ Failed to process ${file}`, err.message);
    }
}

console.log("\n🎉 All conversions complete!");
