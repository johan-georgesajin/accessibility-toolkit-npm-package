import { useMemo, useState } from 'react';
import { useAccessibility } from '@a11y-toolkit/core';

export interface AccessibleReadingTextProps {
  text: string;
  label?: string;
}

function syllabify(word: string) {
  return word.replace(/([aeiouy]+)(?=[^aeiouy])/gi, '$1·');
}

/** Renders readable text with Dyslexia-mode formatting and Web Speech highlighting. */
export function AccessibleReadingText({
  text,
  label = 'Reading text',
}: AccessibleReadingTextProps) {
  const { preferences } = useAccessibility();
  const [currentWord, setCurrentWord] = useState<number | null>(null);
  const words = useMemo(() => text.match(/\S+/g) ?? [], [text]);
  const reading = preferences.reading;

  const readAloud = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onboundary = (event) => {
      const prefix = text.slice(0, event.charIndex);
      setCurrentWord(Math.max(0, prefix.match(/\S+/g)?.length ?? 0));
    };
    utterance.onend = () => setCurrentWord(null);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section
      className={
        reading.coloredOverlay ? 'a11y-reading-text a11y-colored-overlay' : 'a11y-reading-text'
      }
      aria-label={label}
    >
      <p>
        {words.map((word, index) => {
          const visible = reading.syllableSplitting ? syllabify(word) : word;
          const midpoint = Math.ceil(visible.length / 2);
          return (
            <span
              key={`${word}-${index}`}
              className={currentWord === index ? 'a11y-current-word' : undefined}
            >
              {reading.bionicReading ? (
                <>
                  <strong>{visible.slice(0, midpoint)}</strong>
                  {visible.slice(midpoint)}
                </>
              ) : (
                visible
              )}{' '}
            </span>
          );
        })}
      </p>
      <button type="button" onClick={readAloud}>
        Read aloud
      </button>
    </section>
  );
}
