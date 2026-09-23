export interface BionicSegment {
  text: string;
  bold: boolean;
}

/**
 * A lightweight English heuristic. It is intended as a readable aid, not a linguistic authority;
 * applications needing language-grade syllabification can replace it with a specialised adapter.
 */
export function splitSyllables(word: string): string[] {
  const match = word.match(/^(\W*)([A-Za-z]+)(\W*)$/);
  if (!match) return [word];
  const [, prefix, letters, suffix] = match;
  const vowels = /[aeiouy]/i;
  const syllables: string[] = [];
  let start = 0;

  for (let index = 0; index < letters.length; index += 1) {
    if (!vowels.test(letters[index])) continue;
    let vowelEnd = index + 1;
    while (vowelEnd < letters.length && vowels.test(letters[vowelEnd])) vowelEnd += 1;
    let consonantEnd = vowelEnd;
    while (consonantEnd < letters.length && !vowels.test(letters[consonantEnd])) consonantEnd += 1;
    if (consonantEnd === letters.length) break;
    const consonantCount = consonantEnd - vowelEnd;
    const splitAt = vowelEnd + (consonantCount > 1 ? consonantCount - 1 : 0);
    syllables.push(letters.slice(start, splitAt));
    start = splitAt;
    index = splitAt - 1;
  }

  syllables.push(letters.slice(start));
  syllables[0] = `${prefix}${syllables[0]}`;
  syllables[syllables.length - 1] = `${syllables[syllables.length - 1]}${suffix}`;
  return syllables.filter(Boolean);
}

export function syllabifyText(text: string, separator = '·'): string {
  return text.replace(/\b[A-Za-z]+\b/g, (word) => splitSyllables(word).join(separator));
}

/** Return safe render segments, leaving whitespace and punctuation unchanged. */
export function createBionicSegments(text: string, ratio = 0.5): BionicSegment[] {
  const clampedRatio = Math.min(1, Math.max(0, ratio));
  return text.split(/(\b[A-Za-z]+\b)/).flatMap((part) => {
    if (!/^[A-Za-z]+$/.test(part)) return [{ text: part, bold: false }];
    const boldLength = Math.max(1, Math.ceil(part.length * clampedRatio));
    return [
      { text: part.slice(0, boldLength), bold: true },
      { text: part.slice(boldLength), bold: false },
    ].filter((segment) => segment.text);
  });
}
