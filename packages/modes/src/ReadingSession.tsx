import { useEffect, useState } from 'react';
import { useAccessibility } from '@a11y-toolkit/core';

export interface ReadingSessionProps {
  /** Element whose scroll position represents reading progress. */
  contentSelector?: string;
}

/** Displays reading time and progress and optionally advances the reading area. */
export function ReadingSession({ contentSelector = 'main' }: ReadingSessionProps) {
  const { preferences } = useAccessibility();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [progress, setProgress] = useState(0);
  const reading = preferences.reading;
  const active = Boolean(reading.readingTimer || reading.showProgress || reading.autoScroll);

  useEffect(() => {
    if (!active) {
      setElapsedSeconds(0);
      setProgress(0);
      return;
    }
    const startedAt = Date.now();
    const update = () => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
      const element = document.querySelector<HTMLElement>(contentSelector);
      const top = element ? element.getBoundingClientRect().top + window.scrollY : 0;
      const total = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      setProgress(Math.min(100, Math.max(0, ((window.scrollY - top) / total) * 100)));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    const timer = window.setInterval(update, 1000);
    return () => {
      window.removeEventListener('scroll', update);
      window.clearInterval(timer);
    };
  }, [active, contentSelector]);

  if (!active) return null;
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = String(elapsedSeconds % 60).padStart(2, '0');
  return (
    <section className="a11y-reading-session" aria-label="Reading session" aria-live="polite">
      {reading.readingTimer && (
        <span>
          Reading time: {minutes}:{seconds}
        </span>
      )}
      {reading.autoScroll && <span>Auto-scroll is on</span>}
      {reading.showProgress && (
        <label>
          Reading progress
          <progress value={progress} max="100">
            {Math.round(progress)}%
          </progress>
        </label>
      )}
    </section>
  );
}
