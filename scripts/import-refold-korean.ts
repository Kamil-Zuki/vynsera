import * as fs from "fs";
import * as path from "path";
import mongoose from "mongoose";

function kebabCase(input: string) {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
  );
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/vynsera";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Define minimal Resource schema used for insertion to avoid importing app models
const ResourceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    titleKorean: String,
    description: { type: String, required: true },
    descriptionKorean: String,
    image: { type: String, required: true },
    link: { type: String, required: true },
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

function parseBool(val: string | undefined) {
  if (!val) return false;
  return /yes|true/i.test(val);
}

function parseRating(val: string | undefined) {
  if (!val) return 0;
  const m = val.match(/([0-9]+(\.[0-9]+)?)/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  if (n > 5) return 5;
  return n;
}

function generateId(title: string, link: string) {
  // keep deterministic id
  return (
    kebabCase(title).replace(/-/g, "_") + "_" + Buffer.from(link).toString("base64").slice(0, 8)
  );
}

function generateSlug(title: string) {
  return kebabCase(title);
}

function defaultImageForCategory(category: string) {
  // Use a simple placeholder per category
  return `https://via.placeholder.com/300x200?text=${encodeURIComponent(category)}`;
}

function parseEntries(text: string) {
  const lines = text.split(/\r?\n/);
  const entries: Array<any> = [];
  let category = "Uncategorized";
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    const catMatch = line.match(/^##\s+(.*)/);
    if (catMatch) {
      category = catMatch[1].trim();
      i++;
      continue;
    }

    const titleMatch = line.match(/^###\s+(.*)/);
    if (titleMatch) {
      const title = titleMatch[1].trim();
      const entry: any = { category, title };
      i++;

      // Read following metadata lines until next blank or next ###/##
      while (i < lines.length) {
        const l = lines[i].trim();
        if (!l) {
          i++;
          continue;
        }
        if (/^###?\s+/.test(l)) break;

        // Match patterns like **Korean Title**: value
        const metaMatch = l.match(/^\*\*(.+?)\*\*:\s*(.*)/);
        if (metaMatch) {
          const key = metaMatch[1].trim();
          const value = metaMatch[2].trim();
          // Map known keys
          switch (key.toLowerCase()) {
            case "korean title":
              entry.titleKorean = value;
              break;
            case "description":
              entry.description = value;
              break;
            case "korean description":
              entry.descriptionKorean = value;
              break;
            case "link":
              entry.link = value;
              break;
            case "level":
              entry.level = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
              break;
            case "language":
              entry.language = value;
              break;
            case "rating":
              entry.rating = parseRating(value);
              break;
            case "free":
              entry.isFree = parseBool(value);
              break;
            case "tags":
              entry.tags = value.split(/,\s*/).map((s) => s.trim()).filter(Boolean);
              break;
            case "features":
              entry.features = value.split(/,\s*/).map((s) => s.trim()).filter(Boolean);
              break;
            default:
              // unknown meta - attach raw
              entry[key] = value;
          }
        } else {
          // accumulate as description if not a meta line
          entry.description = (entry.description ? entry.description + "\n" : "") + l;
        }
        i++;
      }

      // Post-process defaults
      entry.link = entry.link || "";
      entry.rating = typeof entry.rating === "number" ? entry.rating : 0;
      entry.isFree = typeof entry.isFree === "boolean" ? entry.isFree : true;
      entry.language = entry.language || "English";
      entry.tags = entry.tags || [];
      entry.features = entry.features || [];
      entry.image = defaultImageForCategory(category);
      entry.id = generateId(entry.title, entry.link || "");
      entry.slug = generateSlug(entry.title);

      entries.push(entry);
      continue;
    }

    i++;
  }

  return entries;
}

async function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");

  const filePath = path.join(process.cwd(), "Refold Korean.txt");
  if (!fs.existsSync(filePath)) {
    console.error(`Could not find ${filePath} in project root`);
    process.exit(1);
  }

  const text = fs.readFileSync(filePath, "utf-8");
  const entries = parseEntries(text);

  console.log(`Parsed ${entries.length} entries from Refold Korean.txt`);

  if (dryRun) {
    console.log(JSON.stringify(entries, null, 2));
    process.exit(0);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");

  try {
    // Insert with ordered=false so independent failures don't stop the batch
    const res = await Resource.insertMany(entries, { ordered: false });
    console.log(`Inserted ${res.length} documents.`);
  } catch (err: any) {
    // insertMany may throw on duplicate keys; report summary
    if (err && err.writeErrors) {
      console.warn(`Inserted with ${err.writeErrors.length} writeErrors.`);
    }
    console.error("Error inserting documents:", err.message || err);
  } finally {
    await mongoose.connection.close();
    console.log("Connection closed.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
