import { useEffect, useState } from 'react';

export interface ReadAloudControlProps {
  contentSelector?: string;
}

/** Reads the selected content area with the browser's built-in speech engine. */
export function ReadAloudControl({ contentSelector = 'main' }: ReadAloudControlProps) {
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const toggle = () => {
    if (!('speechSynthesis' in window)) return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const text = document.querySelector(contentSelector)?.textContent?.trim();
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button className="a11y-compact-toggle" type="button" aria-pressed={speaking} onClick={toggle}>
      {speaking ? 'Stop reading' : 'Read aloud'}
    </button>
  );
}
