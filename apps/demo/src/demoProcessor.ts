import type { TextProcessor } from '@a11y-toolkit/reading';

function rewriteSimply(text: string): string {
  const phraseReplacements: Array<[RegExp, string]> = [
    [
      /artificial intelligence \(ai\) is a branch of computer science/gi,
      'AI is a part of computer science',
    ],
    [/accessibility toolkit reading workspace/gi, 'accessible reading area'],
    [/accessibility toolkit/gi, 'accessibility tools'],
    [/paste any text/gi, 'paste your text'],
    [/reading tools/gi, 'tools'],
    [/change how the text is displayed/gi, 'change how it looks'],
    [/enables machines to/gi, 'lets machines'],
    [/normally require/gi, 'need'],
    [/human intelligence/gi, 'human thinking'],
    [/understanding language/gi, 'understand language'],
    [/recognizing images/gi, 'recognize images'],
    [/solving problems/gi, 'solve problems'],
    [/learning from data/gi, 'learn from data'],
    [/making decisions/gi, 'make decisions'],
    [
      /instead of following only fixed instructions/gi,
      'They do not only follow fixed instructions',
    ],
    [/identify patterns/gi, 'find patterns'],
    [/improve their performance/gi, 'get better'],
    [/through experience/gi, 'with practice'],
    [/virtual assistants/gi, 'digital helpers'],
    [/recommendation systems/gi, 'suggestion systems'],
    [/facial recognition/gi, 'face recognition'],
    [/self-driving technology/gi, 'self-driving systems'],
    [/designed to assist/gi, 'made to help'],
    [/more accurate/gi, 'better'],
    [/rather than simply replacing/gi, 'not replace'],
    [/utilize/gi, 'use'],
    [/approximately/gi, 'about'],
    [/demonstrate/gi, 'show'],
    [/assistance/gi, 'help'],
    [/in order to/gi, 'to'],
    [/at this point in time/gi, 'now'],
    [/a large number of/gi, 'many'],
    [/make use of/gi, 'use'],
    [/\bhowever\b/gi, 'but'],
    [/\btherefore\b/gi, 'so'],
    [/\badditional\b/gi, 'more'],
    [/\boptions\b/gi, 'choices'],
    [/\bfeatures\b/gi, 'tools'],
    [/\bfunctionality\b/gi, 'tools'],
  ];
  let simplified = text;
  for (const [pattern, replacement] of phraseReplacements)
    simplified = simplified.replace(pattern, replacement);

  return simplified
    .replace(/\([^)]*\)/g, '')
    .replace(/,\s*(which|that|while|because)\s+[^.!?]+/gi, '.')
    .replace(/,\s*then\s+/gi, '. Then ')
    .replace(/,\s*(and|but|so)\s+/gi, '. $1 ')
    .replace(/;\s*/g, '. ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\.\s*([a-z])/g, (_, letter: string) => `. ${letter.toUpperCase()}`)
    .trim();
}

async function translateSentence(text: string, targetLanguage: string): Promise<string> {
  const parameters = new URLSearchParams({
    client: 'gtx',
    sl: 'auto',
    tl: targetLanguage,
    dt: 't',
    q: text,
  });
  const response = await fetch(`https://translate.googleapis.com/translate_a/single?${parameters}`);
  if (!response.ok) throw new Error('The translation service is unavailable. Please try again.');

  const payload: unknown = await response.json();
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) {
    throw new Error('The translation service returned an unexpected response.');
  }
  const translation = payload[0]
    .map((entry) => (Array.isArray(entry) && typeof entry[0] === 'string' ? entry[0] : ''))
    .join('');
  if (!translation) throw new Error('The translation service returned an empty result.');
  return translation;
}

/**
 * A demo adapter. Translation sends full text to a machine-translation service; production apps
 * should replace it with their own server-side processor for provider control and privacy.
 */
export const demoProcessor: TextProcessor = async (text, mode, options) => {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [];
  const firstSentence = sentences[0]?.trim() || text.trim();

  if (mode === 'summarize') return sentences.slice(0, 2).join(' ').trim() || text.trim();
  if (mode === 'explain') return `In simpler terms: ${firstSentence}`;
  if (mode === 'rewrite') {
    return rewriteSimply(text);
  }
  if (mode === 'translate') {
    return translateSentence(text, options?.targetLanguage ?? '');
  }

  const words = text.match(/[A-Za-z]+/g) ?? [];
  const syllables = words.reduce(
    (total, word) => total + Math.max(1, (word.match(/[aeiouy]+/gi) ?? []).length),
    0,
  );
  const sentenceCount = Math.max(1, sentences.length);
  const grade = Math.max(
    1,
    Math.round(
      0.39 * (words.length / sentenceCount) +
        11.8 * (syllables / Math.max(1, words.length)) -
        15.59,
    ),
  );
  return `Estimated reading level: Grade ${grade} (a local Flesch-Kincaid-style estimate).`;
};
