import { useEffect } from 'react';
import { useAccessibility } from '@a11y-toolkit/core';
export interface InteractionEffectsProps {
  contentSelector?: string;
}
export function InteractionEffects({ contentSelector = 'main' }: InteractionEffectsProps) {
  const { preferences } = useAccessibility();
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const enabled = preferences.interaction.distractionFree === true;
    const content = document.querySelector<HTMLElement>(contentSelector);
    document.documentElement.toggleAttribute('data-a11y-distraction-free', enabled);
    content?.toggleAttribute('data-a11y-focus-content', enabled);
    return () => {
      document.documentElement.removeAttribute('data-a11y-distraction-free');
      content?.removeAttribute('data-a11y-focus-content');
    };
  }, [contentSelector, preferences.interaction.distractionFree]);
  return null;
}
