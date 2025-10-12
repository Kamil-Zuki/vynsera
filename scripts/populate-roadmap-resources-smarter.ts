import * as fs from "fs";
import * as path from "path";
import mongoose from "mongoose";
import ResourceModel from "../src/models/Resource";
import RoadmapModel from "../src/models/Roadmap";
import { computeTfIdfIndex, scoreStepResourceTfIdf, tokenize, ResourceForScoring } from './lib/tfidf';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/vynsera";

// TF-IDF helpers are provided by scripts/lib/tfidf.ts

async function main() {
  const argv = process.argv.slice(2);
  const apply = argv.includes("--apply");
  const phraseBonusArg = argv.find((a) => a.startsWith("--phrase-bonus="));
  const ratingBoostArg = argv.find((a) => a.startsWith("--rating-boost="));
  const efficiencyArg = argv.find((a) => a.startsWith("--efficiency-weight="));
  const phraseBonus = phraseBonusArg ? Number(phraseBonusArg.split("=")[1]) : 3;
  const ratingBoostScale = ratingBoostArg ? Number(ratingBoostArg.split("=")[1]) : 4;
  const efficiencyWeight = efficiencyArg ? Number(efficiencyArg.split("=")[1]) : 0;

  const roadmapPath = path.join(process.cwd(), "src", "data", "roadmap.json");
  const suggestedPath = path.join(process.cwd(), "src", "data", "roadmap-suggested-resources.json");
  const overridesPath = path.join(process.cwd(), "src", "data", "roadmap-overrides.json");
  const csvOut = path.join(process.cwd(), "scripts", "roadmap_resource_mapping.csv");

  if (!fs.existsSync(roadmapPath)) {
    console.error("Missing roadmap.json");
    process.exit(1);
  }

  const roadmap = JSON.parse(fs.readFileSync(roadmapPath, "utf-8"));

  await mongoose.connect(MONGODB_URI);
  const rawResources = (await ResourceModel.find({}).lean()) as unknown;
  const resources = ((rawResources as any[]) || []).map((r) => ({
    id: r.id || (r._id ? String(r._id) : undefined),
    title: r.title,
    description: r.description,
    tags: r.tags,
    rating: r.rating,
    efficiency: r.efficiency,
    link: r.link,
  })) as ResourceForScoring[];
  console.log(`Loaded ${resources.length} resources from DB`);

  const suggestions: Record<string, string[]> = {};

  // Build resource lookup by id
  const resourceById = new Map(resources.map((r) => [r.id, r]));

  // Build TF-IDF index
  const { idf } = computeTfIdfIndex(resources);

  for (const step of roadmap.steps) {
    const stepTokens = tokenize(`${step.title} ${step.description} ${step.skills?.join(" ") || ""}`);

    const scored = resources.map((r) => {
      const s = scoreStepResourceTfIdf(stepTokens, r, idf as Map<string, number>, phraseBonus, ratingBoostScale, efficiencyWeight);
      return { r, score: s.score, meta: s };
    });

    scored.sort((a, b) => b.score - a.score);

    const top = scored.filter((x) => x.score > 0).slice(0, 12).map((x) => x.r.id);
    suggestions[step.id] = top;
  }

  // Write suggested JSON for manual review
  fs.writeFileSync(suggestedPath, JSON.stringify(suggestions, null, 2), "utf-8");
  console.log(`Wrote suggested mapping to ${suggestedPath}`);

  // Ensure overrides file exists
  if (!fs.existsSync(overridesPath)) {
    fs.writeFileSync(overridesPath, JSON.stringify({}, null, 2), "utf-8");
    console.log(`Created empty overrides file at ${overridesPath}`);
  }

  // Create CSV
  const csvLines: string[] = [];
  csvLines.push(["stepId", "stepTitle", "resourceId", "resourceTitle", "resourceLink", "score"].join(","));
  for (const step of roadmap.steps) {
    const tops = suggestions[step.id] || [];
    for (const rid of tops) {
      const r = resourceById.get(rid);
      if (!r) continue;
  // compute score again for CSV using TF-IDF scorer
  const stepTokens = tokenize(`${step.title} ${step.description} ${step.skills?.join(" ") || ""}`);
  const s = scoreStepResourceTfIdf(stepTokens, r, idf, phraseBonus, ratingBoostScale, efficiencyWeight);
  csvLines.push([step.id, JSON.stringify(step.title), rid, JSON.stringify(r.title), r.link, String(s.score)].join(","));
    }
  }
  fs.writeFileSync(csvOut, csvLines.join("\n"), "utf-8");
  console.log(`Wrote CSV mapping to ${csvOut}`);

  if (apply) {
    // If --apply, use suggested mapping as final (merging with overrides if present)
    const overrides = JSON.parse(fs.readFileSync(overridesPath, "utf-8") || "{}");
    for (const step of roadmap.steps) {
      let final: string[] = suggestions[step.id] || [];
      const override = overrides[step.id];
      if (override) {
        if (Array.isArray(override)) {
          final = override; // replace
        } else if (override && override.mode === "append" && Array.isArray(override.resources)) {
          final = Array.from(new Set([...override.resources, ...final]));
        } else if (override && override.mode === "replace" && Array.isArray(override.resources)) {
          final = override.resources;
        }
      }
      step.resources = final;
    }

    // Upsert roadmap
    const filter = { id: roadmap.id };
    const update = { $set: { ...roadmap, updatedAt: new Date() } };
      const res = await RoadmapModel.updateOne(filter, update, { upsert: true });
    console.log("Applied mapping and upserted roadmap:", res);
  }

  await mongoose.connection.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
