import type { TextProcessingOptions, TextProcessor } from '../ai/processText';
import { useTextProcessing, type UseTextProcessingResult } from './useTextProcessing';

type ProcessorHookOptions = { processor: TextProcessor; options?: TextProcessingOptions };

export function useExplain(options: ProcessorHookOptions): UseTextProcessingResult {
  return useTextProcessing('explain', options);
}

export function useRewrite(options: ProcessorHookOptions): UseTextProcessingResult {
  return useTextProcessing('rewrite', options);
}

export function useTranslate(options: ProcessorHookOptions): UseTextProcessingResult {
  return useTextProcessing('translate', options);
}

export function useReadingLevelDetection(options: ProcessorHookOptions): UseTextProcessingResult {
  return useTextProcessing('detect-reading-level', options);
}
