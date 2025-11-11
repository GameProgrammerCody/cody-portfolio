import sharp from "sharp";
import { globSync } from "glob";
import path from "path";
import fs from "fs";

const images = globSync("public/assets/**/*.{png,jpg,jpeg}", { nocase: true });

console.log(`🧠 Found ${images.length} source images...`);

for (const file of images) {
    const ext = path.extname(file);
    const base = file.slice(0, -ext.length);
    const variants = [
        { suffix: "", width: null },      // full-size
        { suffix: "@1200", width: 1200 }, // large desktop
        { suffix: "@600", width: 600 },   // mobile/tablet
    ];

    for (const { suffix, width } of variants) {
        const webpPath = `${base}${suffix}.webp`;
        const avifPath = `${base}${suffix}.avif`;

        try {
            const img = sharp(file);
            if (width) img.resize({ width, withoutEnlargement: true });

            // --- WebP ---
            if (!fs.existsSync(webpPath)) {
                await img.clone().toFormat("webp", { quality: 80 }).toFile(webpPath);
                console.log(`✅ WebP → ${path.basename(webpPath)}`);
            } else {
                console.log(`⚡ Skipped (exists) → ${path.basename(webpPath)}`);
            }

            // --- AVIF ---
            if (!fs.existsSync(avifPath)) {
                await img.clone().toFormat("avif", { quality: 70 }).toFile(avifPath);
                console.log(`✅ AVIF → ${path.basename(avifPath)}`);
            } else {
                console.log(`⚡ Skipped (exists) → ${path.basename(avifPath)}`);
            }
        } catch (err) {
            console.error(`❌ Failed to process ${file}`, err.message);
        }
    }
}

console.log("\n🎉 All responsive conversions complete!");
