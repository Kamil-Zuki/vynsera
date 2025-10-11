import mongoose from 'mongoose';
import ResourceModel from '../src/models/Resource';
import fs from 'fs';
import path from 'path';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vynsera';

function normalizeUrl(u: string) {
  if (!u) return '';
  try {
    const url = new URL(u);
    // remove query and hash, lowercase host
    return `${url.protocol}//${url.hostname}${url.pathname}`.replace(/\/\/+/, '/').toLowerCase();
  } catch (e) {
    return u.trim().toLowerCase();
  }
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  const resources = await ResourceModel.find({}).lean();
  const map = new Map<string, any[]>();
  for (const r of resources) {
    const key = normalizeUrl(r.link || r.title || r.id);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }

  const duplicates: any[] = [];
  const suggestedMapping: Record<string, string> = {};
  for (const [k, group] of map.entries()) {
    if (group.length > 1) {
      // choose canonical by highest rating, then by earliest createdAt
      group.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0) || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const canonical = group[0];
      const duplicatesList = group.map((g: any) => ({ id: g.id, title: g.title, link: g.link, rating: g.rating }));
      duplicates.push({ key: k, canonical: { id: canonical.id, title: canonical.title, link: canonical.link }, duplicates: duplicatesList });
      for (const g of group.slice(1)) {
        suggestedMapping[g.id] = canonical.id;
      }
    }
  }

  const outDir = path.join(process.cwd(), 'scripts');
  fs.writeFileSync(path.join(outDir, 'duplicate_resources_preview.json'), JSON.stringify(duplicates, null, 2), 'utf-8');
  // CSV: key, canonicalId, duplicateId, duplicateTitle, duplicateLink, duplicateRating
  const lines = ['key,canonicalId,duplicateId,duplicateTitle,duplicateLink,duplicateRating'];
  for (const d of duplicates) {
    for (const dup of d.duplicates) {
      if (dup.id === d.canonical.id) continue;
      lines.push([d.key, d.canonical.id, dup.id, JSON.stringify(dup.title), JSON.stringify(dup.link), String(dup.rating || '')].join(','));
    }
  }
  fs.writeFileSync(path.join(outDir, 'duplicate_resources_preview.csv'), lines.join('\n'), 'utf-8');
  fs.writeFileSync(path.join(outDir, 'duplicate_resources_mapping_suggested.json'), JSON.stringify(suggestedMapping, null, 2), 'utf-8');

  console.log('Wrote duplicate preview and suggested mapping to scripts/');
  await mongoose.connection.close();
}

main().catch(e => { console.error(e); process.exit(1); });
