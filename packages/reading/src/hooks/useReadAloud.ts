import { useCallback, useEffect, useRef, useState } from 'react';
import { useAccessibility } from '@a11y-toolkit/core';
import {
  SpeechController,
  getSelectedText,
  type ReadAloudOptions,
  type ReadAloudState,
} from '../speech/speech';

export type UseReadAloudOptions = ReadAloudOptions;

export interface UseReadAloudResult extends ReadAloudState {
  speak: (text: string) => boolean;
  speakSelection: () => boolean;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
  voices: SpeechSynthesisVoice[];
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setEnabled: (enabled: boolean) => void;
}

/** Read text through the browser's Web Speech API and persist user speech settings in core. */
export function useReadAloud(options: UseReadAloudOptions = {}): UseReadAloudResult {
  const { preferences, updatePreferences } = useAccessibility();
  const controllerRef = useRef<SpeechController | null>(null);
  if (!controllerRef.current) controllerRef.current = new SpeechController();

  const controller = controllerRef.current;
  const [state, setState] = useState<ReadAloudState>(controller.getState());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => controller.getVoices());

  useEffect(() => {
    const unsubscribe = controller.subscribe(setState);
    const synthesis = typeof window === 'undefined' ? null : window.speechSynthesis;
    const updateVoices = () => setVoices(controller.getVoices());
    synthesis?.addEventListener('voiceschanged', updateVoices);
    updateVoices();
    return () => {
      synthesis?.removeEventListener('voiceschanged', updateVoices);
      unsubscribe();
      controller.cancel();
    };
  }, [controller]);

  const speak = useCallback(
    (text: string) => {
      const didStart = controller.speak(text, {
        ...options,
        rate: options.rate ?? preferences.reading.ttsRate,
        pitch: options.pitch ?? preferences.reading.ttsPitch,
      });
      if (didStart && !preferences.reading.ttsEnabled) {
        updatePreferences({ reading: { ...preferences.reading, ttsEnabled: true } });
      }
      return didStart;
    },
    [controller, options, preferences.reading, updatePreferences],
  );

  const speakSelection = useCallback(() => speak(getSelectedText()), [speak]);

  const setRate = useCallback(
    (rate: number) => {
      const clampedRate = Math.min(10, Math.max(0.1, rate));
      updatePreferences({ reading: { ...preferences.reading, ttsRate: clampedRate } });
    },
    [preferences.reading, updatePreferences],
  );

  const setPitch = useCallback(
    (pitch: number) => {
      const clampedPitch = Math.min(2, Math.max(0, pitch));
      updatePreferences({ reading: { ...preferences.reading, ttsPitch: clampedPitch } });
    },
    [preferences.reading, updatePreferences],
  );

  const setEnabled = useCallback(
    (enabled: boolean) =>
      updatePreferences({ reading: { ...preferences.reading, ttsEnabled: enabled } }),
    [preferences.reading, updatePreferences],
  );

  return {
    ...state,
    speak,
    speakSelection,
    pause: () => controller.pause(),
    resume: () => controller.resume(),
    cancel: () => controller.cancel(),
    voices,
    setRate,
    setPitch,
    setEnabled,
  };
}
