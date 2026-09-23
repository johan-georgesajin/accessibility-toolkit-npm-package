import { useEffect, useRef } from 'react';

export interface ReadingRulerProps {
  enabled: boolean;
  height?: number;
  color?: string;
}

/** A non-interactive, pointer-following focus strip for the current reading line. */
export function ReadingRuler({
  enabled,
  height = 44,
  color = 'rgb(250 204 21 / 28%)',
}: ReadingRulerProps) {
  const rulerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const followPointer = (event: PointerEvent) => {
      if (rulerRef.current)
        rulerRef.current.style.transform = `translateY(${event.clientY - height / 2}px)`;
    };
    window.addEventListener('pointermove', followPointer, { passive: true });
    return () => window.removeEventListener('pointermove', followPointer);
  }, [enabled, height]);

  if (!enabled) return null;
  return (
    <div
      aria-hidden="true"
      style={{
        background: color,
        height,
        left: 0,
        pointerEvents: 'none',
        position: 'fixed',
        right: 0,
        top: 0,
        transform: `translateY(${typeof window === 'undefined' ? 0 : window.innerHeight / 2 - height / 2}px)`,
        zIndex: 1000,
      }}
      ref={rulerRef}
    />
  );
}
