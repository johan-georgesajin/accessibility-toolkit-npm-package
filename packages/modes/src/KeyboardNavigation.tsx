import { useEffect } from 'react';
import type { PropsWithChildren, RefObject } from 'react';
export function SkipLink({
  targetId,
  children = 'Skip to main content',
}: { targetId: string } & PropsWithChildren) {
  return <a href={`#${targetId}`}>{children}</a>;
}
export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active || !containerRef.current) return;
    const container = containerRef.current;
    const handle = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const items = Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!items.length) return;
      if (event.shiftKey && document.activeElement === items[0]) {
        event.preventDefault();
        items.at(-1)?.focus();
      } else if (!event.shiftKey && document.activeElement === items.at(-1)) {
        event.preventDefault();
        items[0]?.focus();
      }
    };
    container.addEventListener('keydown', handle);
    return () => container.removeEventListener('keydown', handle);
  }, [active, containerRef]);
}
