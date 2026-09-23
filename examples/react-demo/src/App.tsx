import { useAccessibility } from '@a11y-toolkit/core';

export function App() {
  const { preferences } = useAccessibility();

  return (
    <main>
      <p className="eyebrow">Week 0 integration fixture</p>
      <h1>A11y Toolkit</h1>
      <p>
        The shared <code>AccessibilityProvider</code> is running. Track 1 controls will be rendered
        here once implemented.
      </p>
      <dl>
        <div>
          <dt>Storage schema</dt>
          <dd>v{preferences.version}</dd>
        </div>
        <div>
          <dt>Visual font size</dt>
          <dd>{preferences.visual.fontSize}px</dd>
        </div>
      </dl>
    </main>
  );
}
