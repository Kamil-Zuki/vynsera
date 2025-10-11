import * as fs from "fs";
import * as path from "path";

const filePath = path.join(process.cwd(), "src", "data", "refold_korean_resources.json");
if (!fs.existsSync(filePath)) {
  console.error(`Missing ${filePath}`);
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));

function normalizeUrl(u: string) {
  if (!u) return u;
  let s = u.trim();
  // Remove surrounding parentheses if the url is wrapped like (https://...)
  if (s.startsWith("(") && s.endsWith(")")) s = s.slice(1, -1).trim();
  // Trim trailing punctuation commonly captured: ), ., ]
  s = s.replace(/[)\].,;]+$/g, "");
  // Fix accidental trailing markdown parentheses leftover like 'https://... )'
  s = s.replace(/\s+$/g,"");
  return s;
}

const seen = new Set<string>();
const cleaned: any[] = [];

for (const item of raw) {
  const url = normalizeUrl(item.url || "");
  if (!url) continue;
  if (seen.has(url)) continue;
  seen.add(url);
  const out = { ...item, url };
  cleaned.push(out);
}

fs.writeFileSync(filePath, JSON.stringify(cleaned, null, 2), "utf-8");
console.log(`Wrote ${cleaned.length} cleaned unique URLs to ${filePath}`);
