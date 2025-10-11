import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import ResourceModel from '../src/models/Resource';
import RoadmapModel from '../src/models/Roadmap';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vynsera';

async function main() {
  const argv = process.argv.slice(2);
  const apply = argv.includes('--apply');

  const mappingPath = path.join(process.cwd(), 'scripts', 'duplicate_resources_mapping_suggested.json');
  if (!fs.existsSync(mappingPath)) {
    console.error('Missing mapping file:', mappingPath);
    process.exit(1);
  }
  const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8')) as Record<string, string>;
  const dupIds = Object.keys(mapping);
  if (dupIds.length === 0) {
    console.log('No duplicates to merge');
    return;
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB');

  const report: any[] = [];

  // Roadmap updates
  const roadmap = await RoadmapModel.findOne();
  if (roadmap) {
    const roadmapClone = JSON.parse(JSON.stringify(roadmap.toObject()));
    let changed = false;
    for (const step of roadmapClone.steps) {
      const before = [...(step.resources || [])];
      const after = before.map((rid: string) => mapping[rid] || rid);
      // remove duplicates in after
      const uniqAfter = Array.from(new Set(after));
      if (uniqAfter.length !== before.length || uniqAfter.some((v, i) => v !== before[i])) {
        report.push({ collection: 'roadmap', stepId: step.id, before, after: uniqAfter });
        changed = true;
        if (apply) step.resources = uniqAfter;
      }
    }
    if (changed) {
      if (apply) {
        await RoadmapModel.updateOne({ id: roadmapClone.id }, { $set: { ...roadmapClone, updatedAt: new Date() } } as any);
        console.log('Applied roadmap updates');
      } else {
        console.log('Roadmap would be updated (dry-run)');
      }
    }
  }

  // Common user collections that might reference resource ids
  // Search and update fields in any collection that has array of resource ids: watchlists, users, etc.
  const admin = mongoose.connection.db;
  const colls = await admin.listCollections().toArray();
  for (const c of colls) {
    const name = c.name;
    // only check collections that are likely to contain resource references
    if (!['users', 'watchlists', 'resources', 'roadmaps', 'sessions', 'migrations'].includes(name)) continue;
    const coll = admin.collection(name);
    // try to find documents containing any duplicate id
    const q = { $or: dupIds.map(id => ({ resources: id })) };
    try {
      const docs = await coll.find(q).toArray();
      for (const doc of docs) {
        const before = doc.resources;
        if (!Array.isArray(before)) continue;
        const after = before.map((rid: string) => mapping[rid] || rid);
        const uniqAfter = Array.from(new Set(after));
        if (JSON.stringify(before) !== JSON.stringify(uniqAfter)) {
          report.push({ collection: name, _id: doc._id, before, after: uniqAfter });
          if (apply) {
            await coll.updateOne({ _id: doc._id }, { $set: { resources: uniqAfter } } as any);
          }
        }
      }
    } catch (e) {
      // ignore collections we can't process
    }
  }

  // If apply, delete duplicate resource docs
  if (apply) {
    const toDelete = dupIds;
    const res = await ResourceModel.deleteMany({ id: { $in: toDelete } });
    report.push({ action: 'deleted_resources', count: res.deletedCount, ids: toDelete });
    console.log('Deleted duplicate resource docs:', res.deletedCount);
  } else {
    console.log('Dry-run complete. No deletions made.');
  }

  const outPath = path.join(process.cwd(), 'scripts', apply ? 'duplicate_merge_report_applied.json' : 'duplicate_merge_report_dryrun.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log('Wrote report to', outPath);

  await mongoose.connection.close();
}

main().catch(e => { console.error(e); process.exit(1); });
