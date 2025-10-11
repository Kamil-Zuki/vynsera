import * as fs from "fs";
import * as path from "path";

const inputPath = path.join(process.cwd(), "Refold Korean.md");
const outDir = path.join(process.cwd(), "src", "data");
const outPath = path.join(outDir, "refold_korean_resources.json");

if (!fs.existsSync(inputPath)) {
  console.error(`Missing ${inputPath}`);
  process.exit(1);
}

const md = fs.readFileSync(inputPath, "utf-8");
const lines = md.split(/\r?\n/);

let currentH2 = "";
let currentH3 = "";
const resources: Array<any> = [];

const urlRegex = /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)/g;

for (const line of lines) {
  const h2 = line.match(/^##\s+(.+)/);
  const h3 = line.match(/^###\s+(.+)/);
  if (h2) {
    currentH2 = h2[1].trim();
    currentH3 = "";
    continue;
  }
  if (h3) {
    currentH3 = h3[1].trim();
  }

  const matches = line.match(urlRegex);
  if (matches) {
    for (const url of matches) {
      resources.push({
        section: currentH2,
        subsection: currentH3,
        url,
        text: line.trim(),
      });
    }
  }
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(resources, null, 2), "utf-8");
console.log(`Wrote ${resources.length} resources to ${outPath}`);
