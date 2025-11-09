import fs from "fs";
import path from "path";

const assetsDir = path.join(process.cwd(), "public", "assets");
const dataPath = path.join(process.cwd(), "src", "data", "projects.json");

const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif"];

function isImage(file) {
  return IMAGE_EXTS.includes(path.extname(file).toLowerCase());
}

function run() {
  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  const projects = data.projects.map((proj) => {
    const folder = path.join(assetsDir, proj.slug);
    const gallery = [];

    if (fs.existsSync(folder)) {
      const files = fs.readdirSync(folder);
      for (const f of files) {
        if (
          isImage(f) &&
          !/^hero\./i.test(f) &&
          !/^title\./i.test(f)
        ) {
          gallery.push(`/assets/${proj.slug}/${f}`);
        }
      }
    }

    return {
      ...proj,
      media: {
        ...proj.media,
        gallery,
      },
    };
  });

  fs.writeFileSync(
    dataPath,
    JSON.stringify({ projects }, null, 2)
  );
  console.log("✅ Galleries updated in src/data/projects.json");
}

run();
