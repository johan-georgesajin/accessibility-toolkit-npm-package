/** Operations that an application-provided AI/text service can support. */
export type TextProcessingMode =
  'summarize' | 'explain' | 'rewrite' | 'translate' | 'detect-reading-level';

export interface TextProcessingOptions {
  /** Target language for translation, such as `es` or `hi`. */
  targetLanguage?: string;
  /** Optional context, for example the audience or desired reading level. */
  instructions?: string;
}

/**
 * The adapter boundary for AI providers. Consumers can call OpenAI, a private backend, or a
 * local model here; the reading package never receives provider credentials itself.
 */
export type TextProcessor = (
  text: string,
  mode: TextProcessingMode,
  options?: TextProcessingOptions,
) => Promise<string>;

function validateRequest(
  text: string,
  mode: TextProcessingMode,
  options?: TextProcessingOptions,
): void {
  if (!text.trim()) throw new Error('Text to process cannot be empty.');
  if (mode === 'translate' && !options?.targetLanguage) {
    throw new Error('Translation requires a targetLanguage option.');
  }
}

/** Validate a request and delegate it to the application-provided processor. */
export async function processText(
  text: string,
  mode: TextProcessingMode,
  processor: TextProcessor,
  options?: TextProcessingOptions,
): Promise<string> {
  validateRequest(text, mode, options);
  const result = await processor(text, mode, options);
  if (!result.trim()) throw new Error('The text processor returned an empty result.');
  return result;
}
