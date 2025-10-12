/**
 * Lightweight TF-IDF helpers used by the roadmap ranking script.
 */
export type ResourceForScoring = {
  id: string;
  title?: string;
  description?: string;
  tags?: string[];
  rating?: number;
  efficiency?: number;
  link?: string;
};

export function tokenize(s: string): string[] {
  if (!s) return [];
  return Array.from(new Set((s || '').toLowerCase().match(/[a-z0-9\u3130-\u318F\uAC00-\uD7AF]+/gi) || [])).filter(Boolean);
}

export function computeTfIdfIndex(resources: ResourceForScoring[]) {
  const df = new Map<string, number>();
  for (const r of resources) {
    const tokens = tokenize(`${r.title || ''} ${r.description || ''} ${r.tags?.join(' ') || ''}`);
    const uniq = new Set(tokens);
    for (const t of uniq) df.set(t, (df.get(t) || 0) + 1);
  }
  const N = resources.length;
  const idf = new Map<string, number>();
  for (const [t, count] of df.entries()) idf.set(t, Math.log(1 + N / (1 + count)));
  return { idf };
}

export function scoreStepResourceTfIdf(
  stepTokens: string[],
  resource: ResourceForScoring,
  idf: Map<string, number>,
  phraseBonus = 3,
  ratingBoostScale = 4,
  efficiencyWeight = 0
) {
  const rTokens = tokenize(`${resource.title || ''} ${resource.description || ''} ${resource.tags?.join(' ') || ''}`);
  const tf = new Map<string, number>();
  for (const t of rTokens) tf.set(t, (tf.get(t) || 0) + 1);

  let tfidfScore = 0;
  for (const t of stepTokens) {
    tfidfScore += (tf.get(t) || 0) * (idf.get(t) || 0);
  }

  const ratingBoost = (resource.rating || 0) / 5;
  const stepPhrase = stepTokens.join(' ');
  const titleStr = (resource.title || '').toLowerCase();
  const exactPhraseBonus = titleStr.includes(stepPhrase) ? phraseBonus : 0;
  const efficiencyBoost = (resource.efficiency || 0) * efficiencyWeight;

  const score = tfidfScore * 10 + ratingBoost * ratingBoostScale + exactPhraseBonus + efficiencyBoost;
  return { score, tfidfScore, ratingBoost, exactPhraseBonus, efficiencyBoost };
}
