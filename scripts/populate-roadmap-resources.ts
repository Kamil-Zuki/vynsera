import * as fs from "fs";
import * as path from "path";
import mongoose from "mongoose";
import connectDB from "../src/lib/mongodb";
import ResourceModel from "../src/models/Resource";
import RoadmapModel from "../src/models/Roadmap";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/vynsera";

async function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");

  // Load roadmap file
  const roadmapPath = path.join(process.cwd(), "src", "data", "roadmap.json");
  if (!fs.existsSync(roadmapPath)) {
    console.error(`Missing ${roadmapPath}`);
    process.exit(1);
  }
  const roadmap = JSON.parse(fs.readFileSync(roadmapPath, "utf-8"));

  // Connect to DB
  await mongoose.connect(MONGODB_URI);

  // Load all resources (we imported earlier)
  const resources = await ResourceModel.find({}).lean();
  console.log(`Loaded ${resources.length} resources from DB`);

  // Build simple keyword index: map lowercased token -> resource id
  const index = new Map<string, Set<string>>();
  for (const r of resources) {
    const text = `${r.title} ${r.description} ${r.tags?.join(" ") || ""} ${r.category || ""}`.toLowerCase();
    const tokens = new Set(text.match(/[a-z0-9\u3130-\u318F\uAC00-\uD7AF]+/gi) || []);
    for (const t of tokens) {
      if (!index.has(t)) index.set(t, new Set());
      index.get(t)!.add(r.id);
    }
  }

  // For each step, find resources that match any token in the step title/description
  let totalMatched = 0;
  for (const step of roadmap.steps) {
    const searchText = `${step.title} ${step.description} ${step.skills?.join(" ") || ""}`.toLowerCase();
    const tokens = new Set(searchText.match(/[a-z0-9\u3130-\u318F\uAC00-\uD7AF]+/gi) || []);
    const matched = new Set<string>();
    for (const t of tokens) {
      const hits = index.get(t);
      if (hits) for (const id of hits) matched.add(id);
    }

    // Prefer resources with same category or containing step title words in title
    const final = Array.from(matched).slice(0, 12); // limit to 12
    step.resources = final;
    totalMatched += final.length;
  }

  console.log(`Matched ${totalMatched} total resource links to roadmap steps`);

  if (dryRun) {
    console.log(JSON.stringify(roadmap.steps.map((s: any) => ({ id: s.id, resources: s.resources })), null, 2));
    await mongoose.connection.close();
    return;
  }

  // Upsert roadmap document
  const filter = { id: roadmap.id };
  const update = { $set: { ...roadmap, updatedAt: new Date() } };
  const opts = { upsert: true };
  const res = await RoadmapModel.updateOne(filter, update, opts as any);
  console.log("Roadmap upsert result:", res);

  await mongoose.connection.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
