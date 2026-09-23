import { useEffect, useState } from 'react';

interface LensState {
  x: number;
  y: number;
  text: string;
}

function textNearPointer(event: PointerEvent): string {
  const position = document.caretPositionFromPoint?.(event.clientX, event.clientY);
  if (position?.offsetNode.textContent) {
    const text = position.offsetNode.textContent.trim().replace(/\s+/g, ' ');
    const offset = Math.min(position.offset, text.length);
    return text.slice(Math.max(0, offset - 35), offset + 85);
  }

  const range = document.caretRangeFromPoint?.(event.clientX, event.clientY);
  if (range?.startContainer.textContent) {
    const text = range.startContainer.textContent.trim().replace(/\s+/g, ' ');
    return text.slice(Math.max(0, range.startOffset - 35), range.startOffset + 85);
  }

  return (
    document.elementFromPoint(event.clientX, event.clientY)?.textContent?.trim().slice(0, 120) ?? ''
  );
}

/** A pointer-following lens for readable text. Rendered only while magnification is enabled. */
export function AccessibilityMagnifier() {
  const [lens, setLens] = useState<LensState | null>(null);

  useEffect(() => {
    const updateLens = (event: PointerEvent) => {
      setLens({ x: event.clientX, y: event.clientY, text: textNearPointer(event) });
    };

    const hideLens = () => setLens(null);
    window.addEventListener('pointermove', updateLens, { passive: true });
    window.addEventListener('blur', hideLens);
    return () => {
      window.removeEventListener('pointermove', updateLens);
      window.removeEventListener('blur', hideLens);
    };
  }, []);

  if (!lens) return null;

  return (
    <div
      aria-hidden="true"
      className="a11y-magnifier"
      style={{ left: lens.x + 18, top: lens.y + 18 }}
    >
      <span>{lens.text || 'Move over text to magnify it'}</span>
    </div>
  );
}
