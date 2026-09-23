import { useEffect, useRef, useState } from 'react';
import { useAccessibility } from '@a11y-toolkit/core';
import { AccessibilityPanel } from '@a11y-toolkit/visual';
import { InteractionEffects } from '@a11y-toolkit/modes';
import {
  createBionicSegments,
  getCurrentWordRange,
  ReadingRuler,
  syllabifyText,
  useAutoScroll,
  useExplain,
  useReadingLevelDetection,
  useReadingProgress,
  useReadAloud,
  useRewrite,
  useSummarize,
  useTranslate,
} from '@a11y-toolkit/reading';
import { demoProcessor } from './demoProcessor';

const SAMPLE_TEXT =
  'Welcome to the accessibility toolkit reading workspace. Paste any text, then use the reading tools to listen, simplify, translate, or change how the text is displayed.';

function ProcessorResult({ result, error }: { result: string | null; error: Error | null }) {
  if (error)
    return (
      <p className="error" role="alert">
        {error.message}
      </p>
    );
  return result ? <p className="tool-result">{result}</p> : null;
}

export function App() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [isReadingView, setIsReadingView] = useState(false);
  const [language, setLanguage] = useState('es');
  const readingRef = useRef<HTMLElement>(null);
  const { preferences, updatePreferences } = useAccessibility();
  const {
    status,
    charIndex,
    text: spokenText,
    error,
    speak,
    speakSelection,
    pause,
    resume,
    cancel,
    setRate,
    setPitch,
  } = useReadAloud();
  const summary = useSummarize({ processor: demoProcessor });
  const explain = useExplain({ processor: demoProcessor });
  const rewrite = useRewrite({ processor: demoProcessor });
  const translate = useTranslate({ processor: demoProcessor });
  const readingLevel = useReadingLevelDetection({ processor: demoProcessor });
  const progress = useReadingProgress(readingRef, isReadingView);
  const {
    isScrolling,
    start: startAutoScroll,
    stop: stopAutoScroll,
  } = useAutoScroll({
    target: readingRef,
    pixelsPerSecond: 28,
  });
  const isSpeaking = status === 'speaking';
  const isPaused = status === 'paused';
  const activeText = isSpeaking || isPaused ? spokenText : text;
  const activeRange = isSpeaking || isPaused ? getCurrentWordRange(activeText, charIndex) : null;
  const displayMode = preferences.reading.bionicReadingEnabled
    ? 'bionic'
    : preferences.reading.syllableSplittingEnabled
      ? 'syllables'
      : 'plain';
  const updateReading = (patch: Partial<typeof preferences.reading>) =>
    updatePreferences({ reading: { ...preferences.reading, ...patch } });

  useEffect(() => {
    if (!isReadingView) {
      stopAutoScroll();
      return;
    }
    if (preferences.reading.autoScrollEnabled) startAutoScroll();
    else stopAutoScroll();
  }, [isReadingView, preferences.reading.autoScrollEnabled, startAutoScroll, stopAutoScroll]);

  const renderReadingText = () => {
    if (activeRange) {
      return (
        <>
          {activeText.slice(0, activeRange[0])}
          <mark>{activeText.slice(activeRange[0], activeRange[1])}</mark>
          {activeText.slice(activeRange[1])}
        </>
      );
    }
    if (displayMode === 'syllables') return syllabifyText(activeText);
    if (displayMode === 'bionic') {
      return createBionicSegments(activeText).map((segment, index) =>
        segment.bold ? (
          <strong key={index}>{segment.text}</strong>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      );
    }
    return activeText;
  };

  return (
    <main className="demo-app">
      <InteractionEffects />
      <header className="demo-hero">
        <p className="eyebrow">accessibility-toolkit · integrated demo</p>
        <h1>Accessibility workspace</h1>
        <p className="intro">
          Write or paste text, then move into one focused space for reading, speech, AI help, and
          display tools. Open the accessibility button in the bottom-right corner for page-wide
          modes and the WCAG scanner.
        </p>
      </header>

      <section className="workspace" aria-label="Reading workspace">
        {!isReadingView ? (
          <div className="editor-view">
            <label htmlFor="speech-text">Text to read</label>
            <textarea
              id="speech-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={12}
            />
            <button type="button" onClick={() => setIsReadingView(true)} disabled={!text.trim()}>
              Start reading
            </button>
          </div>
        ) : (
          <>
            <div className="workspace-header">
              <div>
                <h2>Reading view</h2>
                <p>
                  Status: {status}
                  {error ? ` - ${error.message}` : ''}
                </p>
              </div>
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  cancel();
                  setIsReadingView(false);
                }}
              >
                Edit text
              </button>
            </div>

            <article
              ref={readingRef}
              className="reading-surface"
              tabIndex={0}
              aria-label="Reading text"
            >
              <p>{renderReadingText()}</p>
            </article>
            <div className="progress-row">
              <span>Progress</span>
              <output>{Math.round(progress)}%</output>
            </div>
            <div className="progress-track" aria-hidden="true">
              <span style={{ width: `${progress}%` }} />
            </div>
          </>
        )}
      </section>
      <ReadingRuler enabled={preferences.reading.rulerEnabled && isReadingView} />
      <AccessibilityPanel onOcrTextExtracted={setText}>
        <section className="demo-panel-tools" aria-labelledby="demo-panel-tools-heading">
          <h3 id="demo-panel-tools-heading">Reading and text tools</h3>
          <p>These controls apply to the text in this demo.</p>
          <div className="demo-panel-button-grid" aria-label="Reading controls">
            <button type="button" onClick={() => speak(text)} disabled={!text.trim() || isSpeaking}>
              Read aloud
            </button>
            <button type="button" onClick={speakSelection} disabled={isSpeaking}>
              Read selection
            </button>
            <button type="button" onClick={pause} disabled={!isSpeaking}>
              Pause
            </button>
            <button type="button" onClick={resume} disabled={!isPaused}>
              Resume
            </button>
            <button type="button" onClick={cancel} disabled={status === 'idle'}>
              Stop
            </button>
            <button
              type="button"
              onClick={() => updateReading({ rulerEnabled: !preferences.reading.rulerEnabled })}
            >
              {preferences.reading.rulerEnabled ? 'Hide ruler' : 'Show ruler'}
            </button>
            <button
              type="button"
              onClick={() =>
                updateReading({ autoScrollEnabled: !preferences.reading.autoScrollEnabled })
              }
            >
              {isScrolling ? 'Stop auto-scroll' : 'Auto-scroll'}
            </button>
            <button
              type="button"
              onClick={() =>
                updateReading({
                  syllableSplittingEnabled: displayMode !== 'syllables',
                  bionicReadingEnabled: false,
                })
              }
            >
              {displayMode === 'syllables' ? 'Plain text' : 'Syllables'}
            </button>
            <button
              type="button"
              onClick={() =>
                updateReading({
                  bionicReadingEnabled: displayMode !== 'bionic',
                  syllableSplittingEnabled: false,
                })
              }
            >
              {displayMode === 'bionic' ? 'Plain text' : 'Bionic reading'}
            </button>
          </div>
          <div className="demo-panel-sliders" aria-label="Speech settings">
            <label htmlFor="rate">
              Rate <output>{preferences.reading.ttsRate.toFixed(1)}x</output>
            </label>
            <input
              id="rate"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={preferences.reading.ttsRate}
              onChange={(event) => setRate(Number(event.target.value))}
            />
            <label htmlFor="pitch">
              Pitch <output>{preferences.reading.ttsPitch.toFixed(1)}</output>
            </label>
            <input
              id="pitch"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={preferences.reading.ttsPitch}
              onChange={(event) => setPitch(Number(event.target.value))}
            />
          </div>
          <div className="demo-panel-text-tools" aria-label="Text tools">
            <button
              type="button"
              onClick={() => void summary.summarize(text)}
              disabled={summary.status === 'processing'}
            >
              {summary.status === 'processing' ? 'Summarizing...' : 'Summarize'}
            </button>
            <ProcessorResult result={summary.result} error={summary.error} />
            <button
              type="button"
              onClick={() => void explain.process(text)}
              disabled={explain.status === 'processing'}
            >
              {explain.status === 'processing' ? 'Explaining...' : 'Explain'}
            </button>
            <ProcessorResult result={explain.result} error={explain.error} />
            <button
              type="button"
              onClick={() => void rewrite.process(text)}
              disabled={rewrite.status === 'processing'}
            >
              {rewrite.status === 'processing' ? 'Rewriting...' : 'Rewrite simply'}
            </button>
            <ProcessorResult result={rewrite.result} error={rewrite.error} />
            <label htmlFor="language">Translate to</label>
            <select
              id="language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value="es">Spanish</option>
              <option value="hi">Hindi</option>
              <option value="fr">French</option>
            </select>
            <button
              type="button"
              onClick={() => void translate.process(text, { targetLanguage: language })}
              disabled={translate.status === 'processing'}
            >
              {translate.status === 'processing' ? 'Translating...' : 'Translate'}
            </button>
            <ProcessorResult result={translate.result} error={translate.error} />
            <button
              type="button"
              onClick={() => void readingLevel.process(text)}
              disabled={readingLevel.status === 'processing'}
            >
              {readingLevel.status === 'processing' ? 'Checking...' : 'Reading level'}
            </button>
            <ProcessorResult result={readingLevel.result} error={readingLevel.error} />
          </div>
        </section>
      </AccessibilityPanel>
    </main>
  );
}
