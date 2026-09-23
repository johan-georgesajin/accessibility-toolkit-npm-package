import { useCallback, useRef, useState } from 'react';
import {
  processText,
  type TextProcessingMode,
  type TextProcessingOptions,
  type TextProcessor,
} from '../ai/processText';

export type TextProcessingStatus = 'idle' | 'processing' | 'success' | 'error';

export interface UseTextProcessingOptions {
  processor: TextProcessor;
  options?: TextProcessingOptions;
}

export interface UseTextProcessingResult {
  status: TextProcessingStatus;
  result: string | null;
  error: Error | null;
  process: (text: string, options?: TextProcessingOptions) => Promise<string | null>;
  reset: () => void;
}

/** Run one text-processing operation through an application-provided processor. */
export function useTextProcessing(
  mode: TextProcessingMode,
  { processor, options }: UseTextProcessingOptions,
): UseTextProcessingResult {
  const [status, setStatus] = useState<TextProcessingStatus>('idle');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const requestId = useRef(0);

  const process = useCallback(
    async (text: string, requestOptions?: TextProcessingOptions) => {
      const currentRequest = ++requestId.current;
      setStatus('processing');
      setError(null);
      try {
        const processed = await processText(text, mode, processor, {
          ...options,
          ...requestOptions,
        });
        if (currentRequest === requestId.current) {
          setResult(processed);
          setStatus('success');
        }
        return processed;
      } catch (reason) {
        const nextError = reason instanceof Error ? reason : new Error('Unable to process text.');
        if (currentRequest === requestId.current) {
          setError(nextError);
          setStatus('error');
        }
        return null;
      }
    },
    [mode, options, processor],
  );

  const reset = useCallback(() => {
    requestId.current += 1;
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, process, reset };
}
