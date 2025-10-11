import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import RoadmapModel from '../src/models/Roadmap';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vynsera';

async function main() {
  const suggestedPath = path.join(process.cwd(), 'src', 'data', 'roadmap-suggested-resources.json');
  if (!fs.existsSync(suggestedPath)) {
    console.error('Missing suggested mapping file');
    process.exit(1);
  }
  const suggested = JSON.parse(fs.readFileSync(suggestedPath, 'utf-8'));
  let changed = false;
  for (const stepId of Object.keys(suggested)) {
    const arr = suggested[stepId] || [];
    const uniq = Array.from(new Set(arr));
    if (uniq.length !== arr.length) {
      suggested[stepId] = uniq;
      changed = true;
      console.log('Deduped', stepId, 'from', arr.length, 'to', uniq.length);
    }
  }
  if (changed) {
    fs.writeFileSync(suggestedPath, JSON.stringify(suggested, null, 2), 'utf-8');
    console.log('Wrote cleaned suggested mapping');
  } else {
    console.log('No duplicates found in suggested mapping');
  }

  // Update DB roadmap to align with suggestions (if roadmap exists)
  await mongoose.connect(MONGODB_URI);
  const roadmap = await RoadmapModel.findOne().lean();
  if (!roadmap) {
    console.log('No roadmap found in DB, skipping DB update');
    await mongoose.connection.close();
    return;
  }
  const updated = { ...roadmap } as any;
  for (const step of updated.steps) {
    if (suggested[step.id]) step.resources = suggested[step.id];
  }
  await RoadmapModel.updateOne({ id: updated.id }, { $set: { ...updated, updatedAt: new Date() } } as any, { upsert: true } as any);
  console.log('Updated roadmap in DB with deduped resources');
  await mongoose.connection.close();
}

main().catch(e => { console.error(e); process.exit(1); });
