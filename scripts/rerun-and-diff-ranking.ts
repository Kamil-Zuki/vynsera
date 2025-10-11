import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const root = process.cwd();
const script = path.join(root, 'scripts', 'populate-roadmap-resources-smarter.ts');
const outA = path.join(root, 'scripts', 'rank_a.csv');
const outB = path.join(root, 'scripts', 'rank_b.csv');
const diffOut = path.join(root, 'scripts', 'rank_diff.csv');

function runRank(flags: string, outCsv: string) {
  console.log('Running rank with', flags);
  execSync(`npx tsx ${script} ${flags}`, { stdio: 'inherit' });
  // copy the generated CSV
  const csv = path.join(root, 'scripts', 'roadmap_resource_mapping.csv');
  if (fs.existsSync(csv)) fs.copyFileSync(csv, outCsv);
}

function produceDiff() {
  const a = fs.readFileSync(outA, 'utf-8').split('\n').filter(Boolean);
  const b = fs.readFileSync(outB, 'utf-8').split('\n').filter(Boolean);
  const mapA = new Map<string, string[]>();
  for (const line of a.slice(1)) {
    const cols = line.split(',');
    const step = cols[0];
    const rid = cols[2];
    if (!mapA.has(step)) mapA.set(step, []);
    mapA.get(step)!.push(rid);
  }
  const mapB = new Map<string, string[]>();
  for (const line of b.slice(1)) {
    const cols = line.split(',');
    const step = cols[0];
    const rid = cols[2];
    if (!mapB.has(step)) mapB.set(step, []);
    mapB.get(step)!.push(rid);
  }

  const outLines = ['stepId,top12_a,top12_b,added,removed'];
  for (const [step, listA] of mapA.entries()) {
    const listB = mapB.get(step) || [];
    const setA = new Set(listA);
    const setB = new Set(listB);
    const added = listB.filter(x => !setA.has(x));
    const removed = listA.filter(x => !setB.has(x));
    outLines.push([step, JSON.stringify(listA.slice(0,12)), JSON.stringify(listB.slice(0,12)), JSON.stringify(added), JSON.stringify(removed)].join(','));
  }
  fs.writeFileSync(diffOut, outLines.join('\n'), 'utf-8');
  console.log('Wrote diff to', diffOut);
}

async function main() {
  // run baseline (no efficiency)
  runRank('--phrase-bonus=3 --rating-boost=4', outA);
  // run new weights (higher phrase, rating, efficiency)
  runRank('--phrase-bonus=6 --rating-boost=8 --efficiency-weight=5', outB);
  produceDiff();
}

main();
