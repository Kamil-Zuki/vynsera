import mongoose from 'mongoose';
import ResourceModel from '../src/models/Resource';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vynsera';

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB');

  // Recreate text index on Resource collection (drop existing text indexes first)
  const coll = ResourceModel.collection;
  const indexes = await coll.indexes();
  for (const idx of indexes) {
    if (idx.key && Object.values(idx.key).includes('text')) {
      try {
        if (idx.name) {
          await coll.dropIndex(idx.name);
          console.log('Dropped index', idx.name);
        }
      } catch (e) {
        // ignore
      }
    }
  }

  // Now update resources safely without language override enforcement
  const toFix = await ResourceModel.find({ $or: [{ language: 'none' }, { languageLabel: { $exists: true } }] });
  console.log('Found', toFix.length, 'resources to fix');
  for (const r of toFix) {
    r.language = 'Korean';
    // avoid setting languageLabel to bypass MongoDB language override issues
    if (r.languageLabel) delete (r as any).languageLabel;
    await r.save();
    console.log('Fixed', r.id);
  }

  // Done: we dropped existing text indexes and updated documents. Recreating the text index can be
  // done manually later to avoid server language-override issues.
  console.log('Dropped text indexes and updated resource language fields. Skipping index recreation.');

  await mongoose.connection.close();
}

main().catch(e => { console.error(e); process.exit(1); });
