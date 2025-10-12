import { tokenize, computeTfIdfIndex, scoreStepResourceTfIdf } from '../scripts/lib/tfidf';

function assert(condition: boolean, msg?: string) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

// Tiny tests
(() => {
  const tokens = tokenize('Hello 안녕 world');
  assert(tokens.includes('hello'));
  assert(tokens.includes('안녕'));

  const resources = [
    { id: 'r1', title: 'Basic greetings', description: 'hello world', tags: ['greeting'], rating: 4.5 },
    { id: 'r2', title: 'Advanced grammar', description: 'complex structures', tags: ['grammar'], rating: 4.0 },
  ];
  const { idf } = computeTfIdfIndex(resources as any);
  const stepTokens = tokenize('greetings hello');
  const scored = scoreStepResourceTfIdf(stepTokens, resources[0] as any, idf as any);
  assert(scored.score > 0, 'Expected positive score for relevant resource');

  console.log('tfidf helpers basic tests passed');
})();
