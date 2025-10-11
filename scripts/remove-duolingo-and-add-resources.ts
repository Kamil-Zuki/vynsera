import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import ResourceModel from "../src/models/Resource";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/vynsera";

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

async function main() {
  await mongoose.connect(MONGODB_URI);

  // Remove resources with 'duolingo' in id or slug or title
  const duolingoResources = await ResourceModel.find({ $or: [ { id: /duolingo/i }, { title: /duolingo/i }, { slug: /duolingo/i } ] }).lean();
  const duolingoIds = duolingoResources.map((r: any) => r.id);
  if (duolingoIds.length) {
    console.log('Removing Duolingo resources:', duolingoIds);
    await ResourceModel.deleteMany({ id: { $in: duolingoIds } });
  } else {
    console.log('No Duolingo resources found in DB');
  }

  const dataDir = path.join(process.cwd(), 'src', 'data');
  const suggestedPath = path.join(dataDir, 'roadmap-suggested-resources.json');
  const overridesPath = path.join(dataDir, 'roadmap-overrides.json');

  if (fs.existsSync(suggestedPath)) {
    const suggested = JSON.parse(fs.readFileSync(suggestedPath, 'utf-8'));
    for (const k of Object.keys(suggested)) {
      suggested[k] = (suggested[k] || []).filter((id: string) => !/duolingo/i.test(id));
    }
    fs.writeFileSync(suggestedPath, JSON.stringify(suggested, null, 2), 'utf-8');
    console.log('Cleaned duolingo ids from', suggestedPath);
  }

  if (fs.existsSync(overridesPath)) {
    const overrides = JSON.parse(fs.readFileSync(overridesPath, 'utf-8'));
    for (const k of Object.keys(overrides)) {
      const v = overrides[k];
      if (Array.isArray(v)) overrides[k] = v.filter((id: string) => !/duolingo/i.test(id));
    }
    fs.writeFileSync(overridesPath, JSON.stringify(overrides, null, 2), 'utf-8');
    console.log('Cleaned duolingo ids from', overridesPath);
  }

  // Insert curated YouTube and TTMIK resources
  const newResources = [
    {
      id: 'ttmik_start',
      slug: 'ttmik-start',
      title: 'Talk To Me In Korean - Korean Lessons for Absolute Beginners',
      titleKorean: 'Talk To Me In Korean - Beginners',
      description: 'TTMIK lessons and podcasts designed for beginners.',
      link: 'https://www.youtube.com/c/officialttmik',
      image: '/images/resources/ttmik.png',
      rating: 4.6,
      efficiency: 0.9,
      tags: ['audio', 'podcast', 'beginner', 'ttmik'],
  language: 'none',
  languageLabel: 'Korean',
      isFree: true,
      category: 'audio',
  level: 'Beginner'
    },
    {
      id: 'koreanclass101',
      slug: 'koreanclass101-youtube',
      title: 'KoreanClass101 - YouTube Channel',
      titleKorean: 'KoreanClass101',
      description: 'Short video lessons and vocabulary guides.',
      link: 'https://www.youtube.com/user/KoreanClass101',
      image: '/images/resources/koreanclass101.png',
      rating: 4.2,
      efficiency: 0.7,
      tags: ['video', 'vocab', 'grammar'],
  language: 'none',
  languageLabel: 'Korean',
      isFree: true,
      category: 'video',
  level: 'Beginner'
    },
    {
      id: 'koreanunnie_videos',
      slug: 'koreanunnie-youtube',
      title: 'Korean Unnie - YouTube',
      description: 'Conversational Korean, phrases and cultural tips.',
      link: 'https://www.youtube.com/c/KoreanUnnie',
      image: '/images/resources/koreanunnie.png',
      rating: 4.4,
      efficiency: 0.8,
      tags: ['video', 'conversation', 'phrases'],
  language: 'none',
  languageLabel: 'Korean',
      isFree: true,
      category: 'video',
  level: 'Beginner'
    },
    {
      id: 'korean_godmic',
      slug: 'godmic-youtube',
      title: 'Korean Grammar - 설명 영상 (selected playlist)',
      description: 'Short grammar explanation videos.',
      link: 'https://www.youtube.com/playlist?list=PL...',
      image: '/images/resources/youtube.png',
      rating: 4.0,
      efficiency: 0.65,
      tags: ['video', 'grammar'],
  language: 'none',
  languageLabel: 'Korean',
      isFree: true,
      category: 'video',
  level: 'Intermediate'
    }
  ];

  for (const nr of newResources) {
    const exists = await ResourceModel.findOne({ id: nr.id }).lean();
    if (exists) {
      console.log('Resource exists, skipping insert:', nr.id);
      continue;
    }
    await ResourceModel.create({ ...nr, createdAt: new Date(), updatedAt: new Date() } as any);
    console.log('Inserted resource', nr.id);
  }

  await mongoose.connection.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
