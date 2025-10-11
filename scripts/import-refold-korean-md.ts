import * as fs from "fs";
import * as path from "path";
import mongoose from "mongoose";
import crypto from "crypto";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/vynsera";
if (!MONGODB_URI) throw new Error("Please define the MONGODB_URI environment variable");

const filePath = path.join(process.cwd(), "src", "data", "refold_korean_resources.json");
if (!fs.existsSync(filePath)) {
  console.error(`Missing ${filePath}`);
  process.exit(1);
}

const raw: Array<any> = JSON.parse(fs.readFileSync(filePath, "utf-8"));

const ResourceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    titleKorean: String,
    description: { type: String, required: true },
    descriptionKorean: String,
    image: { type: String, required: true },
    link: { type: String, required: true, unique: true },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
    category: { type: String, required: true },
    tags: [String],
    rating: { type: Number, required: true, min: 0, max: 5 },
    isFree: { type: Boolean, required: true },
    language: { type: String, required: true },
    features: [String],
  },
  { timestamps: true }
);

const Resource = mongoose.models.Resource || mongoose.model("Resource", ResourceSchema);

function stripMarkdownMarkers(s: string) {
  if (!s) return s;
  return s.replace(/\*\*/g, "").replace(/\{#.*\}/g, "").trim();
}

function normalizeUrl(u: string) {
  if (!u) return u;
  let s = u.trim();
  if (s.startsWith("(") && s.endsWith(")")) s = s.slice(1, -1).trim();
  s = s.replace(/[)\].,;]+$/g, "");
  return s;
}

function kebabCase(input: string) {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
  );
}

function generateIdFromLink(link: string) {
  const hash = crypto.createHash("sha1").update(link).digest("hex");
  return `ref_${hash.slice(0, 12)}`;
}

function makeUniqueSlug(title: string, link: string) {
  const base = kebabCase(title || "");
  const hash = crypto.createHash("sha1").update(link).digest("hex");
  const suffix = hash.slice(0, 6);
  return (base ? `${base}-${suffix}` : `resource-${suffix}`);
}

function defaultImageForCategory(category: string) {
  return `https://via.placeholder.com/300x200?text=${encodeURIComponent(category)}`;
}

function extractTitle(text: string, url: string) {
  if (!text) return url;
  const m = text.match(/\[([^\]]+)\]\(/);
  if (m) return m[1];
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch (e) {
    return url;
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");

  const docs = raw.map((item) => {
    const url = normalizeUrl(item.url || "");
    const category = stripMarkdownMarkers(item.section || item.subsection || "Refold Korean");
    const title = extractTitle(item.text || "", url || "");
  const id = generateIdFromLink(url || "");
  const slug = makeUniqueSlug(title || id, url || "");
    return {
      id,
      slug,
      title: title || url,
      description: item.text || title || url,
      image: defaultImageForCategory(category),
      link: url,
      level: "Beginner",
      category,
      tags: [],
      rating: 0,
      isFree: true,
      language: "English",
      features: [],
    };
  }).filter(d=>d.link);

  console.log(`Prepared ${docs.length} resource docs for upsert`);

  if (dryRun) {
    console.log(JSON.stringify(docs.slice(0, 10), null, 2));
    process.exit(0);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");

  try {
    const operations = docs.map((d) => ({
      updateOne: {
        filter: { link: d.link },
        update: {
          $set: {
            title: d.title,
            description: d.description,
            image: d.image,
            level: d.level,
            category: d.category,
            tags: d.tags,
            rating: d.rating,
            isFree: d.isFree,
            language: d.language,
            features: d.features,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            id: d.id,
            slug: d.slug,
            createdAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

    console.log(`Running bulkWrite for ${operations.length} operations...`);
    const res = await Resource.bulkWrite(operations, { ordered: false });
  console.log("Bulk write complete:", res);
  } catch (err: any) {
    console.error("Error during bulk upsert:", err.message || err);
  } finally {
    await mongoose.connection.close();
    console.log("Connection closed.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
