export type ReadAloudStatus = 'idle' | 'speaking' | 'paused' | 'unsupported' | 'error';

export interface ReadAloudOptions {
  lang?: string;
  pitch?: number;
  rate?: number;
  voiceURI?: string;
}

export interface ReadAloudState {
  status: ReadAloudStatus;
  /** Character offset in the spoken text, updated by browser word-boundary events. */
  charIndex: number;
  text: string;
  error: Error | null;
}

export function getSelectedText(): string {
  return typeof window === 'undefined' ? '' : (window.getSelection()?.toString().trim() ?? '');
}

export function getCurrentWordRange(text: string, charIndex: number): [number, number] | null {
  if (charIndex < 0 || charIndex >= text.length) return null;
  let start = charIndex;
  let end = charIndex;
  while (start > 0 && !/\s/.test(text[start - 1])) start -= 1;
  while (end < text.length && !/\s/.test(text[end])) end += 1;
  return start === end ? null : [start, end];
}

type StateListener = (state: ReadAloudState) => void;

const INITIAL_STATE: ReadAloudState = { status: 'idle', charIndex: 0, text: '', error: null };

function speechSynthesisApi(): SpeechSynthesis | null {
  return typeof window === 'undefined' || !('speechSynthesis' in window)
    ? null
    : window.speechSynthesis;
}

/**
 * A small Web Speech API adapter. It deliberately has no React dependency so it can also be
 * used from a non-React integration later.
 */
export class SpeechController {
  private readonly listeners = new Set<StateListener>();
  private state: ReadAloudState = INITIAL_STATE;

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  getState(): ReadAloudState {
    return this.state;
  }

  speak(text: string, options: ReadAloudOptions = {}): boolean {
    const synthesis = speechSynthesisApi();
    if (!synthesis) {
      this.setState({ status: 'unsupported', charIndex: 0, text: '', error: null });
      return false;
    }

    const normalizedText = text.trim();
    if (!normalizedText) return false;

    synthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(normalizedText);
    utterance.lang = options.lang ?? (document.documentElement.lang || navigator.language);
    utterance.rate = options.rate ?? 1;
    utterance.pitch = options.pitch ?? 1;

    if (options.voiceURI) {
      utterance.voice =
        synthesis.getVoices().find((voice) => voice.voiceURI === options.voiceURI) ?? null;
    }

    utterance.onstart = () =>
      this.setState({ status: 'speaking', charIndex: 0, text: normalizedText, error: null });
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        this.setState({ ...this.state, charIndex: event.charIndex });
      }
    };
    utterance.onend = () => this.setState(INITIAL_STATE);
    utterance.onerror = (event) => {
      if (event.error === 'canceled' || event.error === 'interrupted') return;
      this.setState({
        status: 'error',
        charIndex: 0,
        text: normalizedText,
        error: new Error(event.error),
      });
    };

    synthesis.speak(utterance);
    return true;
  }

  pause(): void {
    const synthesis = speechSynthesisApi();
    if (!synthesis || !synthesis.speaking) return;
    synthesis.pause();
    this.setState({ ...this.state, status: 'paused' });
  }

  resume(): void {
    const synthesis = speechSynthesisApi();
    if (!synthesis || !synthesis.paused) return;
    synthesis.resume();
    this.setState({ ...this.state, status: 'speaking' });
  }

  cancel(): void {
    speechSynthesisApi()?.cancel();
    this.setState(INITIAL_STATE);
  }

  getVoices(): SpeechSynthesisVoice[] {
    return speechSynthesisApi()?.getVoices() ?? [];
  }

  private setState(state: ReadAloudState): void {
    this.state = state;
    this.listeners.forEach((listener) => listener(state));
  }
}
