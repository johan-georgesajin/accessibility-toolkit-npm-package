import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

/** Track the vertical scroll completion of a reading container (or the document when omitted). */
export function useReadingProgress(
  containerRef?: RefObject<HTMLElement | null>,
  enabled = true,
): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setProgress(0);
      return;
    }
    const container = containerRef?.current;
    let animationFrame = 0;
    let lastUpdate = 0;
    const update = () => {
      const now = performance.now();
      if (now - lastUpdate < 100) return;
      lastUpdate = now;
      if (container) {
        const availableScroll = container.scrollHeight - container.clientHeight;
        setProgress(
          availableScroll <= 0 ? 0 : Math.min(100, (container.scrollTop / availableScroll) * 100),
        );
        return;
      }
      const root = document.documentElement;
      const availableScroll = root.scrollHeight - window.innerHeight;
      setProgress(
        availableScroll <= 0 ? 0 : Math.min(100, (window.scrollY / availableScroll) * 100),
      );
    };

    update();
    const target: HTMLElement | Window = container ?? window;
    const scheduleUpdate = () => {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(() => {
          animationFrame = 0;
          update();
        });
      }
    };
    target.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      target.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', update);
    };
  }, [containerRef, enabled]);

  return progress;
}
