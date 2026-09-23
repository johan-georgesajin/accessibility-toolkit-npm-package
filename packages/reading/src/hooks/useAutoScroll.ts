import { useCallback, useEffect, useState } from 'react';
import type { RefObject } from 'react';

export interface UseAutoScrollOptions {
  target?: RefObject<HTMLElement | null>;
  /** Scroll velocity in pixels per second. */
  pixelsPerSecond?: number;
}

export interface UseAutoScrollResult {
  isScrolling: boolean;
  start: () => void;
  stop: () => void;
}

/** Smoothly scroll a reading container without triggering React renders on every frame. */
export function useAutoScroll({
  target,
  pixelsPerSecond = 35,
}: UseAutoScrollOptions = {}): UseAutoScrollResult {
  const [isScrolling, setIsScrolling] = useState(false);
  const start = useCallback(() => setIsScrolling(true), []);
  const stop = useCallback(() => setIsScrolling(false), []);

  useEffect(() => {
    if (!isScrolling) return;
    let animationFrame = 0;
    let previousTime: number | undefined;

    const frame = (time: number) => {
      const elapsed = previousTime === undefined ? 0 : Math.min(50, time - previousTime);
      previousTime = time;
      const amount = (pixelsPerSecond * elapsed) / 1000;
      const container = target?.current;
      const before = container ? container.scrollTop : window.scrollY;
      if (container) container.scrollBy({ top: amount });
      else window.scrollBy({ top: amount });
      const after = container ? container.scrollTop : window.scrollY;
      if (elapsed > 0 && amount > 0 && after === before) {
        stop();
        return;
      }
      animationFrame = window.requestAnimationFrame(frame);
    };

    animationFrame = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [isScrolling, pixelsPerSecond, stop, target]);

  return { isScrolling, start, stop };
}
