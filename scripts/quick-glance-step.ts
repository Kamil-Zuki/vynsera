import * as fs from "fs";
import * as path from "path";
import mongoose from "mongoose";
import ResourceModel from "../src/models/Resource";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/vynsera";

function tokenize(s: string) {
  if (!s) return [];
  return Array.from(new Set((s || "").toLowerCase().match(/[a-z0-9\u3130-\u318F\uAC00-\uD7AF]+/gi) || [])).filter(Boolean);
}

function computeTfIdfIndex(resources: any[]) {
  const df = new Map<string, number>();
  for (const r of resources) {
    const tokens = tokenize(`${r.title || ""} ${r.description || ""} ${r.tags?.join(" ") || ""}`);
    const uniq = new Set(tokens);
    for (const t of uniq) df.set(t, (df.get(t) || 0) + 1);
  }
  const N = resources.length;
  const idf = new Map<string, number>();
  for (const [t, count] of df.entries()) {
    idf.set(t, Math.log(1 + N / (1 + count)));
  }
  return { idf };
}

function scoreStepResourceTfIdf(stepTokens: string[], resource: any, idf: Map<string, number>, phraseBonus = 3, ratingBoostScale = 4) {
  const rTokens = tokenize(`${resource.title || ""} ${resource.description || ""} ${resource.tags?.join(" ") || ""}`);
  const tf = new Map<string, number>();
  for (const t of rTokens) tf.set(t, (tf.get(t) || 0) + 1);

  let tfidfScore = 0;
  for (const t of stepTokens) {
    const termFreq = tf.get(t) || 0;
    const idfVal = idf.get(t) || 0;
    tfidfScore += termFreq * idfVal;
  }

  const ratingBoost = (resource.rating || 0) / 5; // 0..1
  const stepPhrase = stepTokens.join(" ");
  const titleStr = (resource.title || "").toLowerCase();
  const exactPhraseBonus = titleStr.includes(stepPhrase) ? phraseBonus : 0;

  const score = tfidfScore * 10 + ratingBoost * ratingBoostScale + exactPhraseBonus;
  return { score, tfidfScore, ratingBoost, exactPhraseBonus };
}

async function main() {
  const argv = process.argv.slice(2);
  const stepId = argv[0];

  const roadmapPath = path.join(process.cwd(), "src", "data", "roadmap.json");
  if (!fs.existsSync(roadmapPath)) {
    console.error("Missing roadmap.json");
    process.exit(1);
  }
  const roadmap = JSON.parse(fs.readFileSync(roadmapPath, "utf-8"));

  await mongoose.connect(MONGODB_URI);
  const resources = await ResourceModel.find({}).lean();
  console.log(`Loaded ${resources.length} resources from DB`);

  const { idf } = computeTfIdfIndex(resources);

  const step = stepId ? roadmap.steps.find((s: any) => s.id === stepId) : roadmap.steps[0];
  if (!step) {
    console.error("Step not found");
    process.exit(1);
  }

  const stepTokens = tokenize(`${step.title} ${step.description} ${step.skills?.join(" ") || ""}`);
  const scored = resources.map((r: any) => {
    const s = scoreStepResourceTfIdf(stepTokens, r, idf);
    return { id: r.id, title: r.title, link: r.link, score: s.score, meta: s };
  });

  scored.sort((a: any, b: any) => b.score - a.score);
  const top3 = scored.slice(0, 3);

  console.log(`Top 3 for step ${step.id} — ${step.title}:`);
  for (const t of top3) {
    console.log(`- ${t.title} (${t.id})`);
    console.log(`  link: ${t.link}`);
    console.log(`  score: ${t.score.toFixed(3)} (tfidf=${t.meta.tfidfScore.toFixed(3)}, ratingBoost=${t.meta.ratingBoost.toFixed(3)}, phraseBonus=${t.meta.exactPhraseBonus})`);
  }

  await mongoose.connection.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
