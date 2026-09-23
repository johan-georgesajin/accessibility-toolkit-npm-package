import type { TextProcessingOptions, TextProcessor } from '../ai/processText';
import { useTextProcessing, type TextProcessingStatus } from './useTextProcessing';

export interface UseSummarizeOptions {
  processor: TextProcessor;
  options?: TextProcessingOptions;
}

export interface UseSummarizeResult {
  status: TextProcessingStatus;
  result: string | null;
  error: Error | null;
  summarize: (text: string, options?: TextProcessingOptions) => Promise<string | null>;
  reset: () => void;
}

/**
 * Summarize text through an application-provided processor. Newer requests win, preventing a
 * slow response from overwriting the result for text the user has since changed.
 */
export function useSummarize({ processor, options }: UseSummarizeOptions): UseSummarizeResult {
  const textProcessing = useTextProcessing('summarize', { processor, options });
  return { ...textProcessing, summarize: textProcessing.process };
}
